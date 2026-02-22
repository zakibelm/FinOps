import { Job } from 'bull'

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

async function openrouterChat(model: string, messages: any[], temperature = 0.2, max_tokens = 2000) {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export async function phase1Processor(job: Job) {
  const { document, type, userId } = job.data
  console.log(`🔍 Phase 1 - Analyzing request for user ${userId}`)

  const userLevel = detectUserLevel(document.query)
  const complexity = detectComplexity(document)

  const analysisPlan = await openrouterChat(
    process.env.MODEL_PHASE1_ANALYST || 'anthropic/claude-3-5-sonnet-20241022',
    [
      { role: 'system', content: getPhase1SystemPrompt(userLevel) },
      { role: 'user', content: `Analyze this financial request and create a detailed plan:\n\nType: ${type}\nDocument: ${JSON.stringify(document)}\nUser Level: ${userLevel}` },
    ],
    0.2,
    2000
  )

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
  const intermediateTerms = ['ratio', 'bilan', 'cash flow', 'rentabilite']
  const queryLower = query.toLowerCase()
  if (expertTerms.some(term => queryLower.includes(term))) return 'expert'
  if (intermediateTerms.some(term => queryLower.includes(term))) return 'intermediate'
  return 'beginner'
}

function detectComplexity(document: any): 'quick' | 'standard' | 'complex' {
  if (document.type === 'ratio-simple' || document.query?.length < 50) return 'quick'
  if (document.type === 'full-diagnostic' || document.data?.length > 10000) return 'complex'
  return 'standard'
}

function getPhase1SystemPrompt(userLevel: string): string {
  return `You are Phase 1: The Financial Analyst Planner. User Level: ${userLevel}. Create a precise analysis plan with: 1) Type of analysis, 2) Key ratios, 3) Research needed, 4) Red flags, 5) Output format.`
}
