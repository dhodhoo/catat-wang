param(
  [Parameter(Mandatory = $true)]
  [string]$NewWahaBaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$NewWahaApiKey,
  [Parameter(Mandatory = $true)]
  [string]$NewWahaWebhookSecret,
  [string]$SessionName = "default",
  [string]$OldWahaBaseUrl = "",
  [string]$OldWahaApiKey = "",
  [string]$OldWahaWebhookSecret = "",
  [string]$Scope = "dhodhos-projects"
)

$ErrorActionPreference = "Stop"

$tokenFile = Join-Path $env:APPDATA "com.vercel.cli\\Data\\auth.json"
if (-not (Test-Path $tokenFile)) {
  throw "Token Vercel tidak ditemukan di mesin ini. Jalankan 'vercel login' dulu."
}
$token = (Get-Content $tokenFile | ConvertFrom-Json).token

function Set-ProdEnv {
  param([string]$Key, [string]$Value)
  npx vercel env add $Key production --value $Value --yes --force --scope $Scope --token $token | Out-Host
}

Write-Host "Apply blue/green cutover -> WAHA baru" -ForegroundColor Cyan
Set-ProdEnv -Key "WAHA_BASE_URL" -Value $NewWahaBaseUrl
Set-ProdEnv -Key "WAHA_API_KEY" -Value $NewWahaApiKey
Set-ProdEnv -Key "WAHA_WEBHOOK_SECRET" -Value $NewWahaWebhookSecret
Set-ProdEnv -Key "WAHA_SESSION_NAME" -Value $SessionName

$rollbackPath = Join-Path $PSScriptRoot "..\\deploy\\waha\\rollback-waha-env.example.ps1"
@(
  "# Isi nilai old env agar rollback cepat jika perlu"
  "`$OldWahaBaseUrl = '$OldWahaBaseUrl'"
  "`$OldWahaApiKey = '$OldWahaApiKey'"
  "`$OldWahaWebhookSecret = '$OldWahaWebhookSecret'"
  "`$Scope = '$Scope'"
  "# Contoh rollback:"
  "# npx vercel env add WAHA_BASE_URL production --value `$OldWahaBaseUrl --yes --force --scope `$Scope"
  "# npx vercel env add WAHA_API_KEY production --value `$OldWahaApiKey --yes --force --scope `$Scope"
  "# npx vercel env add WAHA_WEBHOOK_SECRET production --value `$OldWahaWebhookSecret --yes --force --scope `$Scope"
) | Set-Content -Path $rollbackPath -Encoding ascii

Write-Host "Cutover env selesai. Lanjutkan commit + push agar deployment production berjalan via GitHub->Vercel." -ForegroundColor Green
Write-Host "Template rollback disimpan: $rollbackPath" -ForegroundColor Yellow
