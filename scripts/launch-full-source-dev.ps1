$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $Root "full-source-app"
$Electron = Join-Path $Root "desktop-app\node_modules\.bin\electron.cmd"

if (-not (Test-Path $Source)) {
  throw "Source folder not found: $Source"
}

if (-not (Test-Path $Electron)) {
  throw "Electron runtime not found: $Electron"
}

Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
$env:NODE_ENV = "development"
$env:INTEGRITY_VERIFY_ENABLED = "0"
$env:BROWSER_RUNTIME = "chrome"
$env:CAPTCHA_PROVIDER = "cdp"
$env:USE_EXTENSION_BRIDGE = "1"
$env:VEO3_APP_SOURCE = "full-source-dev"

$process = Start-Process -FilePath $Electron -ArgumentList @($Source) -WorkingDirectory $Source -PassThru
Write-Host "Started full-source dev app pid=$($process.Id)"
Write-Host "Source: $Source"
