param(
  [Parameter(Mandatory = $true)]
  [string]$Host,
  [string]$User = "root",
  [int]$Port = 22,
  [string]$RemoteDir = "/opt/catatwang-waha",
  [string]$WahaApiKey = "",
  [int]$WahaPort = 3001
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "Command '$Name' tidak ditemukan di mesin ini."
  }
}

Require-Command ssh
Require-Command scp

if ([string]::IsNullOrWhiteSpace($WahaApiKey)) {
  $localEnvFile = Join-Path $PSScriptRoot "..\\.env.local"
  if (Test-Path $localEnvFile) {
    $match = Select-String -Path $localEnvFile -Pattern "^WAHA_API_KEY=(.+)$" | Select-Object -First 1
    if ($match) {
      $WahaApiKey = $match.Matches[0].Groups[1].Value.Trim()
    }
  }
}

if ([string]::IsNullOrWhiteSpace($WahaApiKey)) {
  throw "WAHA_API_KEY belum tersedia. Isi parameter -WahaApiKey atau set di .env.local."
}

$composeFile = Join-Path $PSScriptRoot "..\\deploy\\waha\\docker-compose.yml"
$tempEnvFile = Join-Path $env:TEMP "catatwang-waha.env"

@(
  "WAHA_API_KEY=$WahaApiKey"
  "WAHA_PORT=$WahaPort"
) | Set-Content -Path $tempEnvFile -Encoding ascii

$remote = "$User@$Host"

ssh -p $Port $remote "mkdir -p $RemoteDir/sessions"
scp -P $Port $composeFile "${remote}:$RemoteDir/docker-compose.yml"
scp -P $Port $tempEnvFile "${remote}:$RemoteDir/.env"
ssh -p $Port $remote "cd $RemoteDir && docker compose pull && docker compose up -d"
ssh -p $Port $remote "cd $RemoteDir && docker ps --filter name=catatwang-waha"

Remove-Item -LiteralPath $tempEnvFile -Force
