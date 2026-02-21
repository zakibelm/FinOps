# Structure du Projet FinOps

```
FinOps/
├── README.md                          # Documentation principale
├── package.json                       # Configuration root
├── .env.example                       # Template variables d'environnement
├── setup.sh                           # Script de setup automatique
├── LICENSE                            # License MIT
│
├── frontend/                          # Interface Web (Next.js 14)
│   ├── package.json
│   ├── next.config.ts
│   ├── Dockerfile
│   ├── app/
│   │   ├── layout.tsx                 # Layout principal
│   │   ├── page.tsx                   # Page d'accueil
│   │   ├── globals.css                # Styles globaux
│   │   └── dashboard/
│   ├── components/
│   │   ├── chat/                      # Composants chat IA
│   │   ├── layout/                    # Sidebar, Header
│   │   └── ui/                        # Composants UI (shadcn)
│   └── lib/
│       ├── api.ts                     # Client API
│       └── utils.ts                   # Utilitaires
│
├── gateway/                           # API Gateway (Fastify)
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts                   # Point d'entrée
│   │   ├── routes/
│   │   │   ├── analysis.ts            # Routes analyses
│   │   │   ├── auth.ts                # Routes auth
│   │   │   └── cache.ts               # Routes cache
│   │   ├── services/
│   │   │   ├── analysis.ts            # Service analyse
│   │   │   ├── cache.ts               # Service cache
│   │   │   └── queue.ts               # Service queue
│   │   ├── middleware/
│   │   │   └── errorHandler.ts        # Gestion erreurs
│   │   └── websocket.ts               # WebSocket handler
│   └── prisma/
│       └── schema.prisma              # Schema DB
│
├── workers/                           # Workers Pipeline 3-Paliers
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── index.ts                   # Orchestrateur workers
│       ├── processors/
│       │   ├── phase1.ts              # Phase 1: Analyste (Claude)
│       │   ├── phase2.ts              # Phase 2: Rechercheur (DeepSeek)
│       │   └── phase3.ts              # Phase 3: Validateur (Claude)
│       └── config/
│           └── redis.ts               # Config Redis
│
├── shared/                            # Code partagé
│   ├── package.json
│   ├── src/
│   │   ├── types/                     # Types TypeScript
│   │   ├── constants/                 # Constantes
│   │   └── utils/                     # Utilitaires
│   └── dist/                          # Build output
│
├── infrastructure/                    # Docker & K8s
│   ├── docker-compose.yml             # Dev environment
│   ├── docker-compose.prod.yml        # Production
│   └── k8s/                           # Kubernetes manifests
│
└── docs/                              # Documentation
    ├── README.md                      # Doc principale
    ├── architecture.md                # Architecture détaillée
    ├── api-reference.md               # Référence API
    ├── deployment.md                  # Guide déploiement
    └── configuration.md               # Guide configuration
```

## Explication des Composants

### Frontend (Next.js 14)
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Query
- **Communication:** WebSocket pour streaming temps réel

### Gateway (Fastify)
- **Framework:** Fastify (performant)
- **Auth:** JWT avec rôles (CPA, Client, Admin)
- **Cache:** Redis avec stratégie sémantique
- **Queue:** Bull pour gestion jobs
- **WebSocket:** Socket.io pour temps réel

### Workers (Bull + OpenRouter)
- **Queue:** Bull avec Redis
- **Pipeline:** 3 phases séparées
  - Phase 1: Claude Sonnet (planification)
  - Phase 2: DeepSeek V3 (calculs GRATUITS)
  - Phase 3: Claude Sonnet (validation)
- **Scalabilité:** Workers indépendants, scalable horizontalement

### Infrastructure
- **Docker Compose:** Dev local
- **Kubernetes:** Production (cloud)
- **Services:**
  - Redis: Cache + Queue
  - PostgreSQL: Données persistantes
  - Qdrant: Vector DB (cache sémantique)

## Flux de Données

```
1. Utilisateur envoie requête
   ↓
2. Gateway vérifie auth + cache sémantique
   ↓
3. Si cache miss → Queue le job
   ↓
4. Phase 1 Worker: Planifie l'analyse
   ↓
5. Phase 2 Worker: DeepSeek calcule (GRATUIT)
   ↓
6. Phase 3 Worker: Claude valide et formate
   ↓
7. Résultat stocké en cache + retourné
   ↓
8. Frontend affiche avec streaming
```

## Performance Optimisée

- **Coût/analyse:** $0.020 (-43% vs solution directe)
- **Avec cache:** $0.005 (-86%)
- **Cache hit rate:** 70% (sectoriel)
- **Latence cache:** < 2s
- **Latence nouvelle:** 25-35s

## Sécurité

- Auth JWT avec refresh tokens
- Données chiffrées AES-256
- Isolation multi-tenant (CPA)
- Audit trail complet
- Rate limiting
- RGPD/PIPEDA compliant
