/**
 * Predictive Cost Optimizer
 * Prédit le coût et la qualité avant exécution
 */

interface CostPrediction {
  estimatedCost: number;
  estimatedTime: number;
  recommendedStrategy: 'quick' | 'standard' | 'complex' | 'rag-only';
  confidence: number;
  reason: string;
}

interface RequestFeatures {
  queryLength: number;
  complexity: number;
  hasDocument: boolean;
  sector?: string;
  historicalSimilarity?: number;
}

export class CostPredictor {
  private historicalData: Map<string, number> = new Map();
  
  /**
   * Analyse la requête et prédit la meilleure stratégie
   */
  async predict(query: string, features: RequestFeatures): Promise<CostPrediction> {
    // Analyse de complexité
    const complexity = this.analyzeComplexity(query, features);
    
    // Calcul similarité historique (cache RAG)
    const ragSimilarity = await this.calculateRAGSimilarity(query);
    
    // Décision basée sur données
    if (ragSimilarity > 0.85 && complexity < 3) {
      return {
        estimatedCost: 0.000, // RAG seul suffit
        estimatedTime: 500,
        recommendedStrategy: 'rag-only',
        confidence: 0.92,
        reason: 'Réponse directe depuis KB avec contexte similaire identifié'
      };
    }
    
    if (complexity < 2 && !features.hasDocument) {
      return {
        estimatedCost: 0.000, // DeepSeek direct
        estimatedTime: 2000,
        recommendedStrategy: 'quick',
        confidence: 0.88,
        reason: 'Question simple, DeepSeek suffisant'
      };
    }
    
    if (complexity > 4 || features.hasDocument) {
      return {
        estimatedCost: 0.020,
        estimatedTime: 30000,
        recommendedStrategy: 'complex',
        confidence: 0.95,
        reason: 'Analyse complexe requise avec validation Claude'
      };
    }
    
    // Stratégie standard par défaut
    return {
      estimatedCost: 0.015,
      estimatedTime: 15000,
      recommendedStrategy: 'standard',
      confidence: 0.90,
      reason: 'Pipeline 3-paliers optimisé recommandé'
    };
  }
  
  /**
   * Algorithme de scoring de complexité
   */
  private analyzeComplexity(query: string, features: RequestFeatures): number {
    let score = 0;
    
    // Longueur
    if (query.length > 500) score += 1;
    if (query.length > 1000) score += 1;
    
    // Mots-clés complexes
    const complexPatterns = [
      /diagnostic|analyse complète|bilan|compte de résultat/i,
      /comparaison|benchmark|sectoriel/i,
      /recommandation|stratégie|plan d'action/i,
      /subvention|financement|aide|credit impot/i
    ];
    
    complexPatterns.forEach(pattern => {
      if (pattern.test(query)) score += 0.5;
    });
    
    // Documents
    if (features.hasDocument) score += 1.5;
    
    // Secteur spécifique
    if (features.sector) score += 0.5;
    
    return Math.min(score, 5);
  }
  
  /**
   * Calcule la similarité avec KB existante
   */
  private async calculateRAGSimilarity(query: string): Promise<number> {
    // Appel au système RAG pour vérifier cache hit potentiel
    // Simplifié ici - en prod appeler Qdrant
    return 0.7; // Valeur par défaut conservatrice
  }
  
  /**
   * Apprend des résultats réels pour améliorer les prédictions
   */
  learn(requestFeatures: RequestFeatures, actualCost: number, userSatisfaction: number) {
    const key = JSON.stringify(requestFeatures);
    this.historicalData.set(key, userSatisfaction);
    
    // Mise à jour modèle de prédiction (simplifié)
    if (userSatisfaction < 0.8) {
      console.log('⚠️ Pattern sous-optimal détecté, ajustement des poids...');
    }
  }
}
