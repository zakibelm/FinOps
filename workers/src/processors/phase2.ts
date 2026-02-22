import OpenAI from 'openai'
import { Job } from 'bull'
import { Queue } from 'bull'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key-will-fail-at-runtime',
})

// Queue pour phase 3
const phase3Queue = new Queue('phase3-validation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
})

export async function phase2Processor(job: Job) {
  const { plan, document, userLevel, complexity, userId } = job.data
  
  console.log(`🔢 Phase 2 - Research & Calculations for user ${userId}`)
  console.log(`   Using DeepSeek V3 (FREE) - Complexity: ${complexity}`)
  
  const startTime = Date.now()
  
  try {
    // Phase 2: DeepSeek V3 pour calculs et recherche (GRATUIT)
    const research = await openai.chat.completions.create({
      model: process.env.MODEL_PHASE2_RESEARCHER || 'openrouter/deepseek/deepseek-v3',
      messages: [
        {
          role: 'system',
          content: getPhase2SystemPrompt(userLevel),
        },
        {
          role: 'user',
          content: `Execute this analysis plan:\n\n${plan}\n\nDocument Data: ${JSON.stringify(document)}`,
        },
      ],
      temperature: 0.1, // Très précis pour calculs
      max_tokens: 4000,
    })
    
    const researchResults = research.choices[0].message.content
    const duration = Date.now() - startTime
    
    console.log(`   ✅ Phase 2 completed in ${duration}ms`)
    
    // Passer à phase 3
    await phase3Queue.add('validate', {
      plan,
      researchResults,
      document,
      userLevel,
      userId,
      phase2Metrics: {
        duration,
        model: 'deepseek-v3',
        cost: 0, // GRATUIT!
      },
    })
    
    return {
      status: 'completed',
      duration,
      cost: 0,
      nextPhase: 'phase3-validation',
    }
  } catch (error) {
    console.error('❌ Phase 2 failed:', error)
    throw error
  }
}

function getPhase2SystemPrompt(userLevel: string): string {
  const basePrompt = `You are Phase 2: The Financial Researcher & Calculator.

Your role is to execute the analysis plan with mathematical precision.

CRITICAL RULES:
1. ALWAYS show your calculations step by step
2. Verify each calculation TWICE
3. Use exact formulas provided
4. Never invent numbers - only use provided data
5. Round to 2 decimal places for ratios
6. Flag any uncertainties or missing data

You are using DeepSeek V3, optimized for:
- Mathematical reasoning
- Financial calculations
- Structured data extraction
- Precise formula execution`

  if (userLevel === 'beginner') {
    return basePrompt + `\n\nFor BEGINNER users:\n- Explain calculations in simple terms\n- Use everyday analogies\n- Focus on practical implications`
  }
  
  if (userLevel === 'expert') {
    return basePrompt + `\n\nFor EXPERT users:\n- Use technical terminology\n- Show advanced formulas\n- Include sector benchmarks\n- Flag methodological choices`
  }
  
  return basePrompt + `\n\nFor INTERMEDIATE users:\n- Use standard financial terms\n- Explain methodology\n- Include relevant benchmarks`
}
