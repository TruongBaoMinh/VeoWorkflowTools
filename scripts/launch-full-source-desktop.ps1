$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Exe = Join-Path $Root "full-release\Veo Workflow Tools-win32-x64\Veo Workflow Tools.exe"

if (-not (Test-Path $Exe)) {
  throw "Missing full-source desktop exe: $Exe"
}

Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

$process = Start-Process `
  -FilePath $Exe `
  -WorkingDirectory (Split-Path -Parent $Exe) `
  -PassThru

Write-Host "started full-source desktop pid=$($process.Id)"
