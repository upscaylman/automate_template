# Script de surveillance ngrok avec notification email en cas de déconnexion
param(
    [int]$CheckIntervalSeconds = 30
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Configuration email
$EmailWebhookUrl = "http://localhost:5678/webhook/1ee6e745-fc31-4fd8-bc59-531bd4a69997"
$EmailTo = "bouvier.jul@gmail.com;aguillermin@fo-metaux.fr"
$EmailSubject = "⚠️ Déconnexion Serveur Local DocEase"
$EmailBody = @"
Bonjour,

Le serveur local DocEase s'est déconnecté.

Pour redémarrer le serveur :
1. Ouvrez le dossier du projet
2. Double-cliquez sur start.bat
3. Entrez le mot de passe administrateur : joubert

Le serveur redémarrera automatiquement tous les services (n8n, PostgreSQL, Ollama, ngrok).

Cordialement,
Système de Monitoring DocEase
"@

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SURVEILLANCE NGROK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Intervalle de vérification : $CheckIntervalSeconds secondes" -ForegroundColor White
Write-Host "Email de notification : $EmailTo" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

$ngrokWasRunning = $false
$emailSent = $false

while ($true) {
    # Vérifier si ngrok est en cours d'exécution
    $ngrokProcess = Get-Process ngrok -ErrorAction SilentlyContinue
    
    if ($ngrokProcess) {
        if (-not $ngrokWasRunning) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ ngrok détecté (PID: $($ngrokProcess.Id))" -ForegroundColor Green
            $ngrokWasRunning = $true
            $emailSent = $false
        }
    }
    else {
        if ($ngrokWasRunning -and -not $emailSent) {
            Write-Host "" -ForegroundColor White
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⚠️  DÉCONNEXION NGROK DÉTECTÉE" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Red
            Write-Host ""
            Write-Host "Envoi de l'email de notification..." -ForegroundColor Yellow
            
            try {
                # Préparer les données pour n8n
                $emailData = @{
                    emailEnvoi = $EmailTo
                    nomDestinataire = "Équipe Technique"
                    customEmailMessage = $EmailBody
                    templateName = $EmailSubject
                } | ConvertTo-Json -Depth 10
                
                # Envoyer via le webhook n8n
                $response = Invoke-RestMethod -Uri $EmailWebhookUrl `
                    -Method POST `
                    -Body $emailData `
                    -ContentType "application/json" `
                    -TimeoutSec 30
                
                Write-Host "✅ Email envoyé avec succès à : $EmailTo" -ForegroundColor Green
                Write-Host "" -ForegroundColor White
                $emailSent = $true
                
            } catch {
                Write-Host "❌ Erreur lors de l'envoi de l'email : $_" -ForegroundColor Red
                Write-Host "   Vérifiez que n8n est démarré et que le webhook est configuré" -ForegroundColor Yellow
                Write-Host "" -ForegroundColor White
            }
            
            $ngrokWasRunning = $false
        }
    }
    
    # Attendre avant la prochaine vérification
    Start-Sleep -Seconds $CheckIntervalSeconds
}

