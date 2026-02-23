/**
 * Agent Backend Coder
 * Model: qwen/qwen3-coder-next
 * Reviewed by: deepseek/deepseek-chat
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'Backend Coder Agent'
  }
});

interface BackendTask {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  framework: 'express' | 'fastify' | 'nest' | 'fastapi' | 'django';
  auth?: boolean;
  validation?: boolean;
  caching?: boolean;
  database?: 'postgres' | 'mongodb' | 'mysql' | 'redis';
}

const SYSTEM_PROMPT = `Tu es un développeur Backend senior expert.
Tu utilises EXCLUSIVEMENT le modèle qwen/qwen3-coder-next.
Ton superviseur (DeepSeek) va réviser ton code.

RÈGLES STRICTES:
1. Validation des inputs (Zod, Joi, ou class-validator)
2. Gestion des erreurs avec middleware
3. Logging structuré (Winston, Pino)
4. Rate limiting
5. Authentification JWT si requise
6. Documentation OpenAPI/Swagger
7. Tests unitaires et d'intégration
8. Pagination pour les listes
9. Transactions DB quand nécessaire
10. Idempotence pour POST/PUT`;

export async function generateEndpoint(task: BackendTask): Promise<string> {
  console.log(`⚙️ Backend Coder: ${task.method} ${task.endpoint}`);
  
  const prompt = `Crée un endpoint ${task.framework.toUpperCase()}:

${task.method} ${task.endpoint}
Framework: ${task.framework}
${task.auth ? 'Authentication: JWT requise' : ''}
${task.validation ? 'Validation: Zod' : ''}
${task.caching ? 'Cache: Redis' : ''}
${task.database ? `Database: ${task.database}` : ''}

Génère:
1. Controller/Handler
2. Service/Business logic
3. Validation schema
4. Error handling
5. Tests (Jest/Vitest)

Réponds avec tous les fichiers.`;

  const response = await openai.chat.completions.create({
    model: 'qwen/qwen3-coder-next',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 8000
  });

  return response.choices[0]?.message?.content || '';
}

export async function generateMiddleware(
  type: 'auth' | 'rate-limit' | 'error-handler' | 'logger',
  framework: string
): Promise<string> {
  const prompt = `Crée un middleware ${type} pour ${framework}:

Règles:
- TypeScript strict
- Performance optimisée
- Gestion d'erreurs
- Tests inclus`;

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

export { BackendTask };
