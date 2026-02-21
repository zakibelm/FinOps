import OpenAI from 'openai'
import { Job } from 'bull'

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function phase3Processor(job: Job) {
  const { 
    plan, 
    researchResults, 
    document, 
    userLevel, 
    userId,
    phase2Metrics 
  } = job.data
  
  console.log(`✅ Phase 3 - Validation for user ${userId}`)
  
  const startTime = Date.now()
  
  try {
    // Phase 3: Claude pour validation et formulation finale
    const validation = await openai.chat.completions.create({
      model: process.env.MODEL_PHASE3_VALIDATOR || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'system',
          content: getPhase3SystemPrompt(userLevel),
        },
        {
          role: 'user',
          content: `Validate and format this financial analysis:

Original Plan: ${plan}

Research Results: ${researchResults}

Format the final response for a ${userLevel} user level.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })
    
    const finalResponse = validation.choices[0].message.content
    const duration = Date.now() - startTime
    
    const totalDuration = phase2Metrics.duration + duration
    const totalCost = 0.008 + 0.012 // Phase 1 + Phase 3 estimations
    
    console.log(`   ✅ Phase 3 completed`)
    console.log(`   📊 Total: ${totalDuration}ms | Cost: $${totalCost.toFixed(3)}`)
    
    return {
      status: 'completed',
      response: finalResponse,
      metrics: {
        totalDuration,
        totalCost,
        phase2Duration: phase2Metrics.duration,
        phase3Duration: duration,
        phase2Cost: 0, // DeepSeek gratuit
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
  const basePrompt = `You are Phase 3: The Financial Validator & Formatter.

Your role is to:
1. Verify all calculations from the research phase
2. Validate interpretations and recommendations
3. Format the final response professionally
4. Add appropriate disclaimers

CRITICAL:
- Never give personalized tax advice without qualification
- Always suggest CPA validation for critical decisions
- Include clear disclaimers about limitations
- Format with proper structure and emojis`;

  const formatInstructions = {
    beginner: `
Format for BEGINNER users:
💰 [Simple Title]

📊 **What Your Numbers Say**
[Simple explanation]

✅ **Good News**
• [Point 1 with simple number]

⚠️ **Watch Out For**
• [Risk explained simply]

💡 **My Recommendations**
1. **This week:** [Action]
2. **This month:** [Action]

🤝 **Need Help?**
[Call to action]

⚖️ **Important:** This analysis gives you directions, but for important decisions, always consult a professional.`,

    intermediate: `
Format for INTERMEDIATE users:
📊 Analyse: [Title]

**Context:** [Brief context]

📈 **Key Indicators**
| Metric | Value | Benchmark | Status |

🔍 **Technical Analysis**
[Detailed explanation]

⚠️ **Points of Attention**
• [Risk] → [Recommendation]

💡 **Opportunities**
• [Subsidy]: [Eligibility] - [Amount]

🎯 **Action Plan**
1. **Short term:** [Action]
2. **Medium term:** [Action]

⚖️ **Professional Note:** This analysis is indicative. CPA validation recommended before decision.`,

    expert: `
Format for EXPERT users:
📈 [Indicator/Analysis] - Executive Summary

**Positioning:** [1-line summary]

**Key Ratios:**
• X: V | Δ% n-1 | vs sector Z | [⚠️/✅/📊]

🔍 **In-Depth Analysis**
[Nuanced interpretation with fiscal/regulatory implications]

⚠️ **Flags:**
• [Risk] : [Impact] → [Mitigation]

💡 **Opportunities:**
• [Subsidy] : [Match %] | [Deadline] | [Amount]

🎯 **Actions:**
1. [High priority] : [Action] | [Timeline]
2. [Medium priority] : [Action] | [Timeline]

⚖️ **Limits & Risks:** [Regulatory constraints or uncertainties]

---
*Preliminary analysis - Full review needed before decision*`
  };

  return basePrompt + formatInstructions[userLevel as keyof typeof formatInstructions];
}
