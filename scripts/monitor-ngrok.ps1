# Script de monitoring ngrok avec notifications
# Usage: .\scripts\monitor-ngrok.ps1

param(
    [string]$ConfigPath = ""
)

$ErrorActionPreference = "Continue"

# Déterminer le chemin du fichier de config
if ([string]::IsNullOrEmpty($ConfigPath)) {
    $scriptRoot = Split-Path -Parent $PSScriptRoot
    $ConfigPath = Join-Path $scriptRoot "config\ngrok-monitor.json"
}

# Charger la configuration
$config = @{
    email = @{
        enabled = $false
        to = ""
        smtp = @{
            server = "smtp.office365.com"
            port = 587
            user = ""
            password = ""
        }
    }
    monitoring = @{
        checkIntervalSeconds = 30
        port = 8080
    }
    notifications = @{
        windows = $true
        email = $false
    }
}

if (Test-Path $ConfigPath) {
    try {
        $configJson = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $config.email.enabled = $configJson.email.enabled
        $config.email.to = $configJson.email.to
        $config.email.smtp.server = $configJson.email.smtp.server
        $config.email.smtp.port = $configJson.email.smtp.port
        $config.email.smtp.user = $configJson.email.smtp.user
        $config.email.smtp.password = $configJson.email.smtp.password
        $config.monitoring.checkIntervalSeconds = $configJson.monitoring.checkIntervalSeconds
        $config.monitoring.port = $configJson.monitoring.port
        $config.notifications.windows = $configJson.notifications.windows
        $config.notifications.email = $configJson.notifications.email

        Write-Host "Configuration chargee depuis $ConfigPath" -ForegroundColor Green
    }
    catch {
        Write-Host "Erreur chargement config, utilisation valeurs par defaut" -ForegroundColor Yellow
    }
}

$Port = $config.monitoring.port
$CheckIntervalSeconds = $config.monitoring.checkIntervalSeconds
$EmailTo = $config.email.to
$SmtpServer = $config.email.smtp.server
$SmtpPort = $config.email.smtp.port
$SmtpUser = $config.email.smtp.user
$SmtpPassword = $config.email.smtp.password

# Fonction pour envoyer une notification Windows
function Send-WindowsNotification {
    param([string]$Title, [string]$Message)

    if (-not $config.notifications.windows) {
        return
    }

    try {
        # Méthode 1 : Toast notification (Windows 10/11)
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

        $appId = 'n8n-automate'

        $toastXml = @"
<toast>
    <visual>
        <binding template="ToastGeneric">
            <text>$Title</text>
            <text>$Message</text>
        </binding>
    </visual>
    <audio src="ms-winsoundevent:Notification.Default" />
</toast>
"@

        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($toastXml)

        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)

        Write-Host "[NOTIFICATION] $Title - $Message" -ForegroundColor Cyan
    }
    catch {
        # Fallback : Balloon tip classique
        try {
            Add-Type -AssemblyName System.Windows.Forms
            Add-Type -AssemblyName System.Drawing

            $notification = New-Object System.Windows.Forms.NotifyIcon
            $notification.Icon = [System.Drawing.SystemIcons]::Information
            $notification.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
            $notification.BalloonTipText = $Message
            $notification.BalloonTipTitle = $Title
            $notification.Visible = $True
            $notification.ShowBalloonTip(10000)

            Start-Sleep -Seconds 2
            $notification.Dispose()

            Write-Host "[NOTIFICATION] $Title - $Message" -ForegroundColor Cyan
        }
        catch {
            Write-Host "[NOTIFICATION ERREUR] $Title - $Message" -ForegroundColor Yellow
            Write-Host "Erreur: $_" -ForegroundColor Red
        }
    }
}

# Fonction pour envoyer un email
function Send-EmailAlert {
    param([string]$Subject, [string]$Body)

    if (-not $config.notifications.email -or -not $config.email.enabled) {
        return
    }

    if (-not $EmailTo -or -not $SmtpUser -or -not $SmtpPassword) {
        Write-Host "Configuration email manquante - email non envoye" -ForegroundColor Yellow
        return
    }
    
    try {
        $securePassword = ConvertTo-SecureString $SmtpPassword -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($SmtpUser, $securePassword)
        
        Send-MailMessage `
            -To $EmailTo `
            -From $SmtpUser `
            -Subject $Subject `
            -Body $Body `
            -SmtpServer $SmtpServer `
            -Port $SmtpPort `
            -UseSsl `
            -Credential $credential
            
        Write-Host "Email envoye a $EmailTo" -ForegroundColor Green
    }
    catch {
        Write-Host "Erreur envoi email: $_" -ForegroundColor Red
    }
}

# Fonction pour vérifier si ngrok est en ligne
function Test-NgrokStatus {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.tunnels -and $response.tunnels.Count -gt 0) {
            $tunnel = $response.tunnels[0]
            return @{
                Online = $true
                Url = $tunnel.public_url
                Connections = $tunnel.metrics.conns.count
            }
        }
        
        return @{ Online = $false }
    }
    catch {
        return @{ Online = $false }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MONITORING NGROK DEMARRE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Heure demarrage: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "Port surveille: $Port" -ForegroundColor Gray
Write-Host "Intervalle verification: $CheckIntervalSeconds secondes" -ForegroundColor Gray
Write-Host "Fichier config: $ConfigPath" -ForegroundColor Gray
Write-Host "Notifications Windows: $($config.notifications.windows)" -ForegroundColor Gray
if ($EmailTo) {
    Write-Host "Alertes email: $EmailTo" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Attente de ngrok..." -ForegroundColor Yellow
Write-Host ""

$wasOnline = $false
$currentUrl = ""
$disconnectCount = 0
$checkCount = 0

while ($true) {
    $checkCount++
    $status = Test-NgrokStatus

    if ($status.Online) {
        if (-not $wasOnline) {
            # Ngrok vient de se connecter
            $currentUrl = $status.Url
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ngrok CONNECTE: $currentUrl" -ForegroundColor Green
            
            Send-WindowsNotification -Title "ngrok Connecte" -Message "Tunnel actif: $currentUrl"
            
            if ($disconnectCount -gt 0) {
                # Reconnexion après déconnexion
                $body = "Le tunnel ngrok s'est reconnecte.`n`nURL: $currentUrl`n`nHeure: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                Send-EmailAlert -Subject "ngrok - Reconnexion" -Body $body
            }
            
            $wasOnline = $true
        }
        else {
            # Toujours en ligne
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ngrok OK - $($status.Connections) connexions" -ForegroundColor Gray
        }
    }
    else {
        if ($wasOnline) {
            # Ngrok vient de se déconnecter
            $disconnectCount++
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ngrok DECONNECTE !" -ForegroundColor Red
            
            Send-WindowsNotification -Title "ngrok Deconnecte !" -Message "Le tunnel ngrok est hors ligne. Ancienne URL: $currentUrl"
            
            $body = "Le tunnel ngrok s'est deconnecte !`n`nAncienne URL: $currentUrl`n`nHeure: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nNombre de deconnexions: $disconnectCount"
            Send-EmailAlert -Subject "ALERTE: ngrok Deconnecte" -Body $body
            
            $wasOnline = $false
        }
        else {
            # Toujours hors ligne
            if ($checkCount % 10 -eq 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ngrok hors ligne (verification $checkCount)..." -ForegroundColor Yellow
            }
        }
    }

    Start-Sleep -Seconds $CheckIntervalSeconds
}

