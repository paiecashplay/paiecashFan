#!/bin/bash

# ========================================
# SCRIPT AUTOMATIQUE POUR GITHUB
# PaieCashFan V11.3.1
# ========================================

echo "🚀 PaieCashFan - Push vers GitHub"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé !${NC}"
    echo "Installer Git depuis : https://git-scm.com/downloads"
    exit 1
fi

echo -e "${GREEN}✅ Git est installé${NC}"
echo ""

# Vérifier si c'est déjà un repository Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Ce n'est pas encore un repository Git${NC}"
    echo "Initialisation..."
    git init
    echo -e "${GREEN}✅ Repository Git initialisé${NC}"
    echo ""
fi

# Demander l'URL du repository GitHub
echo -e "${YELLOW}📝 Entrez l'URL de votre repository GitHub :${NC}"
echo "   Exemple: https://github.com/votreusername/paiecashfan.git"
read -p "URL : " repo_url

if [ -z "$repo_url" ]; then
    echo -e "${RED}❌ URL vide ! Abandon.${NC}"
    exit 1
fi

# Vérifier si remote existe déjà
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' existe déjà${NC}"
    echo "Mise à jour de l'URL..."
    git remote set-url origin "$repo_url"
else
    echo "Ajout du remote..."
    git remote add origin "$repo_url"
fi

echo -e "${GREEN}✅ Remote configuré${NC}"
echo ""

# Demander un message de commit
echo -e "${YELLOW}📝 Entrez un message de commit :${NC}"
echo "   (Appuyez sur Entrée pour utiliser le message par défaut)"
read -p "Message : " commit_message

if [ -z "$commit_message" ]; then
    commit_message="🚀 Update - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Ajouter tous les fichiers
echo ""
echo "📦 Ajout des fichiers..."
git add .

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Aucun changement détecté${NC}"
    echo "Voulez-vous quand même push ? (o/n)"
    read -p "> " force_push
    if [ "$force_push" != "o" ]; then
        echo "Abandon."
        exit 0
    fi
else
    echo -e "${GREEN}✅ Fichiers ajoutés${NC}"
fi

# Commit
echo ""
echo "💾 Création du commit..."
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit créé${NC}"
else
    echo -e "${YELLOW}⚠️  Commit échoué ou rien à commiter${NC}"
fi

# Vérifier si la branche main existe
if ! git rev-parse --verify main &> /dev/null; then
    echo "Création de la branche main..."
    git branch -M main
fi

# Push vers GitHub
echo ""
echo "🚀 Push vers GitHub..."
echo -e "${YELLOW}Note: Vous devrez peut-être entrer votre token GitHub${NC}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ SUCCÈS ! Code poussé vers GitHub${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "🌐 Votre repository : $repo_url"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ ERREUR lors du push${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Vérifiez :"
    echo "1. L'URL du repository est correcte"
    echo "2. Vous avez les droits d'accès"
    echo "3. Votre token GitHub est valide"
    echo ""
    echo "Pour créer un token :"
    echo "👉 https://github.com/settings/tokens"
    echo ""
fi
