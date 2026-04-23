param(
  [Parameter(Mandatory = $true)]
  [string]$WahaBaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$WahaApiKey,
  [string]$SessionName = "default",
  [Parameter(Mandatory = $true)]
  [string]$WebhookUrl,
  [Parameter(Mandatory = $true)]
  [string]$WebhookSecret,
  [int]$PollAttempts = 10,
  [int]$PollDelaySeconds = 2
)

$ErrorActionPreference = "Stop"

function Invoke-WahaApi {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [object]$Body
  )

  $headers = @{
    "X-Api-Key" = $WahaApiKey
    "Content-Type" = "application/json"
    Accept = "application/json"
  }

  $uri = "{0}{1}" -f $WahaBaseUrl.TrimEnd('/'), $Path
  $jsonBody = if ($null -ne $Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }

  try {
    if ($null -eq $jsonBody) {
      return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
    }

    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $jsonBody
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 404) {
      return $null
    }
    throw
  }
}

$config = @{
  name = $SessionName
  start = $false
  config = @{
    webhooks = @(
      @{
        url = $WebhookUrl
        events = @("message", "session.status")
        hmac = @{ key = $WebhookSecret }
        retries = @{ attempts = 3; delaySeconds = 2 }
      }
    )
  }
}

$existing = Invoke-WahaApi -Method GET -Path "/api/sessions/$SessionName"
if ($null -eq $existing) {
  Write-Host "Create WAHA session '$SessionName'" -ForegroundColor Cyan
  Invoke-WahaApi -Method POST -Path "/api/sessions" -Body $config | Out-Null
} else {
  Write-Host "Update WAHA session '$SessionName'" -ForegroundColor Cyan
  Invoke-WahaApi -Method PUT -Path "/api/sessions/$SessionName" -Body $config | Out-Null
}

Write-Host "Start session '$SessionName'" -ForegroundColor Cyan
try {
  Invoke-WahaApi -Method POST -Path "/api/sessions/$SessionName/start" | Out-Null
} catch {
  Write-Host "Start session mengembalikan error (kemungkinan sudah running), lanjut poll status." -ForegroundColor Yellow
}

for ($i = 0; $i -lt $PollAttempts; $i += 1) {
  $session = Invoke-WahaApi -Method GET -Path "/api/sessions/$SessionName"
  $status = $session.status
  Write-Host "Status: $status" -ForegroundColor Gray

  if ($status -eq "WORKING") {
    Write-Host "Session WORKING." -ForegroundColor Green
    exit 0
  }

  Start-Sleep -Seconds $PollDelaySeconds
}

Write-Host "Session belum WORKING. Cek dashboard WAHA untuk scan QR jika perlu." -ForegroundColor Yellow
