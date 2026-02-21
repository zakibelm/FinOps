/**
 * AI Optimizer - Système Intelligence Artificielle Métacognitive
 * 
 * Module d'optimisation automatique qui améliore continuellement FinOps
 * grâce à 5 sous-systèmes intelligents :
 * 
 * 1. CostPredictor - Prédit et minimise les coûts
 * 2. QualityAssurance - Garantit la qualité (>95%)
 * 3. ContextCompressor - Réduit les tokens (-30-50%)
 * 4. FeedbackLoop - Apprend et s'améliore
 * 5. ConfidenceRouter - Route vers le meilleur modèle
 */

export { CostPredictor } from './cost-predictor';
export { QualityAssurance } from './quality-assurance';
export { ContextCompressor } from './context-compressor';
export { FeedbackLoopEngine } from './feedback-loop';
export { ConfidenceRouter } from './confidence-router';

// Orchestrateur principal
export class AIOptimizer {
  costPredictor = new CostPredictor();
  qualityAssurance = new QualityAssurance();
  contextCompressor = new ContextCompressor();
  feedbackLoop = new FeedbackLoopEngine();
  confidenceRouter = new ConfidenceRouter();
  
  /**
   * Optimise une requête complète de bout en bout
   */
  async optimizeRequest(query: string, context: any) {
    // 1. Prédiction et routing
    const prediction = await this.costPredictor.predict(query, {
      queryLength: query.length,
      complexity: this.estimateComplexity(query),
      hasDocument: !!context.document
    });
    
    // 2. Compression si nécessaire
    if (context.document && context.document.length > 2000) {
      context.document = this.contextCompressor.compress(context.document);
    }
    
    // 3. Routing intelligent
    const routing = this.confidenceRouter.route({
      query,
      domain: this.detectDomain(query),
      riskLevel: this.assessRisk(query),
      userLevel: context.userLevel || 'intermediate',
      requiresCitations: query.includes('source') || query.includes('référence')
    });
    
    return {
      prediction,
      routing,
      optimizedContext: context
    };
  }
  
  /**
   * Post-traitement et assurance qualité
   */
  async postProcess(result: string, metadata: any) {
    // Assurance qualité
    const quality = this.qualityAssurance.assessQuality({
      content: result,
      metrics: {
        wordCount: result.split(' ').length,
        hasNumbers: /\d/.test(result),
        hasRatios: /ratio|%/i.test(result),
        hasRecommendations: /recommandation|conseil/i.test(result),
        hasWarnings: /⚠️|attention/i.test(result)
      }
    });
    
    // Auto-correction si possible
    let finalResult = result;
    if (quality.autoFixable) {
      finalResult = this.qualityAssurance.autoFix(result, quality.issues);
    }
    
    // Logging pour feedback
    this.feedbackLoop.logInteraction({
      id: metadata.requestId,
      query: metadata.query,
      strategy: metadata.strategy,
      result: finalResult,
      metadata: {
        complexity: metadata.complexity,
        cost: metadata.cost,
        duration: metadata.duration
      },
      timestamp: new Date()
    });
    
    return {
      result: finalResult,
      quality,
      needsEscalation: this.qualityAssurance.shouldEscalate(quality)
    };
  }
  
  /**
   * Récupère les insights d'amélioration
   */
  getInsights() {
    return this.feedbackLoop.generateInsights();
  }
  
  private estimateComplexity(query: string): number {
    let score = 0;
    if (query.length > 500) score += 1;
    if (/diagnostic|analyse|bilan/i.test(query)) score += 2;
    if (/comparaison|benchmark/i.test(query)) score += 1;
    return Math.min(score, 5);
  }
  
  private detectDomain(query: string): any {
    if (/subvention|aide|financement/i.test(query)) return 'subsidies';
    if (/impôt|fiscal|taxe/i.test(query)) return 'tax';
    if (/ratio|bilan|compte/i.test(query)) return 'accounting';
    return 'general';
  }
  
  private assessRisk(query: string): any {
    if (/décision|critique|urgent/i.test(query)) return 'critical';
    if (/erreur|risque|problème/i.test(query)) return 'high';
    if (/vérification|contrôle/i.test(query)) return 'medium';
    return 'low';
  }
}

export default AIOptimizer;
