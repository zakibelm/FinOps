/**
 * Agent Frontend Coder
 * Model: qwen/qwen3-coder-next
 * Reviewed by: deepseek/deepseek-chat
 */

import OpenAI from 'openai';
import * as fs from 'fs';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/zakibelm/FinOps',
    'X-Title': 'Frontend Coder Agent'
  }
});

interface FrontendTask {
  componentName: string;
  description: string;
  techStack: 'react' | 'nextjs' | 'vue' | 'svelte' | 'vanilla';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'none';
  requirements?: string[];
  tests?: boolean;
  accessibility?: boolean;
}

const SYSTEM_PROMPT = `Tu es un développeur Frontend senior expert.
Tu utilises EXCLUSIVEMENT le modèle qwen/qwen3-coder-next.
Ton superviseur (DeepSeek) va réviser ton code.

RÈGLES STRICTES:
1. Code TypeScript avec types stricts
2. React hooks modernes (useState, useEffect, useMemo, useCallback)
3. Composants réutilisables et bien documentés
4. Props typées avec interfaces
5. Gestion des erreurs (try/catch, Error Boundaries)
6. Loading states et skeletons
7. Responsive design (mobile-first)
8. Accessibilité (aria-labels, roles, keyboard nav)
9. Commentaires JSDoc
10. Export named (pas default)

STRUCTURE DE RÉPONSE:
- Fichier: [nom]
- Langage: [ts/tsx]
- Code: [code complet]
- Tests: [tests unitaires]
- Explication: [choix techniques]`;

export async function generateComponent(task: FrontendTask): Promise<string> {
  console.log(`🎨 Frontend Coder: ${task.componentName}`);
  
  const prompt = `Crée un composant ${task.techStack.toUpperCase()}:

Nom: ${task.componentName}
Description: ${task.description}
Style: ${task.styling}
${task.requirements ? `Exigences: ${task.requirements.join(', ')}` : ''}
${task.tests ? 'Inclure tests Jest/React Testing Library' : ''}
${task.accessibility ? 'WCAG 2.1 AA compliant' : ''}

Génère:
1. Le composant principal (.tsx)
2. Le fichier de types (.types.ts)
3. Les tests (.test.tsx)
4. Le storybook (.stories.tsx) si applicable

Réponds en JSON avec tous les fichiers.`;

  const response = await openai.chat.completions.create({
    model: 'qwen/qwen3-coder-next',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 8000
  });

  const code = response.choices[0]?.message?.content || '';
  
  // Sauvegarder le fichier
  const outputDir = `./output/${task.componentName}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(`${outputDir}/${task.componentName}.tsx`, code);
  
  // Demander révision au reviewer
  return code;
}

export async function refactorCode(
  existingCode: string,
  instructions: string
): Promise<string> {
  const prompt = `Refactorise ce code React/TypeScript:

CODE EXISTANT:
\`\`\`tsx
${existingCode}
\`\`\`

INSTRUCTIONS:
${instructions}

Règles:
- Conserver la fonctionnalité
- Améliorer la performance
- Supprimer la dette technique
- Ajouter types manquants`;

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

export { FrontendTask };
