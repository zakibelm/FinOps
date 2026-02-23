# 🤖 Agent RAG - FinOps

Agent spécialisé en recherche augmentée pour l'analyse financière sectorielle.

## 🎯 Capacités

- ✅ Recherche sémantique dans la base de connaissances
- ✅ Benchmarks sectoriels (restaurant, retail, manufacturing, tech, construction)
- ✅ Réponses sourcées avec citations
- ✅ Fallback web si données locales insuffisantes
- ✅ Comparaison de métriques aux benchmarks

## 🚀 Utilisation

### Via sessions_spawn

```javascript
// Recherche simple
const result = await sessions_spawn({
  agentId: "agent-rag",
  task: "Quels sont les ratios standards pour un restaurant?",
  label: "rag-restaurant"
});

// Avec options
const result = await sessions_spawn({
  agentId: "agent-rag", 
  task: "JSON:{"question": "Analyze ce bilan", "sector": "retail", "includeBenchmarks": true}",
  label: "rag-analysis"
});
```

### Directement

```typescript
import { queryRAG, compareBenchmarks } from './index';

// Recherche
const response = await queryRAG(
  "Quelle est la marge opérationnelle moyenne?",
  { sector: 'restaurant', includeBenchmarks: true }
);

// Comparaison benchmarks
const comparison = await compareBenchmarks({
  food_cost: 0.35,
  labor_cost: 0.38
}, 'restaurant');
```

## 📊 Secteurs supportés

- 🍽️ **Restaurant** (food_cost, labor_cost, operating_margin)
- 🛍️ **Retail** (gross_margin, inventory_turnover)
- 🏭 **Manufacturing** (ebitda_margin, debt_ratio)
- 💻 **Technology** (r_and_d_ratio, burn_rate, SaaS metrics)
- 🏗️ **Construction** (wcr_days, project_margin)

## 📝 Note

Basé sur:
- `agentic-rag` du AI Engineering Hub
- `modernbert-rag` pour les embeddings

Adapté pour architecture serverless avec OpenRouter.
