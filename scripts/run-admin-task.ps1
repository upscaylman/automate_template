# Script pour lancer la tâche planifiée ou démarrer en mode admin classique

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE EN ADMINISTRATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$taskName = "N8N-Automate-Start"

# Vérifier si la tâche existe
try {
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
    
    Write-Host "Tache planifiee trouvee: $taskName" -ForegroundColor Green
    Write-Host "Lancement de la tache..." -ForegroundColor Yellow
    Write-Host ""
    
    # Lancer la tâche
    Start-ScheduledTask -TaskName $taskName -ErrorAction Stop
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEMARRAGE EN COURS..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le systeme demarre en arriere-plan en mode administrateur" -ForegroundColor White
    Write-Host "Consultez la fenetre qui s'est ouverte pour voir la progression" -ForegroundColor White
    Write-Host ""
    
    Start-Sleep -Seconds 2
}
catch {
    Write-Host "La tache planifiee n'existe pas ou n'est pas accessible" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tentative de demarrage en mode administrateur classique..." -ForegroundColor Yellow
    Write-Host ""
    
    # Vérifier si on est déjà administrateur
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    $startBatPath = Join-Path (Split-Path -Parent $PSScriptRoot) "start.bat"
    
    if ($isAdmin) {
        Write-Host "Deja en mode administrateur, lancement direct..." -ForegroundColor Green
        & $startBatPath
    }
    else {
        Write-Host "Demande d'elevation UAC..." -ForegroundColor Yellow
        Start-Process -FilePath $startBatPath -Verb RunAs
        Write-Host ""
        Write-Host "Consultez la fenetre UAC pour autoriser l'elevation" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CONFIGURATION TACHE PLANIFIEE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour eviter l'UAC a chaque demarrage, configurez la tache planifiee:" -ForegroundColor White
    Write-Host ""
    Write-Host "  1. Clic droit sur SETUP-ADMIN.bat" -ForegroundColor Yellow
    Write-Host "  2. Executer en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "  3. Entrez votre mot de passe Windows" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ensuite, START-ADMIN.bat fonctionnera sans UAC !" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour fermer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

