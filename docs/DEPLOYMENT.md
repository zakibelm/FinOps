# Guide de Déploiement FinOps

## Déploiement Local (Développement)

```bash
# 1. Cloner et setup
git clone https://github.com/zakibelm/FinOps.git
cd FinOps
./setup.sh  # ou setup.bat sur Windows

# 2. Lancer tout
npm run dev
```

## Déploiement Production

### Option 1: Railway (Recommandé - Facile)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialiser projet
railway init

# Deploy
railway up
```

Variables d'environnement sur Railway:
- `OPENROUTER_API_KEY`
- `JWT_SECRET`
- `DATABASE_URL` (PostgreSQL Railway)
- `REDIS_URL` (Redis Railway)

### Option 2: Fly.io (Performant)

```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Lancer app
fly launch

# Deploy
fly deploy
```

### Option 3: VPS (AWS, GCP, Azure)

```bash
# Sur le serveur
git clone https://github.com/zakibelm/FinOps.git
cd FinOps

# Copier env
cp .env.example .env
# Éditer .env

# Lancer avec Docker Compose Production
docker-compose -f infrastructure/docker-compose.prod.yml up -d
```

## Configuration Production

### Variables d'environnement essentielles

```env
# Production
NODE_ENV=production

# Sécurité
JWT_SECRET=votre_secret_tres_long_et_aleatoire
JWT_EXPIRES_IN=7d

# Base de données (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/finops

# Cache (Redis)
REDIS_URL=redis://user:password@host:6379

# IA (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-votre_cle

# Optionnel: Sentry pour monitoring erreurs
SENTRY_DSN=votre_dsn_sentry
```

### SSL/HTTPS

Avec Railway/Fly.io: **Automatique**

Avec VPS:
```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Générer certificat
sudo certbot --nginx -d votre-domaine.com
```

## Monitoring

### Logs
```bash
# Docker
docker-compose logs -f gateway
docker-compose logs -f workers

# Railway
railway logs

# Fly.io
fly logs
```

### Métriques
Accéder au dashboard:
- Railway: Dashboard web
- Fly.io: `fly status`
- VPS: Prometheus + Grafana (optionnel)

## Scaling

### Horizontal (plus d'instances)

```yaml
# docker-compose.prod.yml
workers:
  deploy:
    replicas: 5  # Augmenter selon besoin
```

### Vertical (plus de ressources)

Augmenter CPU/RAM dans le dashboard Railway/Fly.io.

## Backup

### Base de données PostgreSQL
```bash
# Backup
docker exec finops-postgres pg_dump -U finops finops > backup.sql

# Restore
docker exec -i finops-postgres psql -U finops finops < backup.sql
```

### Automatisation (cron)
```bash
# Tous les jours à 2h
0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### Problème: Workers ne démarrent pas
**Solution:** Vérifier Redis `docker-compose logs redis`

### Problème: Gateway ne répond pas
**Solution:** Vérifier ports et env vars

### Problème: Coûts trop élevés
**Solution:** Augmenter cache TTL, vérifier similarité threshold

## Support

En cas de problème:
1. Consulter les logs: `docker-compose logs`
2. Ouvrir une issue sur GitHub
3. Email: zakibelm@gmail.com

---

**Ready to deploy!** 🚀
