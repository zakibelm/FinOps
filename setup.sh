#!/bin/bash
#
# Script de setup pour FinOps Platform
# Usage: ./setup.sh
#

set -e

echo "🚀 FinOps Platform - Setup"
echo "=========================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js 18+: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION détecté, 18+ requis${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) détecté${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker n'est pas installé (optionnel mais recommandé)${NC}"
    echo "Installez Docker: https://docs.docker.com/get-docker/"
else
    echo -e "${GREEN}✅ Docker détecté${NC}"
fi

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Copier le fichier .env si inexistant
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  N'oubliez pas d'éditer le fichier .env avec vos clés API${NC}"
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# Lancer l'infrastructure Docker
echo ""
echo "🐳 Démarrage de l'infrastructure (Redis, PostgreSQL)..."
npm run infra:up

# Attendre que les services soient prêts
echo ""
echo "⏳ Attente du démarrage des services (10s)..."
sleep 10

# Vérifier que Redis est accessible
if command -v redis-cli &> /dev/null; then
    if redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✅ Redis opérationnel${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis ne répond pas encore${NC}"
    fi
fi

# Vérifier que PostgreSQL est accessible
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL opérationnel${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL ne répond pas encore${NC}"
    fi
fi

# Message final
echo ""
echo "=========================="
echo -e "${GREEN}✅ Setup terminé!${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Éditez le fichier .env avec vos clés API"
echo "2. Lancez: npm run dev"
echo "3. Accédez à: http://localhost:3000"
echo ""
echo "Documentation: ./docs/README.md"
echo ""
