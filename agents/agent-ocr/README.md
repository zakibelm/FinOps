# 🤖 Agent OCR - FinOps

Agent spécialisé dans l'extraction de données financières depuis des documents scannés.

## 🎯 Capacités

- ✅ Extraction de relevés bancaires
- ✅ Lecture de factures (montants, TVA, dates)
- ✅ Analyse de bilans comptables
- ✅ Reconnaissance de formules LaTeX (mathématiques comptables)
- ✅ Structuration JSON automatique

## 🚀 Utilisation

### Via sessions_spawn (recommandé)

```javascript
// Depuis l'agent principal (C-3PO)
const result = await sessions_spawn({
  agentId: "agent-ocr",
  task: "Extrait les données du fichier bilan_2024.pdf",
  label: "ocr-bilan"
});
```

### Directement

```typescript
import { extractDocument, batchExtract } from './index';

// Extraction simple
const data = await extractDocument('./facture.pdf', {
  documentType: 'invoice',
  extractTables: true
});

// Traitement par lot
const results = await batchExtract([
  './doc1.pdf',
  './doc2.pdf'
], { documentType: 'auto' });
```

## 📦 Structure de sortie

```json
{
  "metadata": {
    "type": "invoice",
    "confidence": "high",
    "date_detection": "2024-01-15"
  },
  "structured_data": {
    "fournisseur": "Société XYZ",
    "montant_ht": 1000.00,
    "tva": 200.00,
    "montant_ttc": 1200.00,
    "date": "2024-01-15",
    "numero": "FAC-2024-001"
  },
  "tables": [...]
}
```

## 🔧 Configuration requise

Variable d'environnement:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

## 📝 Note

Basé sur les projets:
- `gemma3-ocr` du AI Engineering Hub
- `LaTeX-OCR-with-Llama`

Adapté pour utiliser OpenRouter API au lieu d'Ollama local.
