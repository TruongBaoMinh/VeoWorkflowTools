param(
  [int]$Port = 4100
)

$ErrorActionPreference = "Continue"

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Host "not-running port=$Port"
  exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($serverPid in $pids) {
  Write-Host "stopping pid=$serverPid port=$Port"
  Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 500
$remaining = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($remaining) {
  Write-Host "still-running port=$Port"
  exit 1
}

Write-Host "stopped port=$Port"
