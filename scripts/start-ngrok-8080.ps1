# Script pour démarrer ngrok http 8080
# Usage: .\scripts\start-ngrok-8080.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DÉMARRAGE NGROK HTTP 8080" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Chercher ngrok - d'abord dans les chemins communs, puis dans le PATH
$NgrokPath = $null
$programFilesX86Path = [Environment]::GetFolderPath('ProgramFilesX86')
$commonPaths = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe",
    "$env:LOCALAPPDATA\Microsoft\WindowsApps\ngrok.exe",
    "$env:ProgramFiles\ngrok\ngrok.exe",
    "$programFilesX86Path\ngrok\ngrok.exe",
    "C:\ngrok\ngrok.exe"
)

$ngrokFound = $false
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $NgrokPath = $path
        $ngrokFound = $true
        Write-Host "ngrok trouvé: $path" -ForegroundColor Green
        break
    }
}

# Si pas trouvé dans les chemins communs, essayer le PATH
if (-not $ngrokFound) {
    $ngrokCheck = Get-Command "ngrok" -ErrorAction SilentlyContinue
    if ($ngrokCheck) {
        $NgrokPath = $ngrokCheck.Source
        $ngrokFound = $true
        Write-Host "ngrok trouvé dans le PATH: $NgrokPath" -ForegroundColor Green
    }
}

if (-not $ngrokFound) {
    Write-Host "ngrok n'est pas installé ou non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "Installez ngrok depuis: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Démarrer ngrok http 8080
Write-Host "Démarrage de ngrok http 8080..." -ForegroundColor Cyan
$ngrokProcess = Start-Process -FilePath $NgrokPath -ArgumentList @("http", "8080") -PassThru -WindowStyle Normal

if ($ngrokProcess) {
    Write-Host "✅ ngrok http 8080 démarré (PID: $($ngrokProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Impossible de démarrer ngrok" -ForegroundColor Red
    exit 1
}

Write-Host ""

