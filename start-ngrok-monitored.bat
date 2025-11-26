@echo off
echo ========================================
echo   DEMARRAGE NGROK AVEC MONITORING
echo ========================================
echo.

REM Lancer ngrok en arriere-plan (fenetre cachee)
echo Demarrage de ngrok en arriere-plan...
start /B powershell -WindowStyle Hidden -Command "ngrok http 8080"

REM Attendre que ngrok soit pret
timeout /t 5 /nobreak >nul

REM Lancer le monitoring dans une fenetre minimisee
echo Demarrage du monitoring...
start /MIN powershell -ExecutionPolicy Bypass -File "%~dp0scripts\monitor-ngrok.ps1" -Port 8080

echo.
echo ========================================
echo   NGROK DEMARRE AVEC MONITORING
echo ========================================
echo.
echo - ngrok tourne en arriere-plan
echo - Monitoring actif (fenetre minimisee)
echo - Notifications Windows activees
echo.
echo Pour configurer les alertes email, editez:
echo   scripts\monitor-ngrok.ps1
echo.
echo Pour arreter: .\stop-ngrok.bat
echo.
pause

