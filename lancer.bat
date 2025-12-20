@echo off
echo ========================================
echo  PAIECASHPLAY - LANCEMENT AUTOMATIQUE
echo ========================================
echo.
echo Demarrage du serveur...
echo.
echo Une fois lance, ouvrir Chrome et aller a:
echo http://localhost:8000/test.html
echo.
echo Pour arreter: Ctrl + C
echo.
echo ========================================
echo.
python -m http.server 8000
pause
