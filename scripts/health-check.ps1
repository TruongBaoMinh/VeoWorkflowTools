param(
  [int]$Port = 4100
)

$ErrorActionPreference = "Stop"
$url = "http://127.0.0.1:$Port/api/health"

Write-Host "[VeoWorkflowTools] Checking $url"
$response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
$response | ConvertTo-Json -Depth 10
