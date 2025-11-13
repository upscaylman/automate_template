$apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZWQwN2QzMi0wYzI0LTQ1N2UtYmU0Yi0xNWZjYzMxY2ZkNDgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMDM4NDI3LCJleHAiOjE3NjU1ODA0MDB9.whMoo_gRuI9QbB2pdsnaIobePIgMzvWj1sf4odzbTqU'
$headers = @{
    'X-N8N-API-KEY' = $apiKey
    'Content-Type' = 'application/json'
}

Write-Host "=== ACTIVATION DU WORKFLOW ===" -ForegroundColor Cyan

try {
    # Récupérer le workflow actuel
    $workflow = Invoke-RestMethod -Uri "http://localhost:5678/api/v1/workflows/TXziodPP3k2lvj1h" -Method Get -Headers $headers
    
    Write-Host "Workflow recupere:" $workflow.name
    Write-Host "Statut actuel:" $workflow.active
    
    # Modifier le statut
    $workflow.active = $true
    
    # Retirer les champs read-only
    $workflow.PSObject.Properties.Remove('id')
    $workflow.PSObject.Properties.Remove('createdAt')
    $workflow.PSObject.Properties.Remove('updatedAt')
    
    # Sauvegarder
    $workflowJson = $workflow | ConvertTo-Json -Depth 20 -Compress
    
    # Mettre à jour
    $updated = Invoke-RestMethod -Uri "http://localhost:5678/api/v1/workflows/TXziodPP3k2lvj1h" -Method Put -Headers $headers -Body $workflowJson
    
    Write-Host "`nWorkflow active !" -ForegroundColor Green
    Write-Host "Nouveau statut:" $updated.active
    
} catch {
    Write-Host "`nERREUR:" $_.Exception.Message -ForegroundColor Red
    if($_.ErrorDetails.Message) {
        Write-Host "Details:" $_.ErrorDetails.Message -ForegroundColor Red
    }
}

