# Script pour créer une tâche planifiée qui lance start.bat en administrateur sans UAC
# À exécuter UNE SEULE FOIS en tant qu'administrateur

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION DEMARRAGE ADMINISTRATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERREUR: Ce script doit etre execute en tant qu'administrateur" -ForegroundColor Red
    Write-Host "Clic droit sur le fichier > Executer en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Chemins
$scriptPath = Split-Path -Parent $PSScriptRoot
$startBatPath = Join-Path $scriptPath "start.bat"
$taskName = "N8N-Automate-Start"

Write-Host "Chemin du script: $startBatPath" -ForegroundColor Gray
Write-Host ""

# Demander le mot de passe
$computerName = $env:COMPUTERNAME
$username = $env:USERNAME
$fullUsername = "$computerName\$username"

Write-Host "Ordinateur: $computerName" -ForegroundColor Cyan
Write-Host "Utilisateur: $username" -ForegroundColor Cyan
Write-Host "Nom complet: $fullUsername" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Entrez votre mot de passe Windows" -AsSecureString

# Convertir le mot de passe pour la tâche planifiée
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

Write-Host ""
Write-Host "Creation de la tache planifiee..." -ForegroundColor Yellow

try {
    # Supprimer la tâche si elle existe déjà
    Write-Host "Verification tache existante..." -ForegroundColor Gray
    $existingTask = schtasks /query /tn "$taskName" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Suppression de l'ancienne tache..." -ForegroundColor Gray
        schtasks /delete /tn "$taskName" /f | Out-Null
        Write-Host "Ancienne tache supprimee" -ForegroundColor Gray
    }

    Write-Host "Creation de la tache avec schtasks..." -ForegroundColor Gray

    # Créer un fichier XML temporaire pour la tâche
    $xmlPath = Join-Path $env:TEMP "n8n-task.xml"

    $xmlContent = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Demarrage automatique n8n-automate en mode administrateur</Description>
  </RegistrationInfo>
  <Triggers />
  <Principals>
    <Principal id="Author">
      <UserId>$fullUsername</UserId>
      <LogonType>Password</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>cmd.exe</Command>
      <Arguments>/c "$startBatPath"</Arguments>
    </Exec>
  </Actions>
</Task>
"@

    # Sauvegarder le XML
    [System.IO.File]::WriteAllText($xmlPath, $xmlContent, [System.Text.Encoding]::Unicode)

    Write-Host "Enregistrement de la tache..." -ForegroundColor Gray

    # Créer la tâche avec schtasks
    $result = schtasks /create /tn "$taskName" /xml "$xmlPath" /ru "$fullUsername" /rp "$plainPassword" /f 2>&1

    # Supprimer le fichier XML temporaire
    Remove-Item $xmlPath -Force -ErrorAction SilentlyContinue

    if ($LASTEXITCODE -ne 0) {
        throw "Erreur schtasks: $result"
    }

    Write-Host ""
    Write-Host "Verification de la tache..." -ForegroundColor Gray
    $verifyTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

    if ($verifyTask) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "CONFIGURATION TERMINEE !" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tache planifiee creee: $taskName" -ForegroundColor Cyan
        Write-Host "Utilisateur: $fullUsername" -ForegroundColor Cyan
        Write-Host "Etat: $($verifyTask.State)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Pour demarrer le systeme en administrateur SANS UAC:" -ForegroundColor White
        Write-Host "  1. Double-cliquez sur: START-ADMIN.bat" -ForegroundColor Yellow
        Write-Host "  OU" -ForegroundColor Gray
        Write-Host "  2. Executez: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "La tache s'executera automatiquement sans demander le mot de passe !" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "ATTENTION: La tache a ete creee mais n'est pas visible" -ForegroundColor Yellow
        Write-Host "Verifiez dans le Planificateur de taches Windows" -ForegroundColor Yellow
        Write-Host ""
    }
}
catch {
    Write-Host ""
    Write-Host "ERREUR lors de la creation de la tache:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host "Appuyez sur une touche pour fermer..."
pause

