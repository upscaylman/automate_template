@echo off
REM ========================================
REM DEMARRAGE COMPLET DOCEASE
REM Un seul fichier demarrer tous les services !
REM ========================================

REM Vérifier si on est déjà administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Elevation en administrateur...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo   DEMARRAGE COMPLET DOCEASE
echo ========================================
echo.

REM 1. Vérifier Docker
echo [1/5] Verification Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas installe
    pause
    exit /b 1
)
echo OK - Docker disponible
echo.

REM 2. Arrêter Ollama natif s'il tourne (conflit de port avec Docker Ollama)
echo [2/5] Verification Ollama natif...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Ollama natif detecte, arret pour eviter conflit de port...
    taskkill /F /IM ollama.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo OK - Ollama natif arrete
) else (
    echo OK - Ollama natif non actif
)
echo.

REM 3. Démarrer Docker (PostgreSQL, n8n, Ollama)
echo [3/5] Demarrage Docker (PostgreSQL, n8n, Ollama)...
cd /d "%~dp0docker"
docker compose up -d
if errorlevel 1 (
    echo ERREUR: Impossible de demarrer Docker
    pause
    exit /b 1
)
echo OK - Docker demarre
timeout /t 10 /nobreak >nul
cd /d "%~dp0"
echo.

REM 4. Démarrer la console unifiée (ngrok + serveur + monitoring)
echo [4/5] Demarrage console unifiee (ngrok + serveur + monitoring)...
if exist "scripts\unified-console.ps1" (
    start "DOCEASE - Console" powershell -ExecutionPolicy Bypass -NoExit -File "%~dp0scripts\unified-console.ps1"
    timeout /t 8 /nobreak >nul
    echo OK - Console unifiee demarree
) else (
    echo ERREUR: unified-console.ps1 introuvable
    pause
    exit /b 1
)
echo.

REM Récupération URL ngrok (rapide)
echo.
echo Recuperation URL ngrok...
powershell -Command "$retry = 0; $url = $null; while ($retry -lt 3 -and -not $url) { try { $response = Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels' -TimeoutSec 1 -ErrorAction Stop; if ($response.tunnels) { $url = $response.tunnels[0].public_url } } catch { $retry++; Start-Sleep -Milliseconds 500 } }; if ($url) { Write-Host ''; Write-Host 'URL ngrok: ' -NoNewline -ForegroundColor Cyan; Write-Host $url -ForegroundColor Green; Write-Host '' } else { Write-Host ''; Write-Host 'Consultez la fenetre ngrok ou http://localhost:4040' -ForegroundColor Yellow; Write-Host '' }"

REM Notification Windows de démarrage
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notification = New-Object System.Windows.Forms.NotifyIcon; $notification.Icon = [System.Drawing.SystemIcons]::Information; $notification.BalloonTipIcon = 'Info'; $notification.BalloonTipTitle = 'N8N-AUTOMATE'; $notification.BalloonTipText = 'Tous les services sont demarres !'; $notification.Visible = $true; $notification.ShowBalloonTip(5000); Start-Sleep -Seconds 6; $notification.Dispose()"

echo ========================================
echo   TOUT LES SERVICES SONT DEMARRE !
echo ========================================
echo.
echo Services actifs:
echo   - n8n Interface:   http://localhost:5678
echo   - Formulaire:      http://localhost:8080
echo   - PostgreSQL:      localhost:5432
echo   - Ollama:          http://localhost:11434
echo   - ngrok Interface: http://localhost:4040
echo.
echo ========================================
echo   DEMARRAGE TERMINE !
echo ========================================
echo.
echo Une fenetre "DOCEASE - Console" affiche tous les logs
echo L'icone DOCEASE est dans le system tray (zone de notification)
echo.
echo Actions disponibles:
echo   - Double-clic sur l'icone: Afficher/masquer la console
echo   - Clic droit sur l'icone: Menu des options
echo   - Pour arreter: ARRETER.bat ou menu system tray
echo.
echo Cette fenetre va se fermer dans 5 secondes...
timeout /t 5 /nobreak >nul
exit

