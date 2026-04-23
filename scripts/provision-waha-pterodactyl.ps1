param(
  [Parameter(Mandatory = $true)]
  [string]$PanelUrl,
  [Parameter(Mandatory = $true)]
  [string]$ClientApiKey,
  [Parameter(Mandatory = $true)]
  [string]$ServerIdentifier,
  [string]$WahaDockerImage = "devlikeapro/waha:latest",
  [Parameter(Mandatory = $true)]
  [string]$WahaApiKey,
  [string]$DashboardUsername = "admin",
  [Parameter(Mandatory = $true)]
  [string]$DashboardPassword,
  [switch]$RestartServer
)

$ErrorActionPreference = "Stop"

function Invoke-PteroClientApi {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [object]$Body
  )

  $headers = @{
    Authorization = "Bearer $ClientApiKey"
    Accept = "application/json"
    "Content-Type" = "application/json"
  }

  $uri = "{0}{1}" -f $PanelUrl.TrimEnd('/'), $Path
  $jsonBody = if ($null -ne $Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }

  if ($null -eq $jsonBody) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
  }

  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $jsonBody
}

function Resolve-ServerId {
  param([string]$Identifier)

  $resp = Invoke-PteroClientApi -Method GET -Path "/api/client"
  if (-not $resp.data) {
    throw "Tidak ada server yang terlihat oleh API key ini."
  }

  $match = $resp.data | Where-Object {
    $_.attributes.identifier -eq $Identifier -or
    $_.attributes.name -eq $Identifier -or
    $_.attributes.uuid -eq $Identifier
  } | Select-Object -First 1

  if (-not $match) {
    $known = ($resp.data | ForEach-Object { $_.attributes.identifier }) -join ", "
    throw "Server '$Identifier' tidak ditemukan. Identifier tersedia: $known"
  }

  return $match.attributes.identifier
}

function Update-StartupVariable {
  param(
    [string]$ServerId,
    [string]$Key,
    [string]$Value
  )

  Write-Host "Set startup variable $Key" -ForegroundColor Cyan
  Invoke-PteroClientApi -Method PUT -Path "/api/client/servers/$ServerId/startup/variable" -Body @{
    key = $Key
    value = $Value
  } | Out-Null
}

$serverId = Resolve-ServerId -Identifier $ServerIdentifier
Write-Host "Target server: $serverId" -ForegroundColor Green

Write-Host "Set docker image: $WahaDockerImage" -ForegroundColor Cyan
Invoke-PteroClientApi -Method PATCH -Path "/api/client/servers/$serverId/settings/docker-image" -Body @{
  docker_image = $WahaDockerImage
} | Out-Null

Update-StartupVariable -ServerId $serverId -Key "WAHA_API_KEY" -Value $WahaApiKey
Update-StartupVariable -ServerId $serverId -Key "WAHA_DASHBOARD_USERNAME" -Value $DashboardUsername
Update-StartupVariable -ServerId $serverId -Key "WAHA_DASHBOARD_PASSWORD" -Value $DashboardPassword
Update-StartupVariable -ServerId $serverId -Key "WHATSAPP_SWAGGER_USERNAME" -Value $DashboardUsername
Update-StartupVariable -ServerId $serverId -Key "WHATSAPP_SWAGGER_PASSWORD" -Value $DashboardPassword

if ($RestartServer) {
  Write-Host "Restarting server..." -ForegroundColor Yellow
  Invoke-PteroClientApi -Method POST -Path "/api/client/servers/$serverId/power" -Body @{
    signal = "restart"
  } | Out-Null
}

Write-Host "Pterodactyl WAHA provisioning selesai." -ForegroundColor Green
