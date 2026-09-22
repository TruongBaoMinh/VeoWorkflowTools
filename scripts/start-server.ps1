param(
  [int]$Port = 4100,
  [switch]$Full
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Server = Join-Path $Root "server-runtime"
$Data = Join-Path $Root "data"
$UserData = Join-Path $Root "user-data"
$DbPath = Join-Path $Data "veo-workflow-tools.db"

New-Item -ItemType Directory -Path $Data -Force | Out-Null
New-Item -ItemType Directory -Path $UserData -Force | Out-Null

$env:PORT = "$Port"
$env:NODE_ENV = "development"
$env:BROWSER_RUNTIME = "chrome"
$env:USE_EXTENSION_BRIDGE = "1"
$env:APPDATA = $UserData
$env:LOCAL_AUTH_SECRET = if ($env:LOCAL_AUTH_SECRET) { $env:LOCAL_AUTH_SECRET } else { "dev-local-secret-change-me" }
$env:CAPTCHA_BRIDGE_SECRET = if ($env:CAPTCHA_BRIDGE_SECRET) { $env:CAPTCHA_BRIDGE_SECRET } else { "dev-captcha-secret-change-me" }
$env:DATABASE_URL = "file:$($DbPath -replace '\\','/')"

Write-Host "[VeoWorkflowTools] Starting backend on http://127.0.0.1:$Port"
Write-Host "[VeoWorkflowTools] DB: $DbPath"
Write-Host "[VeoWorkflowTools] User data: $UserData"
Write-Host "[VeoWorkflowTools] Server: $Server"
if ($Full) {
  Write-Host "[VeoWorkflowTools] Mode: full copied server"
}
else {
  Write-Host "[VeoWorkflowTools] Mode: tools server (profile + workflow)"
}

Push-Location $Server
try {
  if ($Full) {
    node .\dist\index.js
  }
  else {
    node .\tools-server.mjs
  }
}
finally {
  Pop-Location
}
