@echo off
REM ========================================
REM SCRIPT AUTOMATIQUE POUR GITHUB (WINDOWS)
REM PaieCashFan V11.3.1
REM ========================================

title PaieCashFan - Push vers GitHub

echo.
echo ========================================
echo    PaieCashFan - Push vers GitHub
echo ========================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Git n'est pas installé !
    echo.
    echo Installer Git depuis : https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

echo [OK] Git est installé
echo.

REM Vérifier si c'est déjà un repository Git
if not exist ".git" (
    echo [INFO] Ce n'est pas encore un repository Git
    echo Initialisation...
    git init
    echo [OK] Repository Git initialisé
    echo.
)

REM Demander l'URL du repository GitHub
echo.
echo ========================================
echo Entrez l'URL de votre repository GitHub
echo Exemple: https://github.com/votreusername/paiecashfan.git
echo ========================================
set /p repo_url="URL : "

if "%repo_url%"=="" (
    echo [ERREUR] URL vide ! Abandon.
    pause
    exit /b 1
)

REM Vérifier si remote existe déjà
git remote | find "origin" >nul
if %errorlevel%==0 (
    echo [INFO] Remote 'origin' existe déjà
    echo Mise à jour de l'URL...
    git remote set-url origin "%repo_url%"
) else (
    echo Ajout du remote...
    git remote add origin "%repo_url%"
)

echo [OK] Remote configuré
echo.

REM Demander un message de commit
echo.
echo ========================================
echo Entrez un message de commit
echo (Appuyez sur Entrée pour utiliser le message par défaut)
echo ========================================
set /p commit_message="Message : "

if "%commit_message%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
    set commit_message=Update - %mydate% %mytime%
)

REM Ajouter tous les fichiers
echo.
echo [INFO] Ajout des fichiers...
git add .
echo [OK] Fichiers ajoutés
echo.

REM Commit
echo [INFO] Création du commit...
git commit -m "%commit_message%"

if errorlevel 1 (
    echo [INFO] Rien à commiter ou commit échoué
) else (
    echo [OK] Commit créé
)
echo.

REM Créer/Renommer la branche en main
git branch -M main

REM Push vers GitHub
echo.
echo ========================================
echo Push vers GitHub...
echo ========================================
echo.
echo [INFO] Vous devrez peut-être entrer votre token GitHub
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo [ERREUR] Échec du push vers GitHub
    echo ========================================
    echo.
    echo Vérifiez :
    echo 1. L'URL du repository est correcte
    echo 2. Vous avez les droits d'accès
    echo 3. Votre token GitHub est valide
    echo.
    echo Pour créer un token :
    echo https://github.com/settings/tokens
    echo.
) else (
    echo.
    echo ========================================
    echo [SUCCÈS] Code poussé vers GitHub !
    echo ========================================
    echo.
    echo Votre repository : %repo_url%
    echo.
)

echo.
pause
