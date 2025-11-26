# Console unifiée avec support system tray
# Permet de minimiser la console dans le system tray

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Obtenir la fenêtre console actuelle
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
        [DllImport("kernel32.dll")]
        public static extern IntPtr GetConsoleWindow();
        
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        public const int SW_HIDE = 0;
        public const int SW_SHOW = 5;
        public const int SW_MINIMIZE = 6;
        public const int SW_RESTORE = 9;
    }
"@

$consoleWindow = [Win32]::GetConsoleWindow()

# Créer l'icône system tray
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
$notifyIcon.Text = "DOCEASE - Console"
$notifyIcon.Visible = $true

# Menu contextuel
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

# Restaurer la console
$menuRestore = New-Object System.Windows.Forms.ToolStripMenuItem
$menuRestore.Text = "Afficher la console"
$menuRestore.Add_Click({
    [Win32]::ShowWindow($consoleWindow, [Win32]::SW_RESTORE)
})
$contextMenu.Items.Add($menuRestore)

# Minimiser dans le tray
$menuHide = New-Object System.Windows.Forms.ToolStripMenuItem
$menuHide.Text = "Masquer dans le tray"
$menuHide.Add_Click({
    [Win32]::ShowWindow($consoleWindow, [Win32]::SW_HIDE)
})
$contextMenu.Items.Add($menuHide)

$contextMenu.Items.Add("-")

# Ouvrir n8n
$menuN8n = New-Object System.Windows.Forms.ToolStripMenuItem
$menuN8n.Text = "Ouvrir n8n"
$menuN8n.Add_Click({
    Start-Process "http://localhost:5678"
})
$contextMenu.Items.Add($menuN8n)

# Ouvrir Formulaire
$menuForm = New-Object System.Windows.Forms.ToolStripMenuItem
$menuForm.Text = "Ouvrir Formulaire"
$menuForm.Add_Click({
    Start-Process "http://localhost:8080"
})
$contextMenu.Items.Add($menuForm)

# Ouvrir ngrok
$menuNgrok = New-Object System.Windows.Forms.ToolStripMenuItem
$menuNgrok.Text = "Ouvrir ngrok Interface"
$menuNgrok.Add_Click({
    Start-Process "http://localhost:4040"
})
$contextMenu.Items.Add($menuNgrok)

$contextMenu.Items.Add("-")

# Copier URL ngrok
$menuCopyUrl = New-Object System.Windows.Forms.ToolStripMenuItem
$menuCopyUrl.Text = "Copier URL ngrok"
$menuCopyUrl.Add_Click({
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        if ($response.tunnels) {
            $url = $response.tunnels[0].public_url
            Set-Clipboard -Value $url
            $notifyIcon.BalloonTipTitle = "URL copiée"
            $notifyIcon.BalloonTipText = $url
            $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
            $notifyIcon.ShowBalloonTip(3000)
        }
    }
    catch {
        $notifyIcon.BalloonTipTitle = "Erreur"
        $notifyIcon.BalloonTipText = "Impossible de récupérer l'URL ngrok"
        $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
        $notifyIcon.ShowBalloonTip(3000)
    }
})
$contextMenu.Items.Add($menuCopyUrl)

$contextMenu.Items.Add("-")

# Arrêter tous les services
$menuStop = New-Object System.Windows.Forms.ToolStripMenuItem
$menuStop.Text = "Arrêter tous les services"
$menuStop.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show("Voulez-vous vraiment arrêter tous les services ?", "DOCEASE", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Question)
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        $scriptRoot = Split-Path -Parent $PSScriptRoot
        $stopBat = Join-Path $scriptRoot "ARRETER.bat"
        if (Test-Path $stopBat) {
            Start-Process -FilePath $stopBat -WindowStyle Hidden
        }
        $notifyIcon.Visible = $false
        exit
    }
})
$contextMenu.Items.Add($menuStop)

$notifyIcon.ContextMenuStrip = $contextMenu

# Double-clic pour restaurer la console
$notifyIcon.Add_DoubleClick({
    [Win32]::ShowWindow($consoleWindow, [Win32]::SW_RESTORE)
})

# Notification de démarrage
$notifyIcon.BalloonTipTitle = "DOCEASE"
$notifyIcon.BalloonTipText = "Console démarrée ! Double-clic pour afficher"
$notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notifyIcon.ShowBalloonTip(3000)

# Retourner l'objet pour qu'il reste en mémoire
return $notifyIcon

