# 🏗️ Equipe de Développement IA (Qwen3 + DeepSeek)

## Architecture

```
┌─────────────────────────────────────────┐
│    SUPERVISOR: agent-code-reviewer      │
│         Model: deepseek/deepseek-chat   │
│         Rôle: QA, Review, Validation    │
└─────────────┬───────────────────────────┘
              │ supervise & review
    ┌─────────┼─────────┬─────────┐
    ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│Frontend│ │Backend│ │Database│ │DevOps │
│Coder   │ │Coder  │ │Coder   │ │Coder  │
│(Qwen3) │ │(Qwen3)│ │(Qwen3) │ │(Qwen3)│
└───────┘ └───────┘ └───────┘ └───────┘
```

## 🤖 Agents Coder (Qwen3-Coder-Next)

### 1. agent-frontend-coder
- **Model:** `qwen/qwen3-coder-next`
- **Stack:** React, Next.js, Vue, Tailwind, TypeScript
- **Tasks:** Composants UI, Formulaires, Dashboards

```javascript
const result = await sessions_spawn({
  agentId: "agent-frontend-coder",
  task: "Crée un dashboard de KPIs financiers avec Recharts"
});
```

### 2. agent-backend-coder
- **Model:** `qwen/qwen3-coder-next`
- **Stack:** Node.js, Express, Fastify, Python/FastAPI
- **Tasks:** APIs REST, GraphQL, Auth, Rate limiting

```javascript
const result = await sessions_spawn({
  agentId: "agent-backend-coder",
  task: "JSON:{"endpoint": "/api/invoices", "method": "GET", "auth": true}"
});
```

### 3. agent-database-coder
- **Model:** `qwen/qwen3-coder-next`
- **Stack:** PostgreSQL, Prisma, TypeORM, Redis
- **Tasks:** Schémas, Migrations, Optimisations

```javascript
const result = await sessions_spawn({
  agentId: "agent-database-coder",
  task: "Crée schema Prisma pour User, Invoice, Payment"
});
```

### 4. agent-devops-coder
- **Model:** `qwen/qwen3-coder-next`
- **Stack:** Docker, K8s, GitHub Actions, Terraform
- **Tasks:** CI/CD, Infrastructure, Monitoring

```javascript
const result = await sessions_spawn({
  agentId: "agent-devops-coder",
  task: "Pipeline GitHub Actions pour Next.js + tests"
});
```

## 🔍 Supervisor: agent-code-reviewer (DeepSeek)

- **Model:** `deepseek/deepseek-chat`
- **Rôle:** Review, QA, Security audit
- **Approval Score:**
  - ≥80: ✅ APPROVED
  - 60-79: ⚠️ APPROVED_WITH_COMMENTS
  - <60: ❌ REJECTED

```javascript
// Review automatique après génération
const review = await sessions_spawn({
  agentId: "agent-code-reviewer",
  task: JSON.stringify({
    code: generatedCode,
    language: "typescript",
    filename: "Dashboard.tsx",
    authorAgent: "agent-frontend-coder"
  })
});

if (review.approved && review.score >= 80) {
  console.log("✅ Code approved!");
} else {
  console.log("❌ Issues found:", review.issues.critical);
}
```

## 🔄 Workflow Complet

```javascript
// 1. Frontend génère le composant
const ui = await sessions_spawn({
  agentId: "agent-frontend-coder",
  task: "Dashboard de suivi financier"
});

// 2. DeepSeek review
const review = await sessions_spawn({
  agentId: "agent-code-reviewer",
  task: JSON.stringify({ code: ui, language: "tsx" })
});

// 3. Si rejeté, régénérer avec feedback
if (!review.approved) {
  const uiV2 = await sessions_spawn({
    agentId: "agent-frontend-coder",
    task: `Corrige: ${review.issues.critical.join(', ')}`
  });
}

// 4. Backend crée l'API
const api = await sessions_spawn({
  agentId: "agent-backend-coder",
  task: "API /api/dashboard-data pour le dashboard"
});

// 5. Database crée le schema
const db = await sessions_spawn({
  agentId: "agent-database-coder",
  task: "Tables pour metrics dashboard"
});

// 6. DevOps crée le pipeline
const cicd = await sessions_spawn({
  agentId: "agent-devops-coder",
  task: "Docker + GitHub Actions pour deploy"
});

// 7. Final review
const finalReview = await sessions_spawn({
  agentId: "agent-code-reviewer",
  task: "Review batch de tous les fichiers"
});
```

## 📋 Checklist Agent

- [ ] Qwen3-Coder-Next pour génération rapide
- [ ] DeepSeek pour review approfondi
- [ ] Feedback loop si rejeté
- [ ] Score qualité ≥ 80
- [ ] Tests inclus
- [ ] Documentation générée

## 🔗 Références

- Qwen3-Coder: https://github.com/QwenLM/Qwen3
- DeepSeek: https://github.com/deepseek-ai
- Source inspiration: https://github.com/patchy631/ai-engineering-hub
