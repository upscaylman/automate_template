@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🌐 DÉMARRAGE NGROK HTTP 8080
echo ========================================
echo.

REM Chercher ngrok dans plusieurs emplacements possibles
set "NGROK_PATH="

REM Essayer d'abord avec le PATH système
where ngrok >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where ngrok') do set "NGROK_PATH=%%i"
    goto :found
)

REM Chercher dans les emplacements communs pour l'utilisateur INVITE
if exist "C:\Users\INVITE\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" (
    set "NGROK_PATH=C:\Users\INVITE\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
    goto :found
)

REM Chercher dans LOCALAPPDATA (utilisateur actuel)
if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe" (
    set "NGROK_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
    goto :found
)

REM Chercher dans WindowsApps
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\ngrok.exe" (
    set "NGROK_PATH=%LOCALAPPDATA%\Microsoft\WindowsApps\ngrok.exe"
    goto :found
)

REM Chercher dans Program Files
if exist "%ProgramFiles%\ngrok\ngrok.exe" (
    set "NGROK_PATH=%ProgramFiles%\ngrok\ngrok.exe"
    goto :found
)

REM Chercher dans C:\ngrok
if exist "C:\ngrok\ngrok.exe" (
    set "NGROK_PATH=C:\ngrok\ngrok.exe"
    goto :found
)

REM ngrok non trouvé
echo ⚠️  ngrok n'est pas installé ou non trouvé dans le PATH
echo    Chemin recherché: %LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe
echo.
echo Installez ngrok avec: install-ngrok.bat
pause
exit /b 1

:found
echo ✅ ngrok trouvé: %NGROK_PATH%
echo.
echo Démarrage de ngrok dans le system tray...
echo.

REM Démarrer le script PowerShell en arrière-plan (sans fenêtre)
powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0start-ngrok-8080-tray.ps1" -NgrokPath "%NGROK_PATH%"

exit /b 0

