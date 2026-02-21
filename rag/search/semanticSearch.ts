import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { ScoredPoint } from '@qdrant/js-client-rest';

export interface SearchResult {
  text: string;
  score: number;
  source: string;
  category: string;
  sector?: string;
  title: string;
}

export interface SearchOptions {
  query: string;
  topK?: number;
  category?: string;
  sector?: string;
  minScore?: number;
}

/**
 * Moteur de recherche sémantique pour le RAG
 */
export class SemanticSearch {
  private embeddings: OpenAIEmbeddings;
  private qdrant: QdrantClient;
  private collectionName = 'finops_knowledge';

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENROUTER_API_KEY,
      modelName: 'openai/text-embedding-3-small',
    });

    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }

  /**
   * Recherche sémantique avec filtres optionnels
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, topK = 5, category, sector, minScore = 0.75 } = options;

    // Générer l'embedding de la requête
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Construire les filtres
    const filter: any = {};
    if (category || sector) {
      filter.must = [];
      if (category) {
        filter.must.push({
          key: 'category',
          match: { value: category },
        });
      }
      if (sector) {
        filter.must.push({
          key: 'sector',
          match: { value: sector },
        });
      }
    }

    // Recherche vectorielle
    const results = await this.qdrant.search(this.collectionName, {
      vector: queryEmbedding,
      limit: topK,
      score_threshold: minScore,
      filter: filter.must ? filter : undefined,
      with_payload: true,
    });

    return results.map((point: ScoredPoint) => ({
      text: point.payload?.text as string,
      score: point.score || 0,
      source: point.payload?.source as string,
      category: point.payload?.category as string,
      sector: point.payload?.sector as string | undefined,
      title: point.payload?.title as string,
    }));
  }

  /**
   * Recherche hybride (sémantique + mots-clés)
   * Pour améliorer la précision sur termes techniques spécifiques
   */
  async hybridSearch(options: SearchOptions): Promise<SearchResult[]> {
    // Recherche sémantique
    const semanticResults = await this.search(options);

    // TODO: Ajouter recherche mot-clé avec Elasticsearch/OpenSearch
    // pour couvrir les cas où l'embedding rate (termes très spécifiques)

    return semanticResults;
  }

  /**
   * Recherche par similarité de document
   * Utile pour "trouver des analyses similaires"
   */
  async findSimilar(
    documentText: string,
    topK: number = 3
  ): Promise<SearchResult[]> {
    const docEmbedding = await this.embeddings.embedQuery(documentText);

    const results = await this.qdrant.search(this.collectionName, {
      vector: docEmbedding,
      limit: topK,
      score_threshold: 0.85, // Seuil élevé pour similarité forte
      with_payload: true,
    });

    return results.map((point: ScoredPoint) => ({
      text: point.payload?.text as string,
      score: point.score || 0,
      source: point.payload?.source as string,
      category: point.payload?.category as string,
      sector: point.payload?.sector as string | undefined,
      title: point.payload?.title as string,
    }));
  }
}

// Exemple d'utilisation
async function example() {
  const search = new SemanticSearch();

  // Recherche simple
  const results = await search.search({
    query: "ratio liquidité restaurant",
    topK: 3,
    sector: "restauration",
  });

  console.log('Résultats:', results);
}
