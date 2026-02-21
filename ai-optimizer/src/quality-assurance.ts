/**
 * Quality Assurance AI
 * Vérifie la qualité des réponses avant envoi au client
 */

interface QualityCheck {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  autoFixable: boolean;
}

interface AnalysisResult {
  content: string;
  metrics: {
    wordCount: number;
    hasNumbers: boolean;
    hasRatios: boolean;
    hasRecommendations: boolean;
    hasWarnings: boolean;
  };
}

export class QualityAssurance {
  
  /**
   * Évalue complètement une réponse
   */
  assessQuality(result: AnalysisResult): QualityCheck {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    // 1. Vérification structure
    if (!result.metrics.hasNumbers) {
      issues.push('Absence de données chiffrées');
      suggestions.push('Ajouter les ratios calculés avec valeurs');
      score -= 20;
    }
    
    if (!result.metrics.hasRatios && result.content.includes('ratio')) {
      issues.push('Mention de ratios sans valeurs');
      suggestions.push('Inclure valeur + interprétation + benchmark');
      score -= 15;
    }
    
    if (!result.metrics.hasRecommendations) {
      issues.push('Pas d\'actions recommandées');
      suggestions.push('Ajouter section "Recommandations" avec priorités');
      score -= 15;
    }
    
    // 2. Vérification longueur adaptée
    if (result.metrics.wordCount < 100) {
      issues.push('Réponse trop courte pour une analyse financière');
      suggestions.push('Développer l\'analyse avec contexte sectoriel');
      score -= 10;
    }
    
    if (result.metrics.wordCount > 800) {
      issues.push('Réponse potentiellement trop verbeuse');
      suggestions.push('Structurer avec bullet points pour lisibilité');
      score -= 5;
    }
    
    // 3. Vérification cohérence financière
    if (this.detectFinancialInconsistency(result.content)) {
      issues.push('Incohérence détectée dans les calculs');
      suggestions.push('Revérifier les opérations arithmétiques');
      score -= 25;
    }
    
    // 4. Vérification disclaimers
    if (!result.content.includes('⚖️') && !result.content.includes('Important')) {
      suggestions.push('Ajouter disclaimer sur limites de l\'analyse');
      score -= 5;
    }
    
    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      autoFixable: issues.filter(i => !i.includes('Incohérence')).length === issues.length
    };
  }
  
  /**
   * Détecte les incohérences mathématiques
   */
  private detectFinancialInconsistency(content: string): boolean {
    // Pattern: ratio = valeur mais valeur incohérente
    const ratioPatterns = [
      /ratio.*(\d+\.?\d*).*vs.*bench/i,
      /(\d+\.?\d*)%.*vs.*moyenne/i
    ];
    
    // Vérification basique - en prod utiliser NLP avancé
    const suspiciousPatterns = [
      /ratio.*>\s*100/i, // Ratio > 100% suspect
      /-\d+%.*positif/i, // Négatif présenté comme positif
      /infinity|∞/i       // Division par zéro
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
  
  /**
   * Tente de corriger automatiquement les problèmes simples
   */
  autoFix(content: string, issues: string[]): string {
    let fixed = content;
    
    // Ajouter disclaimer si manquant
    if (issues.some(i => i.includes('disclaimer'))) {
      fixed += '\n\n⚖️ **Important** : Cette analyse est indicative et ne remplace pas un avis professionnel.';
    }
    
    // Ajouter structure si manquante
    if (issues.some(i => i.includes('structure'))) {
      fixed = this.addStructure(fixed);
    }
    
    return fixed;
  }
  
  private addStructure(content: string): string {
    return `📊 **Analyse**\n\n${content}\n\n🎯 **Recommandations**\n• Action prioritaire à définir`;
  }
  
  /**
   * Décide si on relance l'analyse ou on envoie avec warnings
   */
  shouldEscalate(quality: QualityCheck): boolean {
    return quality.score < 70 || quality.issues.some(i => i.includes('Incohérence'));
  }
}
