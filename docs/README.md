# FinOps - Documentation Complète

## Table des Matières

1. [Architecture](./architecture.md)
2. [Démarrage Rapide](./quickstart.md)
3. [Configuration](./configuration.md)
4. [API Reference](./api-reference.md)
5. [Déploiement](./deployment.md)
6. [Monitoring](./monitoring.md)
7. [FAQ](./faq.md)

## Architecture

### Vue d'ensemble

FinOps utilise une architecture **event-driven** avec **pipeline 3-paliers** optimisé pour les analyses financières.

### Pipeline 3-Paliers

```
Phase 1: Analyste (Claude Sonnet)
├── Planifie l'analyse
├── Détecte le niveau utilisateur
└── Identifie les red flags
    ↓
Phase 2: Rechercheur (DeepSeek V3)
├── Effectue les calculs précis
├── Recherche des subventions
├── Analyse les benchmarks
└── GRATUIT
    ↓
Phase 3: Validateur (Claude Sonnet)
├── Vérifie les calculs
├── Valide les recommandations
├── Formate la réponse
└── Ajoute les disclaimers
```

### Cache Sémantique

Notre innovation clé : un **cache vectoriel** qui réutilise les analyses sectorielles.

**Exemple:**
- Demande 1: "Analyse restaurant Montréal" → Pipeline complet ($0.020)
- Demande 2: "Analyse bistro Québec" → Cache hit adapté ($0.005)

**Gain:** 70% des requêtes servies depuis le cache avec adaptation.

### Multi-Tenancy

Chaque CPA a un **espace isolé**:
- Données chiffrées AES-256
- Clients séparés
- Historique persistant
- Facturation séparée

## Démarrage Rapide

### 1. Cloner et Installer

```bash
git clone https://github.com/zakibelm/FinOps.git
cd FinOps
npm run setup
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos clés
```

### 3. Lancer l'infrastructure

```bash
npm run infra:up
```

### 4. Démarrer les services

```bash
npm run dev
```

Accéder à:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Documentation API: http://localhost:3001/docs

## Configuration

### Variables d'environnement essentielles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Clé API OpenRouter | `sk-or-v1-...` |
| `DATABASE_URL` | URL PostgreSQL | `postgresql://...` |
| `REDIS_URL` | URL Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Secret JWT | `super-secret-key` |

### Modèles IA configurables

```env
# Phase 1: Planification
MODEL_PHASE1_ANALYST=anthropic/claude-3-5-sonnet-20241022

# Phase 2: Calculs (GRATUIT)
MODEL_PHASE2_RESEARCHER=openrouter/deepseek/deepseek-v3

# Phase 3: Validation
MODEL_PHASE3_VALIDATOR=anthropic/claude-3-5-sonnet-20241022
```

## API Reference

### Endpoints principaux

#### POST /api/analysis
Lancer une analyse financière.

**Request:**
```json
{
  "type": "full-diagnostic",
  "document": {
    "query": "Analyse ce bilan pour un crédit",
    "data": { ... }
  },
  "options": {
    "sector": "restaurant",
    "region": "quebec"
  }
}
```

**Response:**
```json
{
  "status": "queued",
  "jobId": "job-123",
  "estimatedTime": 30
}
```

#### GET /api/analysis/:id
Récupérer le statut et résultat.

#### WebSocket /ws/stream
Streaming temps réel des résultats.

## Déploiement

### Production avec Docker

```bash
# Build
docker-compose -f infrastructure/docker-compose.prod.yml build

# Deploy
docker-compose -f infrastructure/docker-compose.prod.yml up -d
```

### Cloud (Recommandé)

#### Railway / Fly.io
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### AWS/GCP (K8s)
```bash
kubectl apply -f infrastructure/k8s/
```

## Monitoring

### Métriques clés

| Métrique | Cible | Alert si |
|----------|-------|----------|
| Latence moyenne | < 30s | > 45s |
| Cache hit rate | > 70% | < 60% |
| Coût/analyse | < $0.025 | > $0.030 |
| Error rate | < 1% | > 5% |

### Dashboard

Accéder au dashboard de monitoring:
```
http://localhost:3001/monitoring
```

## FAQ

### Q: Pourquoi DeepSeek V3 et pas GPT-4 ?
**R:** DeepSeek V3 est :
- Gratuit via OpenRouter
- Meilleur pour les calculs mathématiques
- Plus rapide pour les tâches structurées

### Q: Le cache sémantique est-il sécurisé ?
**R:** Oui :
- Données chiffrées
- Anonymisées avant stockage
- Pas de données client dans le cache partagé

### Q: Peut-on self-hoster ?
**R:** Oui, tout est Dockerisé. Vous avez besoin de :
- Docker + Docker Compose
- Clé OpenRouter (gratuit à $5 pour commencer)
- Optionnel : comptes QuickBooks/Xero pour intégrations

---

Pour plus d'informations, consulter la documentation détaillée dans `/docs`.
