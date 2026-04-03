param(
  [Parameter(Mandatory = $true)]
  [string]$WahaBaseUrl,
  [string]$WahaApiKey = "",
  [string]$Scope = "dhodhos-projects"
)

$ErrorActionPreference = "Stop"

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

$tokenFile = Join-Path $env:APPDATA "com.vercel.cli\\Data\\auth.json"
if (-not (Test-Path $tokenFile)) {
  throw "Token Vercel tidak ditemukan di mesin ini."
}

$token = (Get-Content $tokenFile | ConvertFrom-Json).token

npx vercel env add WAHA_BASE_URL production --value $WahaBaseUrl --yes --force --scope $Scope --token $token
npx vercel env add WAHA_API_KEY production --value $WahaApiKey --yes --force --scope $Scope --token $token
npx @insforge/cli secrets update WAHA_BASE_URL --value $WahaBaseUrl
npx @insforge/cli secrets update WAHA_API_KEY --value $WahaApiKey
npx vercel deploy --prod --yes --scope $Scope --token $token
