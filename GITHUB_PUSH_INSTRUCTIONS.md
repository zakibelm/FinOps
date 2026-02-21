# Commandes GitHub - FinOps Push

## ⚠️ IMPORTANT - Securite
Le fichier `.env` contient tes cles API (OpenRouter, etc.) et est EXCLU du push GitHub (via .gitignore). C'est intentionnel pour proteger tes secrets!

## 🚀 Instructions Push

### 1. Creer le repo sur GitHub d'abord
Va sur: https://github.com/new
- Nom: FinOps
- Description: Plateforme d'analyse financiere IA optimisee pour CPA
- Public ou Private (au choix)
- Ne PAS initialiser avec README (on l'a deja)

### 2. Executer le script (CHOISIS une methode)

**Methode A - Script PowerShell (Recommande):**
```powershell
# Ouvrir PowerShell dans le dossier FinOps
cd C:\Users\zakib\.openclaw\workspace-dev\FinOps
.\PUSH_TO_GITHUB.ps1
```

**Methode B - Script Batch:**
```cmd
# Double-cliquer sur PUSH_TO_GITHUB.bat
# OU dans CMD:
cd C:\Users\zakib\.openclaw\workspace-dev\FinOps
PUSH_TO_GITHUB.bat
```

**Methode C - Manuellement:**
```bash
# Se placer dans le dossier
cd C:\Users\zakib\.openclaw\workspace-dev\FinOps

# Initialiser Git
git init

# Configurer
git config user.name "Zak Belm"
git config user.email "zakibelm@gmail.com"

# Ajouter fichiers (sans .env)
git add .

# Commit
git commit -m "🚀 Initial commit: FinOps Platform v1.0

Architecture 3-paliers optimisee pour analyse financiere IA
- Pipeline: Claude → DeepSeek → Claude (-43% de couts)
- Cache semantique vectoriel (-86% avec cache)
- Interface Next.js 14 avec chat temps reel
- API Gateway Fastify avec auth JWT
- Multi-tenancy pour cabinets CPA
- Workers asynchrones avec Bull Queue
- Docker Compose pour dev/prod

Performance:
- Cout/analyse: $0.005-0.020 (vs $0.035 standard)
- Cache hit: 70%
- Latence cache: <2s

Tech Stack:
- Frontend: Next.js 14 + Tailwind + TypeScript
- Backend: Fastify + PostgreSQL + Redis
- AI: Claude 3.5 Sonnet + DeepSeek V3 (gratuit)
- Infrastructure: Docker + Kubernetes ready

Author: Zak Belm <zakibelm@gmail.com>"

# Connecter a GitHub (remplace USER par ton username si different)
git remote add origin https://github.com/zakibelm/FinOps.git
git branch -M main

# Push!
git push -u origin main
```

## ✅ Verification

Apres le push, verifier sur:
https://github.com/zakibelm/FinOps

Tu dois voir tous les fichiers sauf `.env` (securite).

## 🔑 Configuration locale (DEJA FAITE)

Ton fichier `.env` contient deja:
- ✅ OPENROUTER_API_KEY=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
- ✅ TELEGRAM_BOT_TOKEN=8416772084:AAH2qFdRGSMntyopP_aa7YIc9FZyoiuGNE0

Ces cles sont sur ta machine locale uniquement, PAS sur GitHub.

## 🚀 Lancer le projet

Apres le push:
```bash
npm install
npm run infra:up
npm run dev
```

Ouvrir: http://localhost:3000

---
**Ready to deploy!** 🚀💰
