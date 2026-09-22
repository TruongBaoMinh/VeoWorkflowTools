param(
  [string]$ExePath = "D:\VeoWorkflowTools\release\Veo Workflow Tools-win32-x64\Veo Workflow Tools.exe"
)

$ErrorActionPreference = "Stop"

Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

if (!(Test-Path -LiteralPath $ExePath)) {
  throw "Desktop app not found: $ExePath"
}

$workdir = Split-Path -Parent $ExePath
$process = Start-Process -FilePath $ExePath -WorkingDirectory $workdir -PassThru
Write-Host "started desktop pid=$($process.Id)"
