param(
  [Parameter(Mandatory = $true)]
  [string]$PanelUrl,
  [Parameter(Mandatory = $true)]
  [string]$ClientApiKey,
  [Parameter(Mandatory = $true)]
  [string]$ServerIdentifier,
  [string]$WahaDockerImage = "ghcr.io/parkervcp/yolks:nodejs_24",
  [Parameter(Mandatory = $true)]
  [string]$WahaApiKey,
  [string]$DashboardUsername = "admin",
  [Parameter(Mandatory = $true)]
  [string]$DashboardPassword,
  [int]$Port = 3000,
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

function Get-ServerDetails {
  param([string]$ServerId)
  return Invoke-PteroClientApi -Method GET -Path "/api/client/servers/$ServerId"
}

function Get-StartupMeta {
  param([string]$ServerId)
  return Invoke-PteroClientApi -Method GET -Path "/api/client/servers/$ServerId/startup"
}

function Update-StartupVariable {
  param(
    [string]$ServerId,
    [string]$Key,
    [string]$Value,
    [string[]]$AvailableKeys
  )

  if ($AvailableKeys -and ($AvailableKeys -notcontains $Key)) {
    Write-Host "Skip startup variable $Key (not available on this egg)." -ForegroundColor Yellow
    return
  }

  Write-Host "Set startup variable $Key" -ForegroundColor Cyan
  Invoke-PteroClientApi -Method PUT -Path "/api/client/servers/$ServerId/startup/variable" -Body @{
    key = $Key
    value = $Value
  } | Out-Null
}

$serverId = Resolve-ServerId -Identifier $ServerIdentifier
Write-Host "Target server: $serverId" -ForegroundColor Green
$server = Get-ServerDetails -ServerId $serverId
$startup = Get-StartupMeta -ServerId $serverId
$availableKeys = @()
if ($server.attributes.relationships.variables.data) {
  $availableKeys = $server.attributes.relationships.variables.data | ForEach-Object { $_.attributes.env_variable }
}
Write-Host ("Available startup env: {0}" -f (($availableKeys -join ", "))) -ForegroundColor DarkGray

$allowedImages = @()
if ($startup.meta.docker_images) {
  $allowedImages = @($startup.meta.docker_images.PSObject.Properties.Value)
}

$imageToUse = $WahaDockerImage
if ($allowedImages.Count -gt 0 -and ($allowedImages -notcontains $WahaDockerImage)) {
  $imageToUse = $allowedImages[0]
  Write-Host "Requested image not allowed by this egg. Fallback to: $imageToUse" -ForegroundColor Yellow
}

Write-Host "Set docker image: $imageToUse" -ForegroundColor Cyan
Invoke-PteroClientApi -Method PUT -Path "/api/client/servers/$serverId/settings/docker-image" -Body @{
  docker_image = $imageToUse
} | Out-Null

Update-StartupVariable -ServerId $serverId -Key "WAHA_API_KEY" -Value $WahaApiKey -AvailableKeys $availableKeys
Update-StartupVariable -ServerId $serverId -Key "WAHA_DASHBOARD_USERNAME" -Value $DashboardUsername -AvailableKeys $availableKeys
Update-StartupVariable -ServerId $serverId -Key "WAHA_DASHBOARD_PASSWORD" -Value $DashboardPassword -AvailableKeys $availableKeys
Update-StartupVariable -ServerId $serverId -Key "WHATSAPP_SWAGGER_USERNAME" -Value $DashboardUsername -AvailableKeys $availableKeys
Update-StartupVariable -ServerId $serverId -Key "WHATSAPP_SWAGGER_PASSWORD" -Value $DashboardPassword -AvailableKeys $availableKeys

if ($availableKeys -contains "CMD_RUN") {
  $cmdRun = "env WAHA_API_KEY=$WahaApiKey WAHA_DASHBOARD_USERNAME=$DashboardUsername WAHA_DASHBOARD_PASSWORD=$DashboardPassword WHATSAPP_SWAGGER_USERNAME=$DashboardUsername WHATSAPP_SWAGGER_PASSWORD=$DashboardPassword WAHA_PORT=`${SERVER_PORT} WAHA_PRINT_QR=true npx -y @devlikeapro/waha@latest"
  Update-StartupVariable -ServerId $serverId -Key "CMD_RUN" -Value $cmdRun -AvailableKeys $availableKeys
}

if ($RestartServer) {
  Write-Host "Restarting server..." -ForegroundColor Yellow
  Invoke-PteroClientApi -Method POST -Path "/api/client/servers/$serverId/power" -Body @{
    signal = "restart"
  } | Out-Null
}

Write-Host "Pterodactyl WAHA provisioning selesai." -ForegroundColor Green
