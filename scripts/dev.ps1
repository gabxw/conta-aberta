param([switch]$UseExistingDatabase)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$dotnetPath = (Get-Command dotnet -ErrorAction SilentlyContinue).Source
$portableSdk = Join-Path $env:USERPROFILE 'Downloads\drivepulse-tools\dotnet\dotnet.exe'
if (Test-Path -LiteralPath $portableSdk) { $dotnetPath = $portableSdk }
if (-not $dotnetPath) { throw 'Install .NET 10 SDK before starting.' }
if (-not $UseExistingDatabase) {
    docker compose up -d --wait database
    if ($LASTEXITCODE -ne 0) { throw 'Start Docker Desktop, or use -UseExistingDatabase with PostgreSQL on port 5433.' }
}
$env:ConnectionStrings__DrivePulse = 'Host=127.0.0.1;Port=5433;Database=drivepulse;Username=drivepulse;Password=drivepulse_demo_local'
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ASPNETCORE_URLS = 'http://127.0.0.1:5080'
& $dotnetPath build backend/DrivePulse.Api/DrivePulse.Api.csproj
if ($LASTEXITCODE -ne 0) { throw 'The API build failed. Check the output above.' }
$runtimeDir = Join-Path $projectRoot '.tools'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$apiDirectory = Join-Path $projectRoot 'backend\DrivePulse.Api\bin\Debug\net10.0'
$apiProcess = Start-Process -FilePath $dotnetPath -ArgumentList @('DrivePulse.Api.dll') -WorkingDirectory $apiDirectory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'api-dev.log') -RedirectStandardError (Join-Path $runtimeDir 'api-dev-error.log') -PassThru
try {
    Set-Location -LiteralPath (Join-Path $projectRoot 'frontend')
    $env:API_BASE_URL = 'http://127.0.0.1:5080/api/v1'
    npm run dev
} finally {
    if (-not $apiProcess.HasExited) { Stop-Process -Id $apiProcess.Id }
}
