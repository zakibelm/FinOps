/**
 * Agent Database Coder
 * Model: qwen/qwen3-coder-next
 * Reviewed by: deepseek/deepseek-chat
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'Database Coder Agent'
  }
});

interface DatabaseTask {
  orm: 'prisma' | 'typeorm' | 'drizzle' | 'mongoose';
  database: 'postgres' | 'mysql' | 'mongodb' | 'sqlite';
  entities: string[];
  relations?: string[];
  indexes?: string[];
}

const SYSTEM_PROMPT = `Tu es un expert en bases de données.
Tu utilises EXCLUSIVEMENT le modèle qwen/qwen3-coder-next.
Ton superviseur (DeepSeek) va réviser ton code.

RÈGLES STRICTES:
1. Normalisation 3NF minimum
2. Index sur clés étrangères
3. Contraintes (NOT NULL, UNIQUE, CHECK)
4. Migrations versionnées
5. Seeders pour données test
6. Soft deletes (paranoid)
7. Timestamps (createdAt, updatedAt)
8. Relations correctement typées
9. Transactions pour opérations multiples
10. Query optimization (EXPLAIN ANALYZE)`;

export async function generateSchema(task: DatabaseTask): Promise<string> {
  console.log(`🗄️ Database Coder: ${task.entities.join(', ')}`);
  
  const prompt = `Crée un schéma ${task.orm.toUpperCase()} pour ${task.database}:

Entités: ${task.entities.join(', ')}
${task.relations ? `Relations: ${task.relations.join(', ')}` : ''}
${task.indexes ? `Indexes: ${task.indexes.join(', ')}` : ''}

Génère:
1. Schema/Models
2. Migrations
3. Seeders
4. Relations et contraintes
5. Requêtes exemples`;

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

export async function optimizeQuery(
  slowQuery: string,
  database: string
): Promise<string> {
  const prompt = `Optimise cette requête ${database}:

\`\`\`sql
${slowQuery}
\`\`\`

Fournis:
1. Requête optimisée
2. Index recommandés
3. Explication des changements`;

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

export { DatabaseTask };
