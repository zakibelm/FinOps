# 🚀 Déploiement Apify - FinOps

Guide de déploiement sur Apify (recommandé pour API/Agents).

## Pourquoi Apify ?

✅ **Plus simple que Vercel** pour backends/API  
✅ **Intégration native** avec scraping et AI  
✅ **Stockage intégré** (Redis, PostgreSQL)  
✅ **Monitoring** et logs intégrés  
✅ **Coût** : Gratuit (5k compute units/mois)  

## Étape 1 : Préparation

```bash
# Installer Apify CLI
npm install -g apify-cli

# Login
apify login
```

## Étape 2 : Déployer

```bash
cd FinOps

# Créer l'actor
apify create finops-analyzer

# Pousser le code
apify push

# Ou avec tag spécifique
apify push --version 1.0.0
```

## Étape 3 : Configuration Variables d'Environnement

Dans la console Apify, ajouter :

| Variable | Description | Obtenir sur |
|----------|-------------|-------------|
| `OPENROUTER_API_KEY` | Clé API OpenRouter | openrouter.ai |
| `REDIS_URL` | URL Redis (fourni parApify) | Auto |
| `DATABASE_URL` | URL PostgreSQL | Auto |
| `JWT_SECRET` | Secret pour tokens | Générer |

## Étape 4 : Utilisation API

```bash
# Appel API
apify call finops-analyzer --input='{
  "query": "Analyze liquidity ratio",
  "sector": "restaurant",
  "analysisType": "standard"
}'

# Ou avec curl
curl -X POST https://api.apify.com/v2/acts/zakibelm~finops-analyzer/runs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "query": "Calculate financial ratios",
    "sector": "retail"
  }'
```

## 📊 Pricing Apify

| Plan | Compute Units | Prix |
|------|--------------|------|
| **Free** | 5,000/mois | $0 |
| Starter | 50,000/mois | $49 |

**5,000 CU ≈ 1,000 analyses complètes** (suffisant pour démarrer)

## 🔗 URL après déploiement

```
https://console.apify.com/actors/zakibelm~finops-analyzer
https://api.apify.com/v2/acts/zakibelm~finops-analyzer/runs
```

## ✅ Avantages vs Vercel

| Critère | Vercel | **Apify** |
|---------|--------|-----------|
| Setup | Complexe | **Simple** |
| Backend | Serveless limité | **Serveless puissant** |
| File system | Read-only | **Read/Write** |
| Queue tâches | Non | **Intégré** |
| Cron jobs | Limité | **Natif** |
| Prix API | $20/mois | **Gratuit** |

**Parfait pour ton API d'agents !** 🎯
