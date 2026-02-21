import { SemanticSearch, SearchResult } from '../search/semanticSearch';

export interface RAGContext {
  documents: SearchResult[];
  contextString: string;
  sources: string[];
  confidence: number;
}

export interface GenerationOptions {
  userQuery: string;
  conversationHistory?: string[];
  maxContextTokens?: number;
  includeSources?: boolean;
}

/**
 * Assembleur de contexte RAG pour enrichir les réponses LLM
 */
export class RAGContextBuilder {
  private search: SemanticSearch;
  private maxTokens: number;

  constructor(maxTokens: number = 4000) {
    this.search = new SemanticSearch();
    this.maxTokens = maxTokens;
  }

  /**
   * Construit le contexte RAG complet pour une requête
   */
  async buildContext(options: GenerationOptions): Promise<RAGContext> {
    const { userQuery, maxContextTokens = this.maxTokens } = options;

    // 1. Recherche des documents pertinents
    const searchResults = await this.search.search({
      query: userQuery,
      topK: 5,
      minScore: 0.7,
    });

    // 2. Filtrer et classer par pertinence
    const filteredResults = this.deduplicateAndRank(searchResults);

    // 3. Construire le contexte formaté
    const contextString = this.formatContext(filteredResults, maxContextTokens);

    // 4. Calculer le score de confiance
    const confidence = this.calculateConfidence(filteredResults);

    return {
      documents: filteredResults,
      contextString,
      sources: [...new Set(filteredResults.map(r => r.source))],
      confidence,
    };
  }

  /**
   * Génère le prompt complet avec contexte RAG
   */
  async generatePrompt(options: GenerationOptions): Promise<string> {
    const ragContext = await this.buildContext(options);

    const systemPrompt = `Tu es un analyste financier expert CPA. 
Utilise le contexte fourni ci-dessous pour enrichir ta réponse.
Si le contexte ne contient pas l'information, base-toi sur tes connaissances générales
mais mentionne que l'information n'est pas dans la base de connaissances.

Contexte pertinent:
${ragContext.contextString}

Sources: ${ragContext.sources.join(', ')}
Confiance: ${(ragContext.confidence * 100).toFixed(0)}%

Question de l'utilisateur:
${options.userQuery}`;

    return systemPrompt;
  }

  /**
   * Déduplique et classe les résultats
   */
  private deduplicateAndRank(results: SearchResult[]): SearchResult[] {
    // Grouper par source et garder le meilleur score
    const grouped = new Map<string, SearchResult>();

    for (const result of results) {
      const existing = grouped.get(result.source);
      if (!existing || existing.score < result.score) {
        grouped.set(result.source, result);
      }
    }

    // Trier par score décroissant
    return Array.from(grouped.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Formate le contexte en respectant la limite de tokens
   */
  private formatContext(
    results: SearchResult[],
    maxTokens: number
  ): string {
    let context = '';
    let estimatedTokens = 0;
    const tokensPerChar = 0.25; // Approximation

    for (const result of results) {
      const section = `\n[${result.category}] ${result.title}\n${result.text}\n`;
      const sectionTokens = section.length * tokensPerChar;

      if (estimatedTokens + sectionTokens > maxTokens) {
        break;
      }

      context += section;
      estimatedTokens += sectionTokens;
    }

    return context || 'Aucun contexte pertinent trouvé.';
  }

  /**
   * Calcule un score de confiance global
   */
  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;
    
    // Moyenne pondérée par score
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    // Bonus si plusieurs sources différentes
    const uniqueSources = new Set(results.map(r => r.source)).size;
    const diversityBonus = Math.min(uniqueSources * 0.1, 0.2);
    
    return Math.min(avgScore + diversityBonus, 1.0);
  }
}

/**
 * Intégration avec le pipeline 3-paliers
 */
export async function generateWithRAG(
  userQuery: string,
  phase: 'phase1' | 'phase2' | 'phase3'
): Promise<{ response: string; context: RAGContext }> {
  const ragBuilder = new RAGContextBuilder();

  // Construire le contexte
  const prompt = await ragBuilder.generatePrompt({
    userQuery,
    maxContextTokens: phase === 'phase1' ? 2000 : 4000,
  });

  // Le contexte est maintenant prêt à être envoyé au LLM
  // selon la phase du pipeline

  return {
    response: prompt, // À remplacer par l'appel LLM réel
    context: await ragBuilder.buildContext({ userQuery }),
  };
}

// Exemple d'intégration
export const RAG_EXAMPLE = `
// Utilisation dans le pipeline
import { generateWithRAG } from './rag/context-builder/ragAugmentedGeneration';

// Phase 2 (DeepSeek) avec RAG
async function phase2WithRAG(userQuery: string) {
  const { response, context } = await generateWithRAG(userQuery, 'phase2');
  
  // Enrichir le prompt DeepSeek avec le contexte RAG
  const enrichedPrompt = \`
    \${response}
    
    Base ta réponse sur le contexte fourni ci-dessus.
    Cite les sources quand tu utilises des données du contexte.
  \`;
  
  return await callDeepSeek(enrichedPrompt);
}
`;
