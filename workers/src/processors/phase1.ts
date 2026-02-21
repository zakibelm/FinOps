import OpenAI from 'openai'
import { Job } from 'bull'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function phase1Processor(job: Job) {
  const { document, type, userId } = job.data
  
  console.log(`🔍 Phase 1 - Analyzing request for user ${userId}`)
  
  // Détecter niveau utilisateur et complexité
  const userLevel = detectUserLevel(document.query)
  const complexity = detectComplexity(document)
  
  // Construire le plan d'analyse
  const plan = await openai.chat.completions.create({
    model: process.env.MODEL_PHASE1_ANALYST || 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      {
        role: 'system',
        content: getPhase1SystemPrompt(userLevel),
      },
      {
        role: 'user',
        content: `Analyze this financial request and create a detailed plan:\n\nType: ${type}\nDocument: ${JSON.stringify(document)}\nUser Level: ${userLevel}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  })
  
  const analysisPlan = plan.choices[0].message.content
  
  // Passer au phase 2
  return {
    plan: analysisPlan,
    userLevel,
    complexity,
    document,
    nextPhase: 'phase2-research',
  }
}

function detectUserLevel(query: string): 'beginner' | 'intermediate' | 'expert' {
  const expertTerms = ['ebitda', 'wacc', 'dcf', 'roic', 'ev/ebitda', 'gaap', 'ifrs']
  const intermediateTerms = ['ratio', 'bilan', 'cash flow', 'rentabilité']
  
  const queryLower = query.toLowerCase()
  
  if (expertTerms.some(term => queryLower.includes(term))) {
    return 'expert'
  }
  if (intermediateTerms.some(term => queryLower.includes(term))) {
    return 'intermediate'
  }
  return 'beginner'
}

function detectComplexity(document: any): 'quick' | 'standard' | 'complex' {
  if (document.type === 'ratio-simple' || document.query?.length < 50) {
    return 'quick'
  }
  if (document.type === 'full-diagnostic' || document.data?.length > 10000) {
    return 'complex'
  }
  return 'standard'
}

function getPhase1SystemPrompt(userLevel: string): string {
  return `You are Phase 1: The Financial Analyst Planner.

Your role is to analyze the user's request and create a detailed plan for the financial analysis.

User Level Detected: ${userLevel}
- Beginner: Use simple terms, provide context
- Intermediate: Standard financial terminology
- Expert: Technical terms, focus on nuances

Create a plan that includes:
1. Type of analysis needed
2. Key financial ratios to calculate
3. External research needed (subsidies, benchmarks)
4. Red flags to watch for
5. Expected output format

Be precise and thorough. The next phase will execute this plan.`
}
