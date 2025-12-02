# Wrapper pour démarrer le serveur avec notification et minimisation
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Changer le titre de la fenêtre pour la rendre identifiable
$host.UI.RawUI.WindowTitle = "🌐 Serveur PowerShell Multi-Services - Port 8080"

# Afficher une notification Windows
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$notification = New-Object System.Windows.Forms.NotifyIcon
$notification.Icon = [System.Drawing.SystemIcons]::Information
$notification.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
$notification.BalloonTipText = "Serveur PowerShell Multi-Services démarré sur http://localhost:8080"
$notification.BalloonTipTitle = "Serveur Formulaire"
$notification.Visible = $True
$notification.ShowBalloonTip(10000)

# Attendre que la notification soit affichée
Start-Sleep -Seconds 2

# Nettoyer la notification
$notification.Dispose()

# Minimiser la fenêtre PowerShell actuelle
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Window {
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        [DllImport("kernel32.dll")]
        public static extern IntPtr GetConsoleWindow();
    }
"@

$consolePtr = [Window]::GetConsoleWindow()
# SW_SHOWMINIMIZED = 2 (minimise mais garde dans la barre des tâches)
[Window]::ShowWindow($consolePtr, 2) | Out-Null

# Démarrer le serveur principal
& "$ScriptDir\serve-form.ps1"

