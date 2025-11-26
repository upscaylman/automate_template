# Script pour gérer l'icône dans le system tray
# Affiche le statut des services et permet de les contrôler

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Créer l'icône dans le system tray
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon

# Utiliser une icône système
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Text = "DOCEASE - Services actifs"
$notifyIcon.Visible = $true

# Créer le menu contextuel
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

# Menu: Ouvrir n8n
$menuN8n = New-Object System.Windows.Forms.ToolStripMenuItem
$menuN8n.Text = "Ouvrir n8n"
$menuN8n.Add_Click({
    Start-Process "http://localhost:5678"
})
$contextMenu.Items.Add($menuN8n)

# Menu: Ouvrir Formulaire
$menuForm = New-Object System.Windows.Forms.ToolStripMenuItem
$menuForm.Text = "Ouvrir Formulaire"
$menuForm.Add_Click({
    Start-Process "http://localhost:8080"
})
$contextMenu.Items.Add($menuForm)

# Menu: Ouvrir ngrok
$menuNgrok = New-Object System.Windows.Forms.ToolStripMenuItem
$menuNgrok.Text = "Ouvrir ngrok Interface"
$menuNgrok.Add_Click({
    Start-Process "http://localhost:4040"
})
$contextMenu.Items.Add($menuNgrok)

# Séparateur
$contextMenu.Items.Add("-")

# Menu: Afficher URL ngrok
$menuShowUrl = New-Object System.Windows.Forms.ToolStripMenuItem
$menuShowUrl.Text = "Copier URL ngrok"
$menuShowUrl.Add_Click({
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        if ($response.tunnels) {
            $url = $response.tunnels[0].public_url
            Set-Clipboard -Value $url
            [System.Windows.Forms.MessageBox]::Show("URL copiée dans le presse-papier:`n$url", "DOCEASE", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        }
    }
    catch {
        [System.Windows.Forms.MessageBox]::Show("Impossible de récupérer l'URL ngrok", "DOCEASE", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
    }
})
$contextMenu.Items.Add($menuShowUrl)

# Séparateur
$contextMenu.Items.Add("-")

# Menu: Arrêter tous les services
$menuStop = New-Object System.Windows.Forms.ToolStripMenuItem
$menuStop.Text = "Arrêter tous les services"
$menuStop.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show("Voulez-vous vraiment arrêter tous les services ?", "DOCEASE", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Question)
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        $scriptRoot = Split-Path -Parent $PSScriptRoot
        $stopBat = Join-Path $scriptRoot "stop.bat"
        if (Test-Path $stopBat) {
            Start-Process -FilePath $stopBat -WindowStyle Hidden
            Start-Sleep -Seconds 2
            $notifyIcon.Visible = $false
            [System.Windows.Forms.Application]::Exit()
        }
    }
})
$contextMenu.Items.Add($menuStop)

# Séparateur
$contextMenu.Items.Add("-")

# Menu: Quitter (sans arrêter les services)
$menuExit = New-Object System.Windows.Forms.ToolStripMenuItem
$menuExit.Text = "Quitter (services restent actifs)"
$menuExit.Add_Click({
    $notifyIcon.Visible = $false
    [System.Windows.Forms.Application]::Exit()
})
$contextMenu.Items.Add($menuExit)

# Assigner le menu à l'icône
$notifyIcon.ContextMenuStrip = $contextMenu

# Double-clic pour ouvrir n8n
$notifyIcon.Add_DoubleClick({
    Start-Process "http://localhost:5678"
})

# Afficher une notification de démarrage
$notifyIcon.BalloonTipTitle = "DOCEASE"
$notifyIcon.BalloonTipText = "Services démarrés avec succès !`nDouble-clic pour ouvrir n8n"
$notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notifyIcon.ShowBalloonTip(5000)

# Boucle de messages pour garder l'icône active
Write-Host "Icone system tray active" -ForegroundColor Green
Write-Host "Clic droit sur l'icone pour voir les options" -ForegroundColor Gray
Write-Host ""

[System.Windows.Forms.Application]::Run()

# Nettoyage
$notifyIcon.Dispose()

