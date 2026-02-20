#!/bin/bash

# Script de déploiement production PaieCashFan
# Usage: ./deploy-production.sh

set -e  # Exit on error

echo "🚀 Déploiement Production PaieCashFan"
echo "======================================"
echo ""

# Vérifier les variables d'environnement
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN non défini !"
    echo "   Exportez-le d'abord : export CLOUDFLARE_API_TOKEN='votre_token'"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "ℹ️  CLOUDFLARE_ACCOUNT_ID non défini, utilisation de la valeur par défaut..."
    export CLOUDFLARE_ACCOUNT_ID="4a0b3e35f24b28cd17c247aef02dc728"
fi

echo "✅ Variables d'environnement OK"
echo ""

# Étape 1: Vérifier la connexion
echo "📡 Test de connexion Cloudflare..."
npx wrangler whoami || {
    echo "❌ Échec de connexion Cloudflare"
    exit 1
}
echo ""

# Étape 2: Créer ou vérifier la base D1
echo "📦 Vérification de la base D1..."
if npx wrangler d1 list | grep -q "paiecashfan-costreaming"; then
    echo "✅ Base D1 existe déjà"
    DATABASE_ID=$(npx wrangler d1 list | grep -A 1 "paiecashfan-costreaming" | grep -oP 'id: \K[a-f0-9-]+')
    echo "   Database ID: $DATABASE_ID"
else
    echo "🆕 Création de la base D1..."
    npx wrangler d1 create paiecashfan-costreaming | tee /tmp/d1_create.txt
    DATABASE_ID=$(cat /tmp/d1_create.txt | grep "database_id" | sed -n 's/.*database_id = "\([^"]*\)".*/\1/p')
    
    if [ -z "$DATABASE_ID" ]; then
        echo "❌ Échec création base D1"
        exit 1
    fi
    
    echo "✅ Base D1 créée : $DATABASE_ID"
    
    # Mettre à jour wrangler.jsonc
    echo "🔧 Mise à jour wrangler.jsonc..."
    sed -i "s/\"database_id\": \"create-with-wrangler-d1-create\"/\"database_id\": \"$DATABASE_ID\"/" wrangler.jsonc
fi
echo ""

# Étape 3: Appliquer les migrations
echo "🗃️  Application des migrations..."
npx wrangler d1 migrations apply paiecashfan-costreaming || {
    echo "❌ Échec application migrations"
    exit 1
}
echo "✅ Migrations appliquées"
echo ""

# Étape 4: Vérifier les tables
echo "🔍 Vérification des tables..."
npx wrangler d1 execute paiecashfan-costreaming \
  --command="SELECT name FROM sqlite_master WHERE type='table';" || {
    echo "❌ Échec vérification tables"
    exit 1
}
echo ""

# Étape 5: Build
echo "🔨 Build de l'application..."
npm run build || {
    echo "❌ Échec du build"
    exit 1
}
echo "✅ Build réussi"
echo ""

# Étape 6: Déploiement
echo "🚀 Déploiement vers Cloudflare Pages..."
npx wrangler pages deploy dist --project-name webapp || {
    echo "❌ Échec du déploiement"
    exit 1
}
echo ""

echo "======================================"
echo "✅ DÉPLOIEMENT RÉUSSI !"
echo "======================================"
echo ""
echo "🌐 URLs disponibles :"
echo "   Production: https://webapp.pages.dev"
echo "   API: https://webapp.pages.dev/api"
echo ""
echo "🧪 Test rapide :"
echo "   curl https://webapp.pages.dev/api/vendor/streams/live"
echo ""
echo "📝 N'oubliez pas de configurer les secrets :"
echo "   npx wrangler pages secret put JWT_SECRET --project-name webapp"
echo "   npx wrangler pages secret put CLOUDFLARE_ACCOUNT_ID --project-name webapp"
echo "   npx wrangler pages secret put CLOUDFLARE_API_TOKEN --project-name webapp"
echo ""
