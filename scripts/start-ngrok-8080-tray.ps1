# Script pour démarrer ngrok dans le system tray avec surveillance et notification
param(
    [string]$NgrokPath
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Créer l'icône dans le system tray
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Text = "ngrok http 8080 - Actif"
$notifyIcon.Visible = $true

# Créer le menu contextuel
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

# Menu : Ouvrir l'interface ngrok
$menuOpenWeb = New-Object System.Windows.Forms.ToolStripMenuItem
$menuOpenWeb.Text = "Ouvrir Interface (localhost:4040)"
$menuOpenWeb.Add_Click({
    Start-Process "http://localhost:4040"
})
$contextMenu.Items.Add($menuOpenWeb)

# Séparateur
$contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))

# Menu : Quitter
$menuExit = New-Object System.Windows.Forms.ToolStripMenuItem
$menuExit.Text = "Quitter ngrok"
$menuExit.Add_Click({
    $notifyIcon.Visible = $false
    if ($script:ngrokProcess -and -not $script:ngrokProcess.HasExited) {
        $script:ngrokProcess.Kill()
    }
    [System.Windows.Forms.Application]::Exit()
})
$contextMenu.Items.Add($menuExit)

$notifyIcon.ContextMenuStrip = $contextMenu

# Notification de démarrage
$notifyIcon.BalloonTipTitle = "ngrok http 8080"
$notifyIcon.BalloonTipText = "ngrok est démarré ! Interface: http://localhost:4040"
$notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notifyIcon.ShowBalloonTip(5000)

# Fonction pour envoyer l'email de notification
function Send-DisconnectionEmail {
    try {
        $emailData = @{
            emailEnvoi = "bouvier.jul@gmail.com;aguillermin@fo-metaux.fr"
            nomDestinataire = "Équipe Technique"
            customEmailMessage = "Bonjour,`n`nLe serveur local DocEase (ngrok) s'est déconnecté.`n`nPour redémarrer :`n1. Ouvrez le dossier du projet`n2. Double-cliquez sur start.bat`n3. Mot de passe admin : joubert`n`nCordialement,`nSystème de Monitoring DocEase"
            templateName = "⚠️ Déconnexion Serveur Local DocEase"
        } | ConvertTo-Json -Depth 10
        
        Invoke-RestMethod -Uri "http://localhost:5678/webhook/1ee6e745-fc31-4fd8-bc59-531bd4a69997" `
            -Method POST `
            -Body $emailData `
            -ContentType "application/json" `
            -TimeoutSec 30 | Out-Null
        
        $notifyIcon.BalloonTipTitle = "Email envoyé"
        $notifyIcon.BalloonTipText = "Notification de déconnexion envoyée"
        $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $notifyIcon.ShowBalloonTip(3000)
        
    } catch {
        Write-Host "Erreur envoi email : $_" -ForegroundColor Red
    }
}

# Boucle de surveillance et redémarrage automatique
$script:ngrokProcess = $null
$emailSent = $false

while ($true) {
    try {
        # Démarrer ngrok
        $notifyIcon.Text = "ngrok http 8080 - Démarrage..."
        
        $script:ngrokProcess = Start-Process -FilePath $NgrokPath `
            -ArgumentList "http", "8080" `
            -PassThru `
            -WindowStyle Hidden
        
        $notifyIcon.Text = "ngrok http 8080 - Actif (PID: $($script:ngrokProcess.Id))"
        $emailSent = $false
        
        # Attendre que le processus se termine
        $script:ngrokProcess.WaitForExit()
        
        # ngrok s'est arrêté
        $notifyIcon.Text = "ngrok http 8080 - Déconnecté"
        $notifyIcon.BalloonTipTitle = "⚠️ ngrok déconnecté"
        $notifyIcon.BalloonTipText = "ngrok s'est arrêté. Envoi notification et redémarrage..."
        $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
        $notifyIcon.ShowBalloonTip(5000)
        
        # Envoyer l'email une seule fois
        if (-not $emailSent) {
            Send-DisconnectionEmail
            $emailSent = $true
        }
        
        # Attendre avant de redémarrer
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "Erreur : $_" -ForegroundColor Red
        Start-Sleep -Seconds 10
    }
}

# Nettoyer à la sortie
$notifyIcon.Visible = $false
$notifyIcon.Dispose()

