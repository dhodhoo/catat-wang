param(
  [int]$ApiKeyBytes = 32,
  [int]$WebhookSecretBytes = 48,
  [int]$DashboardPasswordBytes = 24
)

$ErrorActionPreference = "Stop"

function New-UrlSafeSecret {
  param([int]$Bytes)
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
  $raw = [Convert]::ToBase64String($buffer)
  return ($raw.TrimEnd('=') -replace '\+', '-' -replace '/', '_')
}

$wahaApiKey = "waha_{0}" -f (New-UrlSafeSecret -Bytes $ApiKeyBytes)
$wahaWebhookSecret = "waha_hook_{0}" -f (New-UrlSafeSecret -Bytes $WebhookSecretBytes)
$dashboardPassword = New-UrlSafeSecret -Bytes $DashboardPasswordBytes

Write-Host "Generated secrets:" -ForegroundColor Cyan
Write-Host "WAHA_API_KEY=$wahaApiKey"
Write-Host "WAHA_WEBHOOK_SECRET=$wahaWebhookSecret"
Write-Host "WAHA_DASHBOARD_USERNAME=admin"
Write-Host "WAHA_DASHBOARD_PASSWORD=$dashboardPassword"
Write-Host "WHATSAPP_SWAGGER_USERNAME=admin"
Write-Host "WHATSAPP_SWAGGER_PASSWORD=$dashboardPassword"
