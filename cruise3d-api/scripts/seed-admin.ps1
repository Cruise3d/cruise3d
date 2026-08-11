param(
	[string]$Password = "Admin@1234!",
	[string]$ConnectionString = ""
)

<#
Usage:
  # use Development appsettings and default password
  .\scripts\seed-admin.ps1

  # pass a custom password
  .\scripts\seed-admin.ps1 -Password 'MyP@ssw0rd!'

  # pass a connection string directly (overrides appsettings)
  .\scripts\seed-admin.ps1 -ConnectionString "Host=localhost;Port=5433;Database=cruise3d;Username=postgres;Password=..."
#>

Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent -ErrorAction SilentlyContinue)
# ensure running from repo root (script lives in scripts/)
Set-Location -Path ..

Write-Host "Setting ASPNETCORE_ENVIRONMENT=Development for this session..."
$env:ASPNETCORE_ENVIRONMENT = 'Development'

Write-Host "Applying EF Core migrations (dotnet ef database update)..."
try {
	dotnet ef database update --project cruise3d.API.csproj --startup-project cruise3d.API.csproj
}
catch {
	Write-Warning "dotnet ef failed. Ensure dotnet-ef is installed and available. You can install with: dotnet tool install --global dotnet-ef"
}

if (-not [string]::IsNullOrWhiteSpace($ConnectionString)) {
	Write-Host "Using provided connection string."
	$argsConn = $ConnectionString
} else {
	# prefer appsettings.Development.json
	$env = $env:ASPNETCORE_ENVIRONMENT
	$settingsPath = "appsettings.$env.json"
	if (-not (Test-Path $settingsPath)) { $settingsPath = "appsettings.json" }
	if (Test-Path $settingsPath) {
		$json = Get-Content $settingsPath -Raw | ConvertFrom-Json
		$argsConn = $json.ConnectionStrings.DefaultConnection
	}
}

if ([string]::IsNullOrWhiteSpace($argsConn)) {
	Write-Error "Connection string not found. Provide via appsettings.Development.json or pass -ConnectionString. Aborting."
	exit 2
}

Write-Host "Running AdminSeeder tool..."
dotnet run --project tools\AdminSeeder\AdminSeeder.csproj -- $Password "$argsConn"

Write-Host "Done. Verify admin by querying the users table or attempting to login via Swagger."
