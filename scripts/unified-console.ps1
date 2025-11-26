# Console unifiée pour tous les services
# Affiche les logs de ngrok, serveur PowerShell et monitoring dans une seule fenêtre

$Host.UI.RawUI.WindowTitle = "DOCEASE - Console Unifiée"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DOCEASE - CONSOLE UNIFIEE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptRoot = Split-Path -Parent $PSScriptRoot

# Charger la configuration
$configPath = Join-Path $scriptRoot "config\ngrok-monitor.json"
$config = $null
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    Write-Host "Configuration chargee depuis $configPath" -ForegroundColor Gray
}

# Fonction pour envoyer un email
function Send-EmailAlert {
    param(
        [string]$Subject,
        [string]$Body
    )

    if (-not $config -or -not $config.email.enabled) {
        return
    }

    try {
        $smtpServer = $config.email.smtp.server
        $smtpPort = $config.email.smtp.port
        $smtpUser = $config.email.smtp.user
        $smtpPassword = $config.email.smtp.password
        $to = $config.email.to

        # Convertir en tableau si c'est une seule adresse
        if ($to -is [string]) {
            $to = @($to)
        }

        $securePassword = ConvertTo-SecureString $smtpPassword -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($smtpUser, $securePassword)

        $mailParams = @{
            From = $smtpUser
            To = $to
            Subject = $Subject
            Body = $Body
            SmtpServer = $smtpServer
            Port = $smtpPort
            UseSsl = $true
            Credential = $credential
        }

        Send-MailMessage @mailParams
        $recipients = $to -join ", "
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))][EMAIL] Email envoye a $recipients" -ForegroundColor Green
    }
    catch {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))][EMAIL] Erreur: $_" -ForegroundColor Red
    }
}

# Fonction pour envoyer une notification Windows
function Send-WindowsNotification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$Icon = "Info"
    )

    if (-not $config -or -not $config.notifications.windows) {
        return
    }

    try {
        # Remplacer les accents pour eviter les problemes d'encodage
        $TitleClean = $Title -replace 'é','e' -replace 'è','e' -replace 'ê','e' -replace 'à','a' -replace 'ç','c'
        $MessageClean = $Message -replace 'é','e' -replace 'è','e' -replace 'ê','e' -replace 'à','a' -replace 'ç','c' -replace 'ù','u'

        Add-Type -AssemblyName System.Windows.Forms
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipIcon = $Icon
        $notification.BalloonTipTitle = $TitleClean
        $notification.BalloonTipText = $MessageClean
        $notification.Visible = $true
        $notification.ShowBalloonTip(10000)
        Start-Sleep -Seconds 2
        $notification.Dispose()
    }
    catch {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))][NOTIF] Erreur: $_" -ForegroundColor Red
    }
}

# Initialiser le system tray
Write-Host "Initialisation system tray..." -ForegroundColor Gray
$trayScript = Join-Path $PSScriptRoot "console-with-tray.ps1"
$global:trayIcon = & $trayScript
Write-Host "System tray active - Double-clic sur l'icone pour afficher/masquer" -ForegroundColor Green
Write-Host ""

# Fonction pour afficher un message avec timestamp et couleur
function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = "INFO"
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp][$Prefix] " -NoNewline -ForegroundColor Gray
    Write-Host $Message -ForegroundColor $Color
}

# 1. Démarrer ngrok en arrière-plan
Write-Log "Demarrage de ngrok..." "Yellow" "NGROK"

$ngrokPath = (Get-Command ngrok -ErrorAction SilentlyContinue).Source
if (-not $ngrokPath) {
    $ngrokPath = "C:\Users\INVITE\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
}

if (-not (Test-Path $ngrokPath)) {
    Write-Log "ERREUR: ngrok introuvable" "Red" "NGROK"
    Write-Log "Chemin teste: $ngrokPath" "Red" "NGROK"
    pause
    exit 1
}

# Vérifier si ngrok est déjà lancé
$ngrokRunning = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokRunning) {
    Write-Log "ngrok deja en cours d'execution (PID: $($ngrokRunning.Id))" "Yellow" "NGROK"
} else {
    # Configurer authtoken
    Write-Log "Configuration authtoken..." "Gray" "NGROK"
    & $ngrokPath config add-authtoken 35eOfeGUiOQC5LeKxFMeZloJPMd_6ZNbDX268UckKL1o46Uq4 2>&1 | Out-Null

    # Lancer ngrok en arrière-plan (sans fenêtre)
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $ngrokPath
    $psi.Arguments = "http 8080"
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $psi.CreateNoWindow = $true
    $psi.UseShellExecute = $false

    $ngrokProcess = [System.Diagnostics.Process]::Start($psi)
    Write-Log "ngrok lance (PID: $($ngrokProcess.Id))" "Green" "NGROK"
}

# Attendre que ngrok soit prêt
Write-Log "Attente demarrage ngrok..." "Gray" "NGROK"
Start-Sleep -Seconds 5

