/**
 * Confidence Router
 * Route intelligemment vers le bon modèle selon le niveau de confiance requis
 */

interface RoutingDecision {
  model: string;
  temperature: number;
  maxTokens: number;
  reasoning: string;
  fallback?: string;
}

interface RequestContext {
  query: string;
  domain: 'accounting' | 'tax' | 'subsidies' | 'general';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  userLevel: 'beginner' | 'intermediate' | 'expert';
  requiresCitations: boolean;
}

export class ConfidenceRouter {
  
  private models = {
    // Modèles rapides et économiques
    fast: {
      id: 'openrouter/deepseek/deepseek-v3',
      costPer1K: 0,
      speed: 'fast',
      quality: 0.75
    },
    
    // Modèles équilibrés
    balanced: {
      id: 'openrouter/moonshotai/kimi-k2.5',
      costPer1K: 0.003,
      speed: 'medium',
      quality: 0.85
    },
    
    // Modèles haute qualité
    premium: {
      id: 'anthropic/claude-3-5-sonnet-20241022',
      costPer1K: 0.015,
      speed: 'slow',
      quality: 0.95
    },
    
    // Modèles experts (max qualité)
    expert: {
      id: 'openrouter/anthropic/claude-3-opus',
      costPer1K: 0.075,
      speed: 'slow',
      quality: 0.98
    }
  };
  
  /**
   * Route une requête vers le modèle optimal
   */
  route(context: RequestContext): RoutingDecision {
    const { domain, riskLevel, userLevel, requiresCitations } = context;
    
    // Stratégie de routing basée sur matrice décision
    
    // CRITIQUE: Toujours modèle expert
    if (riskLevel === 'critical' || domain === 'tax' && context.query.includes('décision')) {
      return {
        model: this.models.expert.id,
        temperature: 0.1, // Très conservateur
        maxTokens: 4096,
        reasoning: 'Risque critique ou décision fiscale - qualité maximale requise',
        fallback: this.models.premium.id
      };
    }
    
    // HAUT RISQUE: Modèle premium
    if (riskLevel === 'high' || requiresCitations || domain === 'tax') {
      return {
        model: this.models.premium.id,
        temperature: 0.2,
        maxTokens: 2048,
        reasoning: 'Haute précision nécessaire - Claude Sonnet optimal',
        fallback: this.models.balanced.id
      };
    }
    
    // STANDARD: Modèle équilibré
    if (riskLevel === 'medium' || userLevel === 'expert') {
      return {
        model: this.models.balanced.id,
        temperature: 0.3,
        maxTokens: 2048,
        reasoning: 'Équilibre coût/performance pour utilisateur averti',
        fallback: this.models.fast.id
      };
    }
    
    // BAS RISQUE: Modèle rapide (DeepSeek - gratuit)
    return {
      model: this.models.fast.id,
      temperature: 0.4,
      maxTokens: 1024,
      reasoning: 'Faible risque - DeepSeek suffisant et gratuit'
    };
  }
  
  /**
   * Adapte dynamiquement selon les résultats précédents
   */
  adaptiveRoute(
    context: RequestContext,
    previousSuccess: boolean,
    previousModel: string
  ): RoutingDecision {
    if (!previousSuccess && previousModel === this.models.fast.id) {
      // Échec avec modèle rapide → upgrade
      console.log('⚠️  Échec modèle rapide, upgrade vers premium');
      return {
        model: this.models.premium.id,
        temperature: 0.2,
        maxTokens: 2048,
        reasoning: 'Fallback après échec modèle économique'
      };
    }
    
    if (previousSuccess && previousModel === this.models.premium.id) {
      // Succès avec premium → essayer balanced pour économiser
      if (context.riskLevel !== 'high') {
        return {
          model: this.models.balanced.id,
          temperature: 0.3,
          maxTokens: 2048,
          reasoning: 'Optimisation coût - downgrade suite à pattern stable'
        };
      }
    }
    
    return this.route(context);
  }
  
  /**
   * Estime le coût avant exécution
   */
  estimateCost(context: RequestContext, inputTokens: number, outputTokens: number): {
    estimated: number;
    strategy: string;
  } {
    const decision = this.route(context);
    const model = Object.values(this.models).find(m => m.id === decision.model);
    
    if (!model) return { estimated: 0, strategy: 'unknown' };
    
    const cost = (inputTokens + outputTokens) / 1000 * model.costPer1K;
    
    return {
      estimated: cost,
      strategy: model.speed
    };
  }
  
  /**
   * Route en parallèle pour comparaison (A/B testing)
   */
  parallelRoute(context: RequestContext, testNewModel: boolean): RoutingDecision[] {
    const primary = this.route(context);
    
    if (!testNewModel) return [primary];
    
    // Si test activé, retourner aussi modèle adjacent
    if (primary.model === this.models.premium.id) {
      return [primary, {
        model: this.models.balanced.id,
        temperature: 0.3,
        maxTokens: 2048,
        reasoning: 'A/B test: balanced vs premium'
      }];
    }
    
    return [primary];
  }
}
