# Reset Local Database with Fresh Data

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Reset Local Database" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$localPassword = "123456"
$database = "education_crm"

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Drop current local database" -ForegroundColor Red
Write-Host "  2. Create fresh database" -ForegroundColor White
Write-Host "  3. Import all initialization scripts" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: This will DELETE all current local data!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "[1/3] Preparing database..." -ForegroundColor Yellow
$env:MYSQL_PWD = $localPassword

Write-Host "  Dropping existing database..." -ForegroundColor Gray
mysql -uroot -e "DROP DATABASE IF EXISTS $database;" 2>&1 | Out-Null

Write-Host "  Creating fresh database..." -ForegroundColor Gray
mysql -uroot -e "CREATE DATABASE $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null
Write-Host "  ✓ Database created" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Starting backend to create tables..." -ForegroundColor Yellow
Write-Host "  (TypeORM will auto-create all tables)" -ForegroundColor Gray
Write-Host ""

# Temporarily enable synchronize
$envFile = "backend\.env.development"
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace "DB_SYNCHRONIZE=false", "DB_SYNCHRONIZE=true"
Set-Content $envFile -Value $envContent -NoNewline

# Start backend briefly
Set-Location backend
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c","pnpm run start:dev" -PassThru -WindowStyle Hidden
Write-Host "  Waiting for tables to be created (15 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 15
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Set-Location ..

# Disable synchronize
$envContent = $envContent -replace "DB_SYNCHRONIZE=true", "DB_SYNCHRONIZE=false"
Set-Content $envFile -Value $envContent -NoNewline

Write-Host "  ✓ Tables created" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Importing sample data..." -ForegroundColor Yellow

# Import data files
$scripts = @(
    @{Name="Admin User"; File="backend\init-admin.sql"},
    @{Name="Permissions"; File="backend\init-permissions.sql"}
)

foreach ($script in $scripts) {
    if (Test-Path $script.File) {
        Write-Host "  Importing $($script.Name)..." -ForegroundColor Gray
        Get-Content $script.File -Encoding UTF8 | mysql -uroot $database 2>&1 | Out-Null
    }
}

Write-Host "  ✓ Sample data imported" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Verifying..." -ForegroundColor Yellow
$tables = mysql -uroot -e "USE $database; SHOW TABLES;" 2>&1
$tableLines = $tables -split "`n" | Where-Object { $_ -match '\|' -and $_ -notmatch 'Tables_in' }
$tableCount = $tableLines.Count
Write-Host "  Tables: $tableCount" -ForegroundColor White

$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ Database Reset Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Default login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run dev-start-local-db.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
