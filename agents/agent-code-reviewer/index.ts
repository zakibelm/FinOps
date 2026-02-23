/**
 * Agent Code Reviewer (Supervisor)
 * Model: deepseek/deepseek-chat
 * Reviews code from: Qwen3-Coder agents
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'Code Reviewer Agent'
  }
});

interface ReviewTask {
  code: string;
  language: string;
  filename: string;
  reviewType: 'full' | 'security' | 'performance' | 'style';
  authorAgent: string;
}

interface ReviewResult {
  approved: boolean;
  score: number; // 0-100
  issues: {
    critical: string[];
    warning: string[];
    suggestion: string[];
  };
  improvements: string[];
  optimizedCode?: string;
}

const SYSTEM_PROMPT = `Tu es un Senior Code Reviewer expert.
Tu utilises le modèle deepseek/deepseek-chat pour une analyse approfondie.
Tu supervises le code produit par qwen/qwen3-coder-next.

MISSION:
1. Identifier bugs, vulnerabilities, anti-patterns
2. Vérifier la qualité et maintenabilité
3. Optimiser les performances
4. Enforcer les best practices
5. Suggérer des améliorations

STRICTNESS LEVELS:
- Critical: Bug, security risk, crash potential → MUST FIX
- Warning: Code smell, tech debt → SHOULD FIX
- Suggestion: Style, optimization → COULD FIX

APPROVAL CRITERIA:
- Score >= 80: APPROVED
- Score 60-79: APPROVED_WITH_COMMENTS
- Score < 60: REJECTED

OUTPUT FORMAT:
{
  "approved": boolean,
  "score": number,
  "issues": { "critical": [], "warning": [], "suggestion": [] },
  "improvements": [],
  "optimizedCode": "string"
}`;

export async function reviewCode(task: ReviewTask): Promise<ReviewResult> {
  console.log(`🔍 DeepSeek Reviewer: Analyzing ${task.filename}`);
  console.log(`   Author: ${task.authorAgent} | Type: ${task.reviewType}`);
  
  const prompt = `Révise ce code ${task.language}:

FICHIER: ${task.filename}
AUTEUR: ${task.authorAgent}
TYPE: ${task.reviewType}

CODE:
\`\`\`${task.language}
${task.code}
\`\`\`

Effectue une review complète:
1. Bugs potentiels
2. Security vulnerabilities (OWASP, injection, etc.)
3. Performance issues
4. Type safety
5. Error handling
6. Code duplication
7. SOLID principles
8. Testing coverage
9. Documentation

Réponds en JSON strict.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, // Très faible pour analyse précise
      max_tokens: 8000
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Extraire JSON
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                     content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON response');
    
  } catch (error) {
    console.error('Review error:', error);
    return {
      approved: false,
      score: 0,
      issues: {
        critical: ['Review parsing failed'],
        warning: [],
        suggestion: ['Retry review']
      },
      improvements: []
    };
  }
}

export async function reviewBatch(
  files: { code: string; filename: string; language: string }[],
  authorAgent: string
): Promise<ReviewResult[]> {
  console.log(`🔍 DeepSeek Reviewer: Batch review of ${files.length} files`);
  
  const results = [];
  for (const file of files) {
    const result = await reviewCode({
      code: file.code,
      language: file.language,
      filename: file.filename,
      reviewType: 'full',
      authorAgent
    });
    results.push(result);
  }
  
  return results;
}

export async function generateReport(
  reviews: ReviewResult[],
  projectName: string
): Promise<string> {
  const totalScore = reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length;
  const approved = reviews.filter(r => r.approved).length;
  const criticalIssues = reviews.flatMap(r => r.issues.critical).length;
  
  return `# Code Review Report: ${projectName}

## 📊 Summary
- **Average Score:** ${totalScore.toFixed(1)}/100
- **Approved:** ${approved}/${reviews.length} files
- **Critical Issues:** ${criticalIssues}

## 🎯 Verdict
${totalScore >= 80 ? '✅ APPROVED' : totalScore >= 60 ? '⚠️ APPROVED WITH COMMENTS' : '❌ REJECTED'}

## 📋 Details
${reviews.map((r, i) => `
### File ${i + 1}
- Score: ${r.score}/100
- Status: ${r.approved ? '✅' : '❌'}
- Critical: ${r.issues.critical.length}
- Warnings: ${r.issues.warning.length}
`).join('\n')}

---
*Reviewed by DeepSeek (agent-code-reviewer)*
`;
}

export { ReviewTask, ReviewResult };
