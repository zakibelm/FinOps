/**
 * Feedback Loop Engine
 * Apprend continuellement des interactions pour améliorer le système
 */

interface Interaction {
  id: string;
  query: string;
  strategy: string;
  result: string;
  userRating?: number; // 1-5
  userFeedback?: string;
  corrections?: string[];
  timestamp: Date;
  metadata: {
    sector?: string;
    complexity: number;
    cost: number;
    duration: number;
  };
}

interface PatternImprovement {
  pattern: string;
  improvement: string;
  confidence: number;
  applications: number;
}

export class FeedbackLoopEngine {
  private interactions: Interaction[] = [];
  private improvements: Map<string, PatternImprovement> = new Map();
  
  /**
   * Enregistre une interaction complète
   */
  logInteraction(interaction: Interaction) {
    this.interactions.push(interaction);
    
    // Si feedback utilisateur disponible, analyser immédiatement
    if (interaction.userRating && interaction.userRating < 4) {
      this.analyzeLowQualityInteraction(interaction);
    }
    
    // Apprendre des patterns réussis
    if (interaction.userRating === 5) {
      this.extractSuccessPattern(interaction);
    }
  }
  
  /**
   * Analyse les interactions de faible qualité
   */
  private analyzeLowQualityInteraction(interaction: Interaction) {
    console.log(`🔍 Analyse échec: ${interaction.id}`);
    
    const issues = this.identifyIssues(interaction);
    
    // Proposer améliorations
    issues.forEach(issue => {
      const key = `${interaction.metadata.sector}:${issue}`;
      const existing = this.improvements.get(key);
      
      if (existing) {
        existing.applications++;
        existing.confidence = Math.min(0.95, existing.confidence + 0.05);
      } else {
        this.improvements.set(key, {
          pattern: issue,
          improvement: this.suggestImprovement(issue, interaction),
          confidence: 0.6,
          applications: 1
        });
      }
    });
  }
  
  /**
   * Identifie les problèmes dans une interaction
   */
  private identifyIssues(interaction: Interaction): string[] {
    const issues: string[] = [];
    
    if (interaction.metadata.duration > 45000) {
      issues.push('slow_response');
    }
    
    if (interaction.userFeedback?.includes('incomplet')) {
      issues.push('incomplete_analysis');
    }
    
    if (interaction.userFeedback?.includes('technique') || 
        interaction.userFeedback?.includes('compliqué')) {
      issues.push('too_technical');
    }
    
    if (!interaction.result.includes('recommendation')) {
      issues.push('missing_recommendations');
    }
    
    return issues;
  }
  
  /**
   * Suggère une amélioration spécifique
   */
  private suggestImprovement(issue: string, interaction: Interaction): string {
    const suggestions: Record<string, string> = {
      'slow_response': 'Utiliser cache RAG pour requêtes similaires',
      'incomplete_analysis': 'Ajouter checklist automatique des ratios clés',
      'too_technical': 'Adapter niveau explication selon vocabulaire utilisateur',
      'missing_recommendations': 'Forcer section recommandations dans prompt système'
    };
    
    return suggestions[issue] || 'Revoir prompt pour ce type de requête';
  }
  
  /**
   * Extrait les patterns de succès
   */
  private extractSuccessPattern(interaction: Interaction) {
    const pattern = {
      queryType: this.classifyQuery(interaction.query),
      strategy: interaction.strategy,
      structure: this.analyzeStructure(interaction.result)
    };
    
    console.log('✨ Pattern succès identifié:', pattern);
    
    // En prod: stocker dans DB pour réutilisation
  }
  
  /**
   * Améliore dynamiquement le RAG
   */
  improveRAG(failedQuery: string, correctAnswer: string): boolean {
    // Si correction fournie par utilisateur, l'ajouter à la KB
    if (this.isValuableAddition(failedQuery, correctAnswer)) {
      console.log('📝 Ajout à la KB:', failedQuery.substring(0, 50));
      
      // En prod: insertion dans Qdrant avec embedding
      return true;
    }
    
    return false;
  }
  
  /**
   * Génère des insights pour l'admin
   */
  generateInsights(): {
    topIssues: string[];
    recommendedActions: string[];
    performanceTrend: 'up' | 'down' | 'stable';
  } {
    const recentInteractions = this.interactions.slice(-100);
    const avgRating = recentInteractions
      .filter(i => i.userRating)
      .reduce((sum, i) => sum + (i.userRating || 0), 0) / 
      recentInteractions.filter(i => i.userRating).length || 0;
    
    const topIssues = [...this.improvements.entries()]
      .sort((a, b) => b[1].applications - a[1].applications)
      .slice(0, 5)
      .map(([_, v]) => `${v.pattern}: ${v.improvement}`);
    
    return {
      topIssues,
      recommendedActions: this.generateRecommendations(),
      performanceTrend: avgRating > 4.2 ? 'up' : avgRating < 3.8 ? 'down' : 'stable'
    };
  }
  
  private classifyQuery(query: string): string {
    if (/ratio|marge|rentabilité/.test(query)) return 'financial_ratio';
    if (/subvention|aide|financement/.test(query)) return 'subsidy_search';
    if (/bilan|compte.*résultat/.test(query)) return 'document_analysis';
    return 'general';
  }
  
  private analyzeStructure(result: string): string {
    if (result.includes('📊') && result.includes('🎯')) return 'structured';
    if (result.includes('\n\n')) return 'paragraphs';
    return 'text';
  }
  
  private generateRecommendations(): string[] {
    return [...this.improvements.values()]
      .filter(i => i.confidence > 0.8)
      .map(i => i.improvement);
  }
  
  private isValuableAddition(query: string, answer: string): boolean {
    // Éviter d'ajouter du bruit
    return answer.length > 100 && 
           answer.length < 2000 &&
           !this.interactions.some(i => 
             this.similarity(i.query, query) > 0.9
           );
  }
  
  private similarity(a: string, b: string): number {
    // Jaccard similarity simplifié
    const setA = new Set(a.toLowerCase().split(' '));
    const setB = new Set(b.toLowerCase().split(' '));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / (setA.size + setB.size - intersection.size);
  }
}
