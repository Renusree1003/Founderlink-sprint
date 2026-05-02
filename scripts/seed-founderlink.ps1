param(
  [string]$GatewayUrl = "http://localhost:8080",
  [string]$DbContainer = "founderlink-postgres",
  [string]$DbName = "school",
  [string]$DbUser = "postgres"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonApi {
  param(
    [string]$Method,
    [string]$Url,
    [object]$Body = $null,
    [string]$Token = ""
  )

  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }

  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
  }
  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

function Get-OtpFromDb {
  param([string]$Email)
  $sql = "SELECT otp_code FROM users WHERE email = '$Email' ORDER BY id DESC LIMIT 1;"
  $otp = docker exec $DbContainer psql -U $DbUser -d $DbName -At -c $sql
  return ($otp | Select-Object -First 1).Trim()
}

function Get-JwtPayload {
  param([string]$Token)
  $payload = $Token.Split(".")[1]
  $payload = $payload.Replace("-", "+").Replace("_", "/")
  switch ($payload.Length % 4) {
    2 { $payload += "==" }
    3 { $payload += "=" }
  }
  $bytes = [System.Convert]::FromBase64String($payload)
  $json = [System.Text.Encoding]::UTF8.GetString($bytes)
  return $json | ConvertFrom-Json
}

Write-Host "`nSeeding FounderLink sample data..." -ForegroundColor Cyan

$users = @(
  @{ name = "Renusree";  email = "renusree.seed@founderlink.test"; password = "Password@123"; role = "FOUNDER" },
  @{ name = "Gowri";     email = "gowri.seed@founderlink.test";    password = "Password@123"; role = "INVESTOR" },
  @{ name = "Ramanaidu"; email = "ramanaidu.seed@founderlink.test"; password = "Password@123"; role = "COFOUNDER" }
)

$tokens = @{}
$ids = @{}

foreach ($u in $users) {
  Write-Host "Registering $($u.name) ($($u.role))..."
  try {
    Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/auth/register" -Body @{ email = $u.email; password = $u.password; role = $u.role } | Out-Null
  } catch {
    Write-Host "Register note: $($_.Exception.Message)"
  }

  Start-Sleep -Milliseconds 500
  $otp = Get-OtpFromDb -Email $u.email
  if (-not $otp) { throw "OTP not found for $($u.email). Is DB container '$DbContainer' running?" }

  Write-Host "Verifying OTP for $($u.name)..."
  try {
    Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/auth/verify-otp" -Body @{ email = $u.email; otp = $otp } | Out-Null
  } catch {
    Write-Host "Verify note: $($_.Exception.Message)"
  }

  Write-Host "Logging in $($u.name)..."
  $token = Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/auth/login" -Body @{ email = $u.email; password = $u.password; role = $u.role }
  $tokens[$u.name] = $token

  $payload = Get-JwtPayload -Token $token
  $ids[$u.name] = [int64]$payload.sub

  Write-Host "Creating profile for $($u.name)..."
  try {
    Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/users" -Token $token -Body @{
      username = ($u.name.ToLower() + "_seed")
      fullName = $u.name
      name = $u.name
      email = $u.email
      bio = "$($u.name) sample profile for endpoint testing."
    } | Out-Null
  } catch {
    Write-Host "Profile note: $($_.Exception.Message)"
  }
}

$founderId = $ids["Renusree"]
$investorId = $ids["Gowri"]
$cofounderId = $ids["Ramanaidu"]

Write-Host "Creating startup..."
$startup = Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/startups" -Token $tokens["Renusree"] -Body @{
  title = "PayEase FinTech"
  description = "UPI-first credit rails for MSMEs."
  domain = "FinTech"
  userId = $founderId
}
$startupId = [int64]$startup.id

Write-Host "Inviting and joining team..."
try {
  Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/teams/invite" -Token $tokens["Renusree"] -Body @{
    startupId = $startupId
    userId = $cofounderId
    role = "COFOUNDER"
  } | Out-Null
} catch { Write-Host "Invite note: $($_.Exception.Message)" }

try {
  Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/teams/join" -Token $tokens["Ramanaidu"] -Body @{
    startupId = $startupId
    userId = $cofounderId
    role = "COFOUNDER"
  } | Out-Null
} catch { Write-Host "Join note: $($_.Exception.Message)" }

Write-Host "Creating investment..."
try {
  Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/investments" -Token $tokens["Gowri"] -Body @{
    startupId = $startupId
    investorId = $investorId
    amount = 1000000
  } | Out-Null
} catch { Write-Host "Investment note: $($_.Exception.Message)" }

Write-Host "Creating conversation + messages..."
$conv = Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/messages/conversation" -Token $tokens["Renusree"] -Body @{
  user1Id = $founderId
  user2Id = $investorId
}
$convId = [int64]$conv.id

Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/messages" -Token $tokens["Renusree"] -Body @{
  conversationId = $convId
  senderId = $founderId
  content = "Hi Gowri, thanks for reviewing PayEase!"
} | Out-Null

Invoke-JsonApi -Method "POST" -Url "$GatewayUrl/messages" -Token $tokens["Gowri"] -Body @{
  conversationId = $convId
  senderId = $investorId
  content = "Great traction. Let's discuss term sheet details."
} | Out-Null

Write-Host "`nSeed complete." -ForegroundColor Green
Write-Host "User IDs: Renusree=$founderId, Gowri=$investorId, Ramanaidu=$cofounderId"
Write-Host "Startup ID: $startupId"
Write-Host "Conversation ID: $convId"
Write-Host "Password for all seed users: Password@123"
