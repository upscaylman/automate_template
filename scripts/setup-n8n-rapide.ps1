# Script pour guider le setup rapide de n8n
# Usage: .\scripts\setup-n8n-rapide.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SETUP RAPIDE N8N" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que n8n est accessible
Write-Host "Verification de n8n..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678" -Method GET -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "OK - n8n est accessible" -ForegroundColor Green
} catch {
    Write-Host "ERREUR - n8n n'est pas accessible" -ForegroundColor Red
    Write-Host "Demarrez n8n avec: cd docker && docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier si n8n demande le setup
Write-Host "Verification si n8n demande le setup..." -ForegroundColor Yellow
try {
    $setupCheck = Invoke-WebRequest -Uri "http://localhost:5678/setup" -Method GET -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($setupCheck.StatusCode -eq 200) {
        Write-Host "n8n demande le setup initial" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ETAPES:" -ForegroundColor Cyan
        Write-Host "1. Ouvrez n8n dans votre navigateur:" -ForegroundColor White
        Write-Host "   http://localhost:5678" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Remplissez le formulaire de setup:" -ForegroundColor White
        Write-Host "   - Email: (utilisez le meme que sur l'autre machine ou un autre)" -ForegroundColor Gray
        Write-Host "   - Mot de passe: (peut etre different)" -ForegroundColor Gray
        Write-Host "   - Prenom et Nom" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Apres le setup, importez les workflows:" -ForegroundColor White
        Write-Host "   - Allez dans 'Workflows' > 'Import from File'" -ForegroundColor Gray
        Write-Host "   - Importez depuis: workflows/dev/gpt_generator.json" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Activez les workflows (toggle vert)" -ForegroundColor White
        Write-Host ""
        Write-Host "5. Reconfigurez les credentials (nœuds avec cadenas)" -ForegroundColor White
        Write-Host ""
        
        # Ouvrir n8n dans le navigateur
        Write-Host "Ouverture de n8n dans le navigateur..." -ForegroundColor Cyan
        Start-Process "http://localhost:5678"
    } else {
        Write-Host "n8n est deja configure" -ForegroundColor Green
        Write-Host ""
        Write-Host "Si vous voulez importer des workflows:" -ForegroundColor Yellow
        Write-Host "1. Allez dans 'Workflows' > 'Import from File'" -ForegroundColor White
        Write-Host "2. Importez depuis: workflows/dev/gpt_generator.json" -ForegroundColor White
        Write-Host ""
        
        # Ouvrir n8n dans le navigateur
        Start-Process "http://localhost:5678"
    }
} catch {
    Write-Host "Impossible de verifier le statut du setup" -ForegroundColor Yellow
    Write-Host "Ouvrez manuellement: http://localhost:5678" -ForegroundColor Cyan
    Start-Process "http://localhost:5678"
}

Write-Host ""
Write-Host "Pour plus d'informations, consultez:" -ForegroundColor Gray
Write-Host "docs/SETUP_N8N_NOUVELLE_MACHINE.md" -ForegroundColor Gray
Write-Host ""

