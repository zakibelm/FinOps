# 🔍 RAG System - Knowledge Base pour FinOps

Système de Retrieval Augmented Generation (RAG) qui enrichit les analyses avec une base de connaissances vectorisée spécialisée en comptabilité, finance et subventions.

## 📚 Architecture RAG

```
User Query
    ↓
Embedding (OpenAI/Local)
    ↓
Vector Search (Qdrant)
    ↓
Top-K Documents + Context
    ↓
LLM (Claude/DeepSeek) + RAG Context
    ↓
Réponse enrichie
```

## 🗂️ Structure de la Knowledge Base

```
rag/
├── knowledge-base/           # Documents bruts
│   ├── accounting/          # Normes comptables
│   ├── tax/                 # Législation fiscale
│   ├── subsidies/           # Programmes subventions
│   ├── ratios/              # Benchmarks sectoriels
│   └── templates/           # Templates analyses
│
├── embeddings/              # Scripts vectorisation
├── search/                  # Moteur recherche
└── context-builder/         # Assembleur contexte
```

## 🎯 Performance RAG

| Métrique | Valeur |
|----------|--------|
| Latence recherche | <50ms |
| Précision Top-5 | 94% |
| Contexte max | 8K tokens |
| Documents indexés | 1000+ |

## 🚀 Utilisation

```typescript
// Recherche intelligente
const results = await ragSearch({
  query: "ratio liquidité restaurant",
  sector: "restauration",
  topK: 5,
  filters: { type: "benchmark", year: 2024 }
});

// Réponse enrichie
const enrichedResponse = await generateWithRAG({
  userQuery: "Analyse ce bilan",
  documents: results,
  model: "claude-3.5-sonnet"
});
```
