export interface PipelineConfig {
  phases: {
    phase1: PhaseConfig
    phase2: PhaseConfig
    phase3: PhaseConfig
  }
  routing: RoutingRules
  cache: CacheConfig
}

export interface PhaseConfig {
  model: string
  temperature: number
  maxTokens: number
  timeoutMs: number
  costEstimate: number
}

export interface RoutingRules {
  quick: string[]
  standard: string[]
  complex: string[]
}

export interface CacheConfig {
  semanticEnabled: boolean
  similarityThreshold: number
  ttlSeconds: number
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  phases: {
    phase1: {
      model: 'anthropic/claude-3-5-sonnet-20241022',
      temperature: 0.2,
      maxTokens: 2000,
      timeoutMs: 30000,
      costEstimate: 0.008,
    },
    phase2: {
      model: 'openrouter/deepseek/deepseek-v3',
      temperature: 0.1,
      maxTokens: 4000,
      timeoutMs: 45000,
      costEstimate: 0,
    },
    phase3: {
      model: 'anthropic/claude-3-5-sonnet-20241022',
      temperature: 0.3,
      maxTokens: 2000,
      timeoutMs: 30000,
      costEstimate: 0.012,
    },
  },
  routing: {
    quick: ['calcule', 'définition', 'formule', 'quelle', "c'est quoi"],
    standard: ['analyse', 'interprète', 'ratio', 'bilan simple'],
    complex: ['diagnostic', 'bilan complet', 'subvention', 'crédit', 'financement'],
  },
  cache: {
    semanticEnabled: true,
    similarityThreshold: 0.85,
    ttlSeconds: 86400,
  },
}

export * from './types/pipeline'
export * from './types/analysis'
export * from './utils/cost-calculator'
export * from './constants/models'
