@echo off

REM Vérifier si on est déjà administrateur
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo Elevation en administrateur...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:admin
echo ========================================
echo DEMARRAGE - MODE DEVELOPPEMENT
echo ========================================
echo.

REM Vérifier que Docker est disponible
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé ou non accessible
    echo    Veuillez installer Docker Desktop et réessayer
    pause
    exit /b 1
)

REM Aller dans le dossier docker
cd /d "%~dp0docker"
if not exist "docker-compose.yml" (
    echo ❌ Fichier docker-compose.yml introuvable dans le dossier docker
    pause
    exit /b 1
)

REM Démarrer Docker (mode développement par défaut)
echo 📦 Démarrage des services Docker...
echo    - PostgreSQL (base de données)
echo    - n8n (orchestrateur de workflows)
echo    - Ollama (IA locale)
echo.
docker compose up -d
if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du démarrage de Docker
    echo    Vérifiez que Docker Desktop est démarré
    pause
    exit /b 1
)

REM Attendre que PostgreSQL soit prêt
echo.
echo ⏳ Attente du démarrage de PostgreSQL et n8n...
timeout /t 10 /nobreak >nul

REM Vérifier que les conteneurs sont bien démarrés
docker compose ps | findstr /C:"Up" >nul
if errorlevel 1 (
    echo ⚠️  Certains conteneurs ne semblent pas démarrés correctement
    echo    Vérifiez avec: docker compose ps
)

REM Retour au répertoire racine
cd /d "%~dp0"

REM Démarrer le serveur de formulaire en arrière-plan
echo.
echo 🌐 Démarrage du serveur de formulaire...
if exist "templates\form\serve-form.ps1" (
    start "Serveur Formulaire" powershell -ExecutionPolicy Bypass -NoExit -Command "cd '%~dp0templates\form'; .\serve-form.ps1"
    timeout /t 3 /nobreak >nul
    echo    ✅ Serveur de formulaire démarré
) else (
    echo ⚠️  Script serve-form.ps1 introuvable, serveur formulaire non démarré
)

REM Démarrer ngrok avec monitoring
echo.
echo 🌐 Démarrage du tunnel ngrok avec monitoring...
start /B powershell -WindowStyle Hidden -Command "ngrok http 8080"
timeout /t 5 /nobreak >nul
start /MIN "Monitoring ngrok" powershell -ExecutionPolicy Bypass -File "%~dp0scripts\monitor-ngrok.ps1"
echo    ✅ ngrok et monitoring démarrés

REM Attendre un peu pour récupérer l'URL ngrok
timeout /t 3 /nobreak >nul

REM Essayer de récupérer l'URL ngrok
echo.
echo 🔍 Récupération de l'URL ngrok...
powershell -Command "$response = Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels' -ErrorAction SilentlyContinue; if ($response.tunnels) { $url = $response.tunnels[0].public_url; Write-Host '   URL ngrok: ' -NoNewline; Write-Host $url -ForegroundColor Green } else { Write-Host '   Consultez http://localhost:4040 pour voir l URL' -ForegroundColor Yellow }"

echo.
echo ========================================
echo ✅ TOUT EST DÉMARRÉ !
echo ========================================
echo.
echo 📋 Accès aux services:
echo    - n8n Interface:  http://localhost:5678
echo    - Formulaire:     http://localhost:8080
echo    - PostgreSQL:     localhost:5432
echo    - Ollama:         http://localhost:11434
echo    - ngrok Interface: http://localhost:4040
echo.
echo 🔔 Monitoring ngrok actif (fenêtre minimisée)
echo    - Notifications Windows activées
echo    - Pour configurer les emails: config\ngrok-monitor.json
echo.
echo 💡 Commandes utiles:
echo    - Arrêter:        stop.bat
echo    - Voir les logs:  cd docker ^&^& docker compose logs -f
echo    - Redémarrer:     stop.bat puis start.bat
echo    - Arrêter ngrok:  stop-ngrok.bat
echo.
echo 📝 Mode: DÉVELOPPEMENT (docker-compose.yml)
echo    Pour la production: cd docker ^&^& docker compose -f docker-compose.prod.yml up -d
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
