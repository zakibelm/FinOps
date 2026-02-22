import { Job } from 'bull'

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

async function openrouterChat(model: string, messages: any[], temperature = 0.3, max_tokens = 4000) {
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

export async function phase3Processor(job: Job) {
  const { plan, researchResults, document, userLevel, userId, phase2Metrics } = job.data
  console.log(`✅ Phase 3 - Validation for user ${userId}`)

  const startTime = Date.now()

  try {
    const finalResponse = await openrouterChat(
      process.env.MODEL_PHASE3_VALIDATOR || 'anthropic/claude-3-5-sonnet-20241022',
      [
        { role: 'system', content: getPhase3SystemPrompt(userLevel) },
        { role: 'user', content: `Validate and format this financial analysis:\n\nOriginal Plan: ${plan}\n\nResearch Results: ${researchResults}\n\nFormat the final response for a ${userLevel} user level.` },
      ],
      0.3,
      4000
    )

    const duration = Date.now() - startTime
    const totalDuration = (phase2Metrics?.duration || 0) + duration
    const totalCost = 0.020

    console.log(` ✅ Phase 3 completed`)
    console.log(` 📊 Total: ${totalDuration}ms | Cost: $${totalCost.toFixed(3)}`)

    return {
      status: 'completed',
      response: finalResponse,
      metrics: {
        totalDuration,
        totalCost,
        phase2Duration: phase2Metrics?.duration || 0,
        phase3Duration: duration,
        phase2Cost: 0,
        phase3Cost: 0.012,
        userLevel,
        model: 'claude-3.5-sonnet',
      },
    }
  } catch (error) {
    console.error('❌ Phase 3 failed:', error)
    throw error
  }
}

function getPhase3SystemPrompt(userLevel: string): string {
  return `You are Phase 3: Financial Validator & Formatter. Verify all calculations, validate interpretations, format the final response professionally for a ${userLevel} user. Always add appropriate disclaimers and suggest CPA validation for critical decisions.`
}
