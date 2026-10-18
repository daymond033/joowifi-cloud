@echo off
chcp 65001 >nul
cd /d "%~dp0"

set REPO_URL=https://github.com/salvatoredymond/joowifi-cloud.git

echo ========================================================
echo   JOOWIFI CLOUD - Publication automatique vers GitHub
echo   Dossier : %CD%
echo   Depot   : %REPO_URL%
echo ========================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Git n'est pas installe sur ce PC.
    echo Telechargez Git pour Windows sur : https://git-scm.com/download/win
    echo Ou glissez directement vos fichiers sur : https://github.com/salvatoredymond/joowifi-cloud/upload/main
    pause
    exit /b 1
)

if not exist ".git" (
    git init
)

git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%

git add -A
git commit -m "feat(joowifi): complete Phases 1-4 SaaS & PWA (Frontend, Backend API Heartbeat 45s, RouterOS .rsc, Mobile Money & RAG AI)" 2>nul

echo Envoi du code vers GitHub (une fenetre de connexion GitHub peut s'ouvrir)...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCES] Tout le code Joowifi Cloud est en ligne sur :
    echo https://github.com/salvatoredymond/joowifi-cloud
) else (
    echo.
    echo [INFO] Si le depot n'existe pas encore sur votre compte GitHub,
    echo creez-le d'abord sur https://github.com/new avec le nom : joowifi-cloud
    echo puis relancez ce fichier push-to-github.bat !
)
echo.
pause