# 2. Nettoyer les réservations HTTP.sys avant de démarrer le serveur
Write-Log "Nettoyage des reservations HTTP.sys..." "Gray" "CLEANUP"
try {
    # Supprimer les réservations sur les ports 8080 et 8081
    netsh http delete urlacl url=http://+:8080/ 2>&1 | Out-Null
    netsh http delete urlacl url=http://+:8081/ 2>&1 | Out-Null
    netsh http delete urlacl url=http://*:8080/ 2>&1 | Out-Null
    netsh http delete urlacl url=http://*:8081/ 2>&1 | Out-Null
    Write-Log "Reservations HTTP.sys nettoyees" "Green" "CLEANUP"
}
catch {
    Write-Log "Impossible de nettoyer les reservations (normal si aucune n'existe)" "Gray" "CLEANUP"
}

# 3. Démarrer le serveur PowerShell en arrière-plan
Write-Log "Demarrage du serveur PowerShell..." "Yellow" "SERVEUR"

$serveFormPath = Join-Path $scriptRoot "templates\form\serve-form.ps1"
if (-not (Test-Path $serveFormPath)) {
    Write-Log "ERREUR: serve-form.ps1 introuvable" "Red" "SERVEUR"
} else {
    $serverJob = Start-Job -ScriptBlock {
        param($scriptPath)
        Set-Location (Split-Path $scriptPath)
        & $scriptPath
    } -ArgumentList $serveFormPath
    
    Write-Log "Serveur PowerShell lance (Job ID: $($serverJob.Id))" "Green" "SERVEUR"
}

Start-Sleep -Seconds 2

# 3. Afficher les informations de connexion
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVICES DEMARRES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Récupérer l'URL ngrok
$ngrokUrl = $null
$retry = 0
while ($retry -lt 5 -and -not $ngrokUrl) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 1 -ErrorAction Stop
        if ($response.tunnels) {
            $ngrokUrl = $response.tunnels[0].public_url
        }
    }
    catch {
        $retry++
        Start-Sleep -Seconds 1
    }
}

if ($ngrokUrl) {
    Write-Host ""
    Write-Host "URL ngrok: " -NoNewline -ForegroundColor Cyan
    Write-Host $ngrokUrl -ForegroundColor Green
}

Write-Host ""
Write-Host "Services disponibles:" -ForegroundColor White
Write-Host "  - n8n Interface:   http://localhost:5678" -ForegroundColor Gray
Write-Host "  - Formulaire:      http://localhost:8080" -ForegroundColor Gray
Write-Host "  - ngrok Interface: http://localhost:4040" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MONITORING EN TEMPS REEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 4. Boucle de monitoring unifiée
$wasOnline = $false
$checkCount = 0

while ($true) {
    $checkCount++
    
    # Vérifier ngrok
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
        
        if ($response.tunnels -and $response.tunnels.Count -gt 0) {
            $tunnel = $response.tunnels[0]
            $connections = $tunnel.metrics.conns.count
            
            if (-not $wasOnline) {
                Write-Log "ngrok CONNECTE: $($tunnel.public_url)" "Green" "NGROK"
                $wasOnline = $true

                # Envoyer notification Windows
                Send-WindowsNotification -Title "DOCEASE - ngrok Connecte" -Message "Tunnel actif: $($tunnel.public_url)" -Icon "Info"

                # Envoyer email
                if ($config -and $config.notifications.email) {
                    $emailBody = @"
Le tunnel ngrok est maintenant actif !

URL publique: $($tunnel.public_url)
Region: $($tunnel.region)
Protocole: $($tunnel.proto)
Heure: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Serveur: $env:COMPUTERNAME

Vous pouvez maintenant acceder au formulaire via cette URL.
"@
                    Send-EmailAlert -Subject "INFO: ngrok connecte sur $env:COMPUTERNAME" -Body $emailBody
                }
            } else {
                if ($checkCount % 10 -eq 0) {
                    Write-Log "ngrok OK - $connections connexions" "Gray" "NGROK"
                }
            }
        }
    }
    catch {
        if ($wasOnline) {
            Write-Log "ngrok DECONNECTE !" "Red" "NGROK"
            $wasOnline = $false

            # Envoyer notification Windows
            Send-WindowsNotification -Title "DOCEASE - ngrok Deconnecte" -Message "Le tunnel ngrok s'est arrete !" -Icon "Warning"

            # Envoyer email d'alerte
            if ($config -and $config.notifications.email) {
                $emailBody = @"
ALERTE: Le tunnel ngrok s'est arrete !

Heure de deconnexion: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Serveur: $env:COMPUTERNAME

Le formulaire DOCEASE n'est plus accessible publiquement.

ACTIONS A EFFECTUER:
1. Double-cliquez sur DEMARRER.bat pour relancer tous les services
2. Entrez le mot de passe "joubert"
3. Verifiez que Docker est lance (icone de bateau en bas a droite dans le systeme tray)
4. Verifiez que ngrok se reconnecte (vous recevrez un email de confirmation)

Si le probleme persiste, contactez l'administrateur systeme.
"@
                Send-EmailAlert -Subject "ALERTE: ngrok deconnecte sur $env:COMPUTERNAME" -Body $emailBody
            }
        }
    }
    
    # Afficher les logs du serveur PowerShell
    if ($serverJob) {
        $jobOutput = Receive-Job -Job $serverJob -ErrorAction SilentlyContinue
        if ($jobOutput) {
            foreach ($line in $jobOutput) {
                Write-Host "[$((Get-Date).ToString('HH:mm:ss'))][SERVEUR] " -NoNewline -ForegroundColor Gray
                Write-Host $line -ForegroundColor White
            }
        }
    }
    
    Start-Sleep -Seconds 5
}

