#!/bin/bash

# ======================================
# SCRIPT DE DÉMARRAGE MULTI-CLUBS
# PaieCashPlay - Ligue 1 France
# ======================================

echo "
╔═══════════════════════════════════════════════════════╗
║     🏟️  PaieCashPlay - Démarrage Multi-Clubs 🏟️      ║
╠═══════════════════════════════════════════════════════╣
║  Lancement de tous les serveurs backend Ligue 1      ║
╚═══════════════════════════════════════════════════════╝
"

# Vérifier Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js n'est pas installé"
    echo "📥 Installez Node.js : https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version : $(node --version)"
echo ""

# Fonction pour démarrer un serveur club
start_club() {
    local club_path=$1
    local club_name=$2
    local port=$3
    
    if [ -d "$club_path" ]; then
        echo "🚀 Démarrage $club_name (Port $port)..."
        
        cd "$club_path"
        
        # Installer dépendances si nécessaire
        if [ ! -d "node_modules" ]; then
            echo "📦 Installation dépendances pour $club_name..."
            npm install --silent
        fi
        
        # Démarrer le serveur en arrière-plan
        PORT=$port node server.js > "../logs/$club_name.log" 2>&1 &
        
        echo "✅ $club_name démarré sur http://localhost:$port"
        echo "   Logs : clubs/logs/$club_name.log"
        
        cd - > /dev/null
    else
        echo "⚠️  $club_name non trouvé dans $club_path"
    fi
    
    echo ""
}

# Créer dossier logs
mkdir -p clubs/logs

echo "╔═══════════════════════════════════════════════════════╗"
echo "║              Démarrage des serveurs clubs             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Démarrer tous les clubs
start_club "clubs/olympique-marseille" "Olympique de Marseille" 3000
start_club "clubs/paris-fc" "Paris FC" 3001

# Attendre que les serveurs démarrent
echo "⏳ Attente démarrage des serveurs..."
sleep 3
echo ""

# Vérifier les serveurs
echo "╔═══════════════════════════════════════════════════════╗"
echo "║            Vérification des serveurs actifs           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

check_server() {
    local port=$1
    local club_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ $club_name : http://localhost:$port"
    else
        echo "❌ $club_name : Erreur démarrage (port $port)"
    fi
}

check_server 3000 "Olympique de Marseille"
check_server 3001 "Paris FC"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                    Accès rapide                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Hub Ligue 1 : Ouvrir ligue1-hub.html dans votre navigateur"
echo "🔵 OM         : http://localhost:3000"
echo "🔵 Paris FC   : http://localhost:3001"
echo ""
echo "📊 Logs       : clubs/logs/"
echo "⛔ Arrêter    : ./stop-all-clubs.sh"
echo ""
echo "🎉 Tous les serveurs sont démarrés !"
echo ""
