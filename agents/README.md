# 🤖 Multi-Agents FinOps - Configuration

Configuration des agents spécialisés basés sur le AI Engineering Hub.

## 📁 Structure

```
agents/
├── agent-ocr/          # Extraction de documents
├── agent-rag/          # Recherche intelligente
├── agent-workflow/     # Orchestration multi-étapes
└── agent-analysis/     # Analyse financière
```

## 🚀 Utilisation depuis C-3PO

### Méthode 1: Via sessions_spawn (recommandée)

```javascript
// 1. Extraire un document
const ocrResult = await sessions_spawn({
  agentId: "agent-ocr",
  task: "Extrait les données de ./facture.pdf",
  label: "ocr-task"
});

// 2. Recherche sectorielle
const ragResult = await sessions_spawn({
  agentId: "agent-rag",
  task: "JSON:{"question": "Ratios restaurant?", "sector": "restaurant"}",
  label: "rag-task"
});

// 3. Orchestration complète
const workflowResult = await sessions_spawn({
  agentId: "agent-workflow",
  task: "JSON:{"query": "Analyse ce bilan", "analysisType": "complex"}",
  label: "workflow-task"
});

// 4. Analyse financière
const analysisResult = await sessions_spawn({
  agentId: "agent-analysis",
  task: "JSON:{"data": {...}, "analysisType": "comprehensive"}",
  label: "analysis-task"
});
```

### Méthode 2: Workflow orchestré par C-3PO

```javascript
// Workflow complet: OCR → RAG → Analysis
async function fullWorkflow(documentPath) {
  // Étape 1: OCR
  const extracted = await sessions_spawn({
    agentId: "agent-ocr",
    task: documentPath
  });
  
  // Étape 2: RAG pour benchmarks
  const benchmarks = await sessions_spawn({
    agentId: "agent-rag",
    task: `Compare ${extracted.sector}`
  });
  
  // Étape 3: Analyse finale
  const analysis = await sessions_spawn({
    agentId: "agent-analysis",
    task: JSON.stringify({
      data: extracted.structured_data,
      benchmarks: benchmarks
    })
  });
  
  return analysis;
}
```

## 🔧 Installation des dépendances

```bash
cd agents/agent-ocr && npm install
cd ../agent-rag && npm install
cd ../agent-workflow && npm install
cd ../agent-analysis && npm install
```

## 📊 Capacités des Agents

| Agent | Source GitHub | Adaptation | Fonction |
|-------|--------------|------------|----------|
| **agent-ocr** | gemma3-ocr + LaTeX-OCR | OpenRouter API | Extraction documents financiers |
| **agent-rag** | agentic-rag + modernbert | Serverless | Recherche sectorielle + benchmarks |
| **agent-workflow** | book-writer-flow + crewai | 3-phase pipeline | Orchestration Claude → DeepSeek → Claude |
| **agent-analysis** | autogen-stock-analyst | Ratios financiers | Calculs + diagnostic + recommandations |

## 🔑 Configuration requise

Variable d'environnement dans chaque agent:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

## 📝 Exemples de tâches

### OCR
```
@agent-ocr ./bilan_2024.pdf balance_sheet
@agent-ocr ./facture.jpg invoice
@agent-ocr ./releve_bancaire.png bank_statement
```

### RAG
```
@agent-rag "Quels sont les KPIs d'un restaurant?"
@agent-rag JSON:{"question": "Marge brute retail", "sector": "retail"}
```

### Workflow
```
@agent-workflow "Analyse complète de mon entreprise"
@agent-workflow JSON:{"query": "Due diligence", "analysisType": "complex"}
```

### Analysis
```
@agent-analysis JSON:{"data": {"balanceSheet": {...}}, "type": "comprehensive"}
```

## 🎯 Prochaines étapes

1. **Builder** les agents: `npm run build` dans chaque dossier
2. **Tester** individuellement chaque agent
3. **Créer** des workflows combinés via C-3PO
4. **Monitorer** les performances et coûts

---
*Intégration basée sur: https://github.com/patchy631/ai-engineering-hub*
