#!/bin/bash

# ======================================
# SCRIPT D'ARRÊT MULTI-CLUBS
# PaieCashPlay - Ligue 1 France
# ======================================

echo "
╔═══════════════════════════════════════════════════════╗
║      🛑 PaieCashPlay - Arrêt Multi-Clubs 🛑          ║
╠═══════════════════════════════════════════════════════╣
║  Arrêt de tous les serveurs backend Ligue 1          ║
╚═══════════════════════════════════════════════════════╝
"

# Fonction pour arrêter un serveur sur un port
stop_server() {
    local port=$1
    local club_name=$2
    
    echo "🛑 Arrêt $club_name (Port $port)..."
    
    # Trouver et tuer le processus
    pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        kill -9 $pid
        echo "✅ $club_name arrêté (PID: $pid)"
    else
        echo "⚠️  $club_name n'était pas actif sur le port $port"
    fi
    
    echo ""
}

# Arrêter tous les serveurs
stop_server 3000 "Olympique de Marseille"
stop_server 3001 "Paris FC"

# Nettoyer les logs (optionnel)
read -p "🗑️  Supprimer les logs ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    rm -rf clubs/logs
    echo "✅ Logs supprimés"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║        Tous les serveurs ont été arrêtés              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🔄 Pour redémarrer : ./start-all-clubs.sh"
echo ""
