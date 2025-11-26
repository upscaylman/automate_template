# Script pour lancer ngrok en arrière-plan (fenêtre cachée)
param(
    [string]$Port = "8080"
)

# Trouver ngrok
$ngrokPath = (Get-Command ngrok -ErrorAction SilentlyContinue).Source

if (-not $ngrokPath) {
    # Chemin par défaut si ngrok n'est pas dans PATH
    $ngrokPath = "C:\Users\INVITE\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
}

if (-not (Test-Path $ngrokPath)) {
    Write-Host "ERREUR: ngrok introuvable" -ForegroundColor Red
    Write-Host "Chemin teste: $ngrokPath" -ForegroundColor Gray
    exit 1
}

Write-Host "Lancement de ngrok sur le port $Port..." -ForegroundColor Cyan
Write-Host "Chemin: $ngrokPath" -ForegroundColor Gray

# Vérifier si ngrok est déjà lancé
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "ngrok est deja en cours d'execution (PID: $($ngrokProcess.Id))" -ForegroundColor Yellow
    exit 0
}

# Lancer ngrok en arrière-plan avec fenêtre cachée
# IMPORTANT: Ne pas attendre la fin du processus (ngrok tourne en continu)
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $ngrokPath
$psi.Arguments = "http $Port"
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$psi.CreateNoWindow = $true
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $false
$psi.RedirectStandardError = $false

try {
    $process = [System.Diagnostics.Process]::Start($psi)
}
catch {
    Write-Host "ERREUR lors du lancement: $_" -ForegroundColor Red
    exit 1
}

if ($process) {
    Write-Host "ngrok lance avec succes (PID: $($process.Id))" -ForegroundColor Green
    
    # Attendre un peu que ngrok démarre
    Start-Sleep -Seconds 3
    
    # Vérifier que l'API ngrok répond
    $maxRetries = 10
    $retryCount = 0
    $apiReady = $false
    
    while ($retryCount -lt $maxRetries -and -not $apiReady) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
            if ($response.tunnels) {
                $url = $response.tunnels[0].public_url
                Write-Host "ngrok connecte: $url" -ForegroundColor Green
                $apiReady = $true
            }
        }
        catch {
            $retryCount++
            Write-Host "Attente API ngrok... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }
    
    if (-not $apiReady) {
        Write-Host "ATTENTION: ngrok lance mais API pas encore prete" -ForegroundColor Yellow
        Write-Host "Consultez http://localhost:4040" -ForegroundColor Gray
    }
    
    exit 0
}
else {
    Write-Host "ERREUR: Impossible de lancer ngrok" -ForegroundColor Red
    exit 1
}

