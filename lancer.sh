#!/bin/bash

echo "========================================"
echo "  PAIECASHPLAY - LANCEMENT AUTOMATIQUE"
echo "========================================"
echo ""
echo "Démarrage du serveur..."
echo ""
echo "Une fois lancé, ouvrir Chrome et aller à:"
echo "http://localhost:8000/test.html"
echo ""
echo "Pour arrêter: Ctrl + C"
echo ""
echo "========================================"
echo ""

python3 -m http.server 8000
