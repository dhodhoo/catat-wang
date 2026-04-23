param(
  [Parameter(Mandatory = $true)]
  [string]$WahaBaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$WahaApiKey,
  [string]$SessionName = "default",
  [int]$TimeoutSec = 15
)

$ErrorActionPreference = "Stop"

$headers = @{ "X-Api-Key" = $WahaApiKey; Accept = "application/json" }
$uri = "{0}/api/sessions/{1}" -f $WahaBaseUrl.TrimEnd('/'), $SessionName

try {
  $resp = Invoke-RestMethod -Method GET -Uri $uri -Headers $headers -TimeoutSec $TimeoutSec
} catch {
  Write-Error "WAHA healthcheck gagal request: $($_.Exception.Message)"
  exit 2
}

if (-not $resp -or -not $resp.status) {
  Write-Error "WAHA healthcheck: respons tidak valid."
  exit 3
}

Write-Host ("WAHA session {0} status: {1}" -f $SessionName, $resp.status)
if ($resp.status -ne "WORKING") {
  Write-Error "WAHA session belum WORKING."
  exit 4
}

Write-Host "WAHA healthcheck OK." -ForegroundColor Green
