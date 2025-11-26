@echo off
REM Configuration simple avec schtasks
REM À exécuter EN TANT QU'ADMINISTRATEUR

echo ========================================
echo   CONFIGURATION DEMARRAGE ADMIN
echo ========================================
echo.

REM Vérifier si on est administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Ce script doit etre execute en tant qu'administrateur
    echo Clic droit sur le fichier ^> Executer en tant qu'administrateur
    echo.
    pause
    exit /b 1
)

set TASK_NAME=N8N-Automate-Start
set SCRIPT_PATH=%~dp0start.bat

echo Nom de la tache: %TASK_NAME%
echo Script a lancer: %SCRIPT_PATH%
echo.

REM Demander le mot de passe
set /p PASSWORD="Entrez votre mot de passe Windows (joubert): "

echo.
echo Suppression ancienne tache si elle existe...
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

echo Creation de la tache planifiee...
schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc ONLOGON /rl HIGHEST /ru "%COMPUTERNAME%\%USERNAME%" /rp "%PASSWORD%" /f

if %errorLevel% neq 0 (
    echo.
    echo ERREUR: Impossible de creer la tache
    echo Verifiez que le mot de passe est correct
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONFIGURATION TERMINEE !
echo ========================================
echo.
echo Tache planifiee creee: %TASK_NAME%
echo Utilisateur: %COMPUTERNAME%\%USERNAME%
echo.
echo Pour demarrer le systeme en administrateur SANS UAC:
echo   Double-cliquez sur: START-ADMIN.bat
echo.
echo La tache s'executera automatiquement sans demander le mot de passe !
echo.
pause

