@echo off
REM Configuration initiale pour le démarrage automatique en administrateur
REM À exécuter UNE SEULE FOIS en tant qu'administrateur (clic droit > Exécuter en tant qu'administrateur)

echo ========================================
echo   CONFIGURATION DEMARRAGE ADMIN
echo ========================================
echo.
echo Ce script va configurer une tache planifiee pour permettre
echo le demarrage automatique en administrateur SANS UAC.
echo.
echo IMPORTANT: Vous devez executer ce script EN TANT QU'ADMINISTRATEUR
echo            (clic droit ^> Executer en tant qu'administrateur)
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-auto-admin.ps1"

