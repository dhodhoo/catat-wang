[CmdletBinding()]
param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "migrate-waha-vps.config.ps1")
)

$ErrorActionPreference = "Stop"

function Resolve-OptionalPath {
  param(
    [string]$PathValue,
    [string]$BaseDir
  )

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    return $PathValue
  }

  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return $PathValue
  }

  if ($PathValue.StartsWith('$')) {
    return $ExecutionContext.InvokeCommand.ExpandString($PathValue)
  }

  return (Join-Path $BaseDir $PathValue)
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "File config tidak ditemukan: $ConfigPath. Copy dulu dari scripts\migrate-waha-vps.config.example.ps1"
}

$resolvedConfigPath = (Resolve-Path -LiteralPath $ConfigPath).Path
$configDir = Split-Path -Parent $resolvedConfigPath
$config = & $resolvedConfigPath

if (-not $config) {
  throw "File config tidak mengembalikan hashtable."
}

$requiredKeys = @("OldHost", "NewHost")
foreach ($key in $requiredKeys) {
  if (-not $config.ContainsKey($key) -or [string]::IsNullOrWhiteSpace([string]$config[$key])) {
    throw "Config wajib diisi: $key"
  }
}

$config["OldKeyPath"] = Resolve-OptionalPath -PathValue ([string]$config["OldKeyPath"]) -BaseDir $configDir
$config["NewKeyPath"] = Resolve-OptionalPath -PathValue ([string]$config["NewKeyPath"]) -BaseDir $configDir
$config["WorkingDir"] = Resolve-OptionalPath -PathValue ([string]$config["WorkingDir"]) -BaseDir $configDir

$scriptPath = Join-Path $PSScriptRoot "migrate-waha-vps.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Script utama tidak ditemukan: $scriptPath"
}

Write-Host "Menjalankan migrasi WAHA dari config: $resolvedConfigPath" -ForegroundColor Cyan
& $scriptPath @config
