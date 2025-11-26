@echo off
REM ========================================
REM ARRET COMPLET DOCEASE
REM Un seul fichier pour tout arreter !
REM ========================================

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Ce script necessite les droits administrateur.
    echo Relancement avec elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo   ARRET COMPLET DOCEASE
echo ========================================
echo.

REM 1. Arrêter Ollama natif (si il tourne)
echo [1/7] Arret de Ollama natif...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM ollama.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo OK - Ollama natif arrete
) else (
    echo Ollama natif n'etait pas demarre
)
echo.

REM 2. Arrêter ngrok (tous les processus)
echo [2/7] Arret de ngrok...
tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM ngrok.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo OK - ngrok arrete
) else (
    echo ngrok n'etait pas demarre
)
echo.

REM 3. Arrêter la console unifiée (contient ngrok, serveur, monitoring)
echo [3/7] Arret de la console unifiee...
powershell -ExecutionPolicy Bypass -Command "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { (Get-WmiObject Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine -match 'unified-console' } | ForEach-Object { Stop-Process -Id $_.Id -Force }" >nul 2>&1
echo OK - console unifiee arretee
echo.

REM 4. Arrêter TOUS les serveurs PowerShell (serve-form) et libérer les ports 8080/8081
echo [4/7] Arret de tous les serveurs PowerShell...
powershell -ExecutionPolicy Bypass -Command "$processes = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $cmd = (Get-WmiObject Win32_Process -Filter \"ProcessId = $($_.Id)\" -ErrorAction SilentlyContinue).CommandLine; $cmd -match 'serve-form' }; if ($processes) { Write-Host \"Arret de $($processes.Count) serveur(s) PowerShell...\"; $processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } } else { Write-Host \"Aucun serveur PowerShell actif\" }"
timeout /t 1 /nobreak >nul

REM Vérifier et libérer les ports 8080 et 8081
echo Verification des ports 8080 et 8081...
powershell -ExecutionPolicy Bypass -Command "$ports = @(8080, 8081); foreach ($port in $ports) { $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($connections) { foreach ($conn in $connections) { $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue; if ($proc) { Write-Host \"Port $port utilise par $($proc.Name) (PID: $($proc.Id)) - Arret...\"; Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } } } }"
echo OK - serveurs PowerShell arretes et ports liberes
echo.

REM 5. Arrêter le monitoring ngrok (au cas où)
echo [5/7] Arret du monitoring ngrok...
powershell -ExecutionPolicy Bypass -Command "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { (Get-WmiObject Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine -match 'monitor-ngrok' } | ForEach-Object { Stop-Process -Id $_.Id -Force }" >nul 2>&1
echo OK - monitoring arrete
echo.

REM 6. Arrêter le gestionnaire system tray (au cas où)
echo [6/7] Arret du gestionnaire system tray...
powershell -ExecutionPolicy Bypass -Command "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { (Get-WmiObject Win32_Process -Filter \"ProcessId = $($_.Id)\").CommandLine -match 'tray-manager|console-with-tray' } | ForEach-Object { Stop-Process -Id $_.Id -Force }" >nul 2>&1
echo OK - system tray arrete
echo.

REM 7. Arrêter Docker (PostgreSQL, n8n, Ollama)
echo [7/7] Arret Docker (PostgreSQL, n8n, Ollama)...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ATTENTION: Docker non accessible
) else (
    cd /d "%~dp0docker"
    docker compose down >nul 2>&1
    if errorlevel 1 (
        echo ATTENTION: Erreur lors de l'arret Docker
    ) else (
        echo OK - Docker arrete
    )
    cd /d "%~dp0"
)
echo.

REM Vérification finale - S'assurer que tout est bien arrêté
echo.
echo Verification finale...
timeout /t 2 /nobreak >nul

REM Vérifier ngrok
tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ATTENTION: ngrok encore actif, arret force...
    taskkill /F /IM ngrok.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    REM Vérifier à nouveau
    tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo ATTENTION: ngrok refuse de s'arreter, tentative avec PID...
        for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq ngrok.exe" /NH') do taskkill /F /PID %%a >nul 2>&1
        timeout /t 1 /nobreak >nul
    )
)

