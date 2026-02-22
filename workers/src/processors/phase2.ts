import { Job, Queue } from 'bull'

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

async function openrouterChat(model: string, messages: any[], temperature = 0.1, max_tokens = 4000) {
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

const phase3Queue = new Queue('phase3-validation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
})

export async function phase2Processor(job: Job) {
  const { plan, document, userLevel, complexity, userId } = job.data
  console.log(`🔢 Phase 2 - Research & Calculations for user ${userId}`)
  console.log(` Using DeepSeek V3 (FREE) - Complexity: ${complexity}`)

  const startTime = Date.now()

  try {
    const researchResults = await openrouterChat(
      process.env.MODEL_PHASE2_RESEARCHER || 'deepseek/deepseek-chat',
      [
        { role: 'system', content: getPhase2SystemPrompt(userLevel) },
        { role: 'user', content: `Execute this analysis plan:\n\n${plan}\n\nDocument Data: ${JSON.stringify(document)}` },
      ],
      0.1,
      4000
    )

    const duration = Date.now() - startTime
    console.log(` ✅ Phase 2 completed in ${duration}ms`)

    await phase3Queue.add('validate', {
      plan,
      researchResults,
      document,
      userLevel,
      userId,
      phase2Metrics: { duration, model: 'deepseek-v3', cost: 0 },
    })

    return { status: 'completed', duration, cost: 0, nextPhase: 'phase3-validation' }
  } catch (error) {
    console.error('❌ Phase 2 failed:', error)
    throw error
  }
}

function getPhase2SystemPrompt(userLevel: string): string {
  return `You are Phase 2: Financial Researcher & Calculator. Execute the analysis plan with mathematical precision. Always show calculations step by step, verify twice, use exact formulas, never invent numbers. User level: ${userLevel}.`
}
