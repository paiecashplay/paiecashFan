@echo off
echo ========================================
echo   PAIECASHPLAY FAN APP - SERVEUR LOCAL
echo ========================================
echo.
echo Demarrage du serveur HTTP local...
echo.
echo Une fois demarre, ouvrez votre navigateur sur :
echo.
echo    http://localhost:8000
echo.
echo ========================================
echo.

REM Vérifier si Python 3 est installé
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Python n'est pas installe !
    echo.
    echo Veuillez installer Python depuis : https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Démarrer le serveur
echo Le serveur demarre sur le port 8000...
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8000

pause