REM Vérifier PowerShell (serve-form, unified-console, etc.)
powershell -ExecutionPolicy Bypass -Command "$ps = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $cmd = (Get-WmiObject Win32_Process -Filter \"ProcessId = $($_.Id)\" -ErrorAction SilentlyContinue).CommandLine; $cmd -match 'serve-form|unified-console|monitor-ngrok|tray-manager|console-with-tray' }; if ($ps) { Write-Host 'ATTENTION: Processus PowerShell encore actifs, arret force...' -ForegroundColor Yellow; $ps | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } }"
timeout /t 1 /nobreak >nul

REM Vérifier et libérer les ports 8080/8081 une dernière fois
echo Verification finale des ports 8080/8081...
powershell -ExecutionPolicy Bypass -Command "$ports = @(8080, 8081); $portsUsed = $false; foreach ($port in $ports) { $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($connections) { $portsUsed = $true; foreach ($conn in $connections) { $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue; if ($proc -and $proc.Id -ne 4) { Write-Host \"ATTENTION: Port $port encore utilise par $($proc.Name) (PID: $($proc.Id)) - Arret force...\" -ForegroundColor Yellow; Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } elseif ($proc.Id -eq 4) { Write-Host \"Port $port utilise par System (HTTP.sys) - Suppression reservation...\" -ForegroundColor Yellow } } } }; if (-not $portsUsed) { Write-Host 'Ports 8080/8081 liberes' -ForegroundColor Green }"

REM Supprimer les réservations HTTP.sys sur les ports 8080/8081
echo Suppression des reservations HTTP.sys...
netsh http delete urlacl url=http://+:8080/ >nul 2>&1
netsh http delete urlacl url=http://+:8081/ >nul 2>&1
netsh http delete urlacl url=http://*:8080/ >nul 2>&1
netsh http delete urlacl url=http://*:8081/ >nul 2>&1
echo OK - Reservations HTTP.sys supprimees

REM Arrêter le service HTTP pour libérer les ports (il redémarrera automatiquement si nécessaire)
echo Arret du service HTTP (HTTP.sys) pour liberer les ports...
net stop http /y >nul 2>&1
if %errorlevel% equ 0 (
    echo OK - Service HTTP arrete, ports 8080/8081 liberes
) else (
    echo ATTENTION - Le service HTTP n'a pas pu etre arrete
)
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   TOUT EST ARRETE !
echo ========================================
echo.
echo Verification finale:
powershell -Command "$ngrok = Get-Process ngrok -ErrorAction SilentlyContinue; if ($ngrok) { Write-Host '  X ngrok encore actif (PID: ' -NoNewline -ForegroundColor Red; Write-Host $ngrok.Id -NoNewline; Write-Host ')' -ForegroundColor Red } else { Write-Host '  OK ngrok arrete' -ForegroundColor Green }"
powershell -Command "$docker = docker ps -q 2>$null; if ($docker) { Write-Host '  X Docker encore actif' -ForegroundColor Yellow } else { Write-Host '  OK Docker arrete' -ForegroundColor Green }"
powershell -Command "$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue; if ($port8080) { $proc = Get-Process -Id $port8080[0].OwningProcess -ErrorAction SilentlyContinue; Write-Host \"  X Port 8080 encore utilise par $($proc.Name)\" -ForegroundColor Red } else { Write-Host '  OK Port 8080 libre' -ForegroundColor Green }"
powershell -Command "$port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue; if ($port8081) { $proc = Get-Process -Id $port8081[0].OwningProcess -ErrorAction SilentlyContinue; Write-Host \"  X Port 8081 encore utilise par $($proc.Name)\" -ForegroundColor Red } else { Write-Host '  OK Port 8081 libre' -ForegroundColor Green }"
echo.
echo Pour redemarrer: DEMARRER.bat
echo.

REM Notification Windows d'arrêt
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $notification = New-Object System.Windows.Forms.NotifyIcon; $notification.Icon = [System.Drawing.SystemIcons]::Information; $notification.BalloonTipIcon = 'Info'; $notification.BalloonTipTitle = 'DOCEASE'; $notification.BalloonTipText = 'Tous les services sont arretes !'; $notification.Visible = $true; $notification.ShowBalloonTip(5000); Start-Sleep -Seconds 6; $notification.Dispose()"

echo Cette fenetre va se fermer dans 5 secondes...
timeout /t 5 /nobreak >nul
exit

