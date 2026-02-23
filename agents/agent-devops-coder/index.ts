/**
 * Agent DevOps Coder
 * Model: qwen/qwen3-coder-next
 * Reviewed by: deepseek/deepseek-chat
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'DevOps Coder Agent'
  }
});

interface DevOpsTask {
  service: string;
  platform: 'docker' | 'kubernetes' | 'github-actions' | 'gitlab-ci' | 'terraform';
  environment: 'dev' | 'staging' | 'production';
  scale?: 'small' | 'medium' | 'large';
}

const SYSTEM_PROMPT = `Tu es un expert DevOps/Infrastructure.
Tu utilises EXCLUSIVEMENT le modèle qwen/qwen3-coder-next.
Ton superviseur (DeepSeek) va réviser ton code.

RÈGLES STRICTES:
1. Docker: Multi-stage builds, distroless images
2. K8s: Health checks, resource limits, HPA
3. CI/CD: Caching, parallel jobs, security scan
4. Secrets: Jamais en dur, utiliser vault/sealed
5. Monitoring: Metrics, logs, alerts
6. Security: Non-root user, read-only FS
7. Backup: Stratégie de backup testée
8. Documentation: Comments dans YAML`;

export async function generateInfrastructure(task: DevOpsTask): Promise<string> {
  console.log(`🚀 DevOps Coder: ${task.service} on ${task.platform}`);
  
  const prompt = `Crée la configuration ${task.platform.toUpperCase()}:

Service: ${task.service}
Environment: ${task.environment}
Scale: ${task.scale || 'medium'}

Génère:
1. Configuration complète
2. Scripts de déploiement
3. Monitoring/Alerting
4. Documentation`;

  const response = await openai.chat.completions.create({
    model: 'qwen/qwen3-coder-next',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 6000
  });

  return response.choices[0]?.message?.content || '';
}

export async function generatePipeline(
  projectType: string,
  steps: string[]
): Promise<string> {
  const prompt = `Crée un pipeline GitHub Actions pour ${projectType}:

Étapes requises:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Inclure:
- Caching (npm, docker)
- Tests parallèles
- Security scan
- Deploy conditionnel`;

  const response = await openai.chat.completions.create({
    model: 'qwen/qwen3-coder-next',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 4000
  });

  return response.choices[0]?.message?.content || '';
}

export { DevOpsTask };
