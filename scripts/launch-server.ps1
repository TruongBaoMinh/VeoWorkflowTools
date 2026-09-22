param(
  [int]$Port = 4100
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $Root "logs"
$OutLog = Join-Path $LogDir "tools-host.out.log"
$ErrLog = Join-Path $LogDir "tools-host.err.log"
$StartScript = Join-Path $PSScriptRoot "start-server.ps1"

New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
Remove-Item -Path $OutLog, $ErrLog -Force -ErrorAction SilentlyContinue

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  $owningPid = ($existing | Select-Object -First 1).OwningProcess
  Write-Host "already-running pid=$owningPid port=$Port"
  exit 0
}

$args = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $StartScript,
  "-Port", "$Port"
)

$process = Start-Process `
  -FilePath "powershell.exe" `
  -ArgumentList $args `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog `
  -PassThru

Write-Host "started pid=$($process.Id) port=$Port"
Write-Host "stdout=$OutLog"
Write-Host "stderr=$ErrLog"
