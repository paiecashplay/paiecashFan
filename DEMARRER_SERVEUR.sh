#!/bin/bash

echo "========================================"
echo "  PAIECASHPLAY FAN APP - SERVEUR LOCAL"
echo "========================================"
echo ""
echo "Démarrage du serveur HTTP local..."
echo ""
echo "Une fois démarré, ouvrez votre navigateur sur :"
echo ""
echo "   http://localhost:8000"
echo ""
echo "========================================"
echo ""

# Vérifier si Python 3 est installé
if ! command -v python3 &> /dev/null
then
    echo "ERREUR : Python 3 n'est pas installé !"
    echo ""
    echo "Veuillez installer Python depuis : https://www.python.org/downloads/"
    echo ""
    exit 1
fi

# Démarrer le serveur
echo "Le serveur démarre sur le port 8000..."
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""
python3 -m http.server 8000
