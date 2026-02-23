/**
 * Agent Workflow - Orchestration Multi-Étapes
 * Basé sur: book-writer-flow + content_planner_flow du AI Engineering Hub
 * Adapté pour: Pipeline FinOps 3-phase
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'FinOps Workflow Agent'
  }
});

// Types
type AnalysisType = 'quick' | 'standard' | 'complex';
type WorkflowPhase = 'phase1' | 'phase2' | 'phase3';

interface WorkflowOptions {
  analysisType?: AnalysisType;
  sector?: string;
  userId?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  phases: Record<WorkflowPhase, PhaseResult>;
  finalOutput: any;
  metadata: {
    duration: number;
    tokensUsed: number;
    modelsUsed: string[];
  };
}

interface PhaseResult {
  status: 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration: number;
}

/**
 * Détecte le niveau d'analyse requis
 */
function detectAnalysisLevel(query: string, document?: string): AnalysisType {
  const complexKeywords = ['audit', 'fusion', 'acquisition', 'due diligence', 'prévision', '3 ans'];
  const standardKeywords = ['analyse', 'ratio', 'comparaison', 'bilan'];
  
  const lowerQuery = query.toLowerCase();
  
  if (complexKeywords.some(k => lowerQuery.includes(k))) return 'complex';
  if (standardKeywords.some(k => lowerQuery.includes(k))) return 'standard';
  return 'quick';
}

/**
 * Phase 1: Analyse initiale et planification
 */
async function executePhase1(
  query: string,
  context: any,
  options: WorkflowOptions
): Promise<PhaseResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Phase 1: Analyse et planification...');
    
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'system',
          content: `Tu es un analyste financier senior. Analyse la demande et crée un plan d'analyse.
Réponds en JSON avec:
- analysis_type: type d'analyse requis
- objectives: liste des objectifs
- required_data: données nécessaires
- approach: méthodologie suggérée
- complexity_score: 1-10`
        },
        {
          role: 'user',
          content: `Demande: ${query}\nContexte: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const output = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      status: 'success',
      output,
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Phase 2: Recherche et calculs (DeepSeek - gratuit)
 */
async function executePhase2(
  phase1Output: any,
  options: WorkflowOptions
): Promise<PhaseResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔢 Phase 2: Recherche et calculs...');
    
    // Utiliser DeepSeek V3 (gratuit via OpenRouter)
    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat', // ou 'openrouter/deepseek/deepseek-v3'
      messages: [
        {
          role: 'system',
          content: `Tu es un chercheur financier. Effectue les calculs et recherches demandés.
Sois précis et montre tes calculs. Utilise les données fournies.`
        },
        {
          role: 'user',
          content: `Plan Phase 1: ${JSON.stringify(phase1Output)}\nSecteur: ${options.sector || 'general'}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    return {
      status: 'success',
      output: {
        research: response.choices[0]?.message?.content,
        calculations: 'completed',
        sources: []
      },
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Phase 3: Synthèse et validation (Claude)
 */
async function executePhase3(
  phase1Output: any,
  phase2Output: any,
  options: WorkflowOptions
): Promise<PhaseResult> {
  const startTime = Date.now();
  
  try {
    console.log('✅ Phase 3: Synthèse et validation...');
    
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'system',
          content: `Tu es un validateur financier senior. Synthétise les résultats et valide l'analyse.
Structure ta réponse avec:
1. Executive Summary
2. Findings (avec preuves)
3. Recommendations
4. Risks identifiés
5. Next Steps`
        },
        {
          role: 'user',
          content: `Phase 1 (Plan): ${JSON.stringify(phase1Output)}\nPhase 2 (Recherche): ${JSON.stringify(phase2Output)}`
        }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });

    return {
      status: 'success',
      output: {
        finalReport: response.choices[0]?.message?.content,
        validated: true,
        confidence: 'high'
      },
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Orchestrateur principal
 */
export async function executeWorkflow(
  query: string,
  options: WorkflowOptions = {}
): Promise<WorkflowResult> {
  const workflowId = `wf-${Date.now()}`;
  const startTime = Date.now();
  
  console.log(`🚀 Démarrage workflow ${workflowId}`);
  console.log(`📊 Type: ${options.analysisType || 'auto-detect'}`);
  
  // Détecter type si non spécifié
  if (!options.analysisType) {
    options.analysisType = detectAnalysisLevel(query);
    console.log(`🎯 Type détecté: ${options.analysisType}`);
  }
  
  const phases: Record<WorkflowPhase, PhaseResult> = {
    phase1: { status: 'failed', duration: 0 },
    phase2: { status: 'failed', duration: 0 },
    phase3: { status: 'failed', duration: 0 }
  };
  
  let tokensUsed = 0;
  const modelsUsed: string[] = [];
  
  try {
    // Phase 1: Toujours exécutée
    phases.phase1 = await executePhase1(query, {}, options);
    
    if (phases.phase1.status === 'success') {
      // Phase 2: Toujours pour standard/complex
      if (options.analysisType !== 'quick') {
        phases.phase2 = await executePhase2(phases.phase1.output, options);
        
        // Phase 3: Synthese finale
        if (phases.phase2.status === 'success') {
          phases.phase3 = await executePhase3(
            phases.phase1.output,
            phases.phase2.output,
            options
          );
        }
      } else {
        // Quick: sauter phase 2, synthèse directe
        phases.phase2 = { status: 'skipped', duration: 0 };
        phases.phase3 = await executePhase3(
          phases.phase1.output,
          { research: 'Quick analysis - no deep research required' },
          options
        );
      }
    }
    
    // Déterminer statut global
    const completedPhases = Object.values(phases).filter(p => p.status === 'success').length;
    const status = completedPhases === 3 ? 'completed' : 
                   completedPhases >= 2 ? 'partial' : 'failed';
    
    return {
      workflowId,
      status,
      phases,
      finalOutput: phases.phase3.output,
      metadata: {
        duration: Date.now() - startTime,
        tokensUsed,
        modelsUsed: [...new Set(modelsUsed)]
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur workflow:', error);
    return {
      workflowId,
      status: 'failed',
      phases,
      finalOutput: null,
      metadata: {
        duration: Date.now() - startTime,
        tokensUsed,
        modelsUsed
      }
    };
  }
}

/**
 * Exécution parallèle de workflows multiples
 */
export async function executeBatchWorkflows(
  queries: string[],
  options: WorkflowOptions
): Promise<WorkflowResult[]> {
  console.log(`🔄 Exécution parallèle de ${queries.length} workflows...`);
  
  const promises = queries.map(q => executeWorkflow(q, options));
  return Promise.all(promises);
}

export { WorkflowOptions, WorkflowResult, AnalysisType };
