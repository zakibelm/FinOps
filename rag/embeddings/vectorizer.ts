import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { parseMarkdown } from './parsers/markdown';

/**
 * Vectorise les documents de la knowledge base
 * Utilise OpenAI embeddings (1536 dims) ou modèle local
 */
export class DocumentVectorizer {
  private embeddings: OpenAIEmbeddings;
  private qdrant: QdrantClient;
  private collectionName = 'finops_knowledge';

  constructor() {
    // OpenRouter supporte aussi les embeddings
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENROUTER_API_KEY,
      modelName: 'openai/text-embedding-3-small', // 1536 dims, économique
    });

    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }

  /**
   * Initialise la collection Qdrant
   */
  async initCollection(): Promise<void> {
    const collections = await this.qdrant.getCollections();
    const exists = collections.collections.some(
      c => c.name === this.collectionName
    );

    if (!exists) {
      await this.qdrant.createCollection(this.collectionName, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Index pour filtres
      await this.qdrant.createPayloadIndex(this.collectionName, {
        field_name: 'category',
        field_schema: 'keyword',
      });

      await this.qdrant.createPayloadIndex(this.collectionName, {
        field_name: 'sector',
        field_schema: 'keyword',
      });

      console.log(`✅ Collection ${this.collectionName} créée`);
    }
  }

  /**
   * Vectorise tous les documents du dossier knowledge-base
   */
  async vectorizeAll(): Promise<void> {
    await this.initCollection();

    const files = await glob('knowledge-base/**/*.{md,txt,json}');
    console.log(`📚 ${files.length} documents trouvés`);

    for (const file of files) {
      try {
        await this.vectorizeFile(file);
        console.log(`✅ ${file}`);
      } catch (error) {
        console.error(`❌ ${file}:`, error);
      }
    }

    console.log('🎉 Vectorisation terminée !');
  }

  /**
   * Vectorise un fichier individuel
   */
  private async vectorizeFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const chunks = this.chunkDocument(content, filePath);

    for (const chunk of chunks) {
      const embedding = await this.embeddings.embedQuery(chunk.text);

      await this.qdrant.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: this.generateId(),
            vector: embedding,
            payload: {
              text: chunk.text,
              source: filePath,
              category: chunk.category,
              sector: chunk.sector,
              title: chunk.title,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });
    }
  }

  /**
   * Découpe un document en chunks intelligents
   */
  private chunkDocument(
    content: string,
    filePath: string
  ): Array<{
    text: string;
    category: string;
    sector?: string;
    title: string;
  }> {
    // Parsing spécifique au type de fichier
    if (filePath.includes('subsidies')) {
      return parseMarkdown.subsidies(content, filePath);
    } else if (filePath.includes('ratios')) {
      return parseMarkdown.benchmarks(content, filePath);
    } else {
      return parseMarkdown.generic(content, filePath);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// CLI
if (require.main === module) {
  const vectorizer = new DocumentVectorizer();
  vectorizer.vectorizeAll().catch(console.error);
}
