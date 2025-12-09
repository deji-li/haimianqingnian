# Pull Database from Git and Import

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Git Pull & Import Database" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$localPassword = "123456"
$database = "education_crm"
$sqlFile = "temp-db-sync.sql"

Write-Host "[1/3] Pulling from Git..." -ForegroundColor Yellow
git pull origin master

if (-not (Test-Path $sqlFile)) {
    Write-Host ""
    Write-Host "Error: $sqlFile not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please push from server first:" -ForegroundColor Yellow
    Write-Host "  cd /root/crm" -ForegroundColor White
    Write-Host "  cp /root/database-backup.sql temp-db-sync.sql" -ForegroundColor White
    Write-Host "  git add temp-db-sync.sql" -ForegroundColor White
    Write-Host "  git commit -m 'temp: sync database backup'" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

$fileSize = (Get-Item $sqlFile).Length / 1KB
Write-Host "✓ Found $sqlFile ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Importing to MySQL..." -ForegroundColor Yellow
$env:MYSQL_PWD = $localPassword

Write-Host "  Dropping database..." -ForegroundColor Gray
mysql -uroot -e "DROP DATABASE IF EXISTS $database;" 2>&1 | Out-Null

Write-Host "  Creating database..." -ForegroundColor Gray
mysql -uroot -e "CREATE DATABASE $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null

Write-Host "  Importing..." -ForegroundColor Gray
Get-Content $sqlFile -Encoding UTF8 | mysql -uroot $database 2>&1 | Out-Null
Write-Host "  ✓ Imported" -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Verifying..." -ForegroundColor Yellow

$tables = mysql -uroot -e "USE $database; SHOW TABLES;" 2>&1
$tableLines = $tables -split "`n" | Where-Object { $_ -match '\|' -and $_ -notmatch 'Tables_in' }
$tableCount = $tableLines.Count
Write-Host "  Tables: $tableCount" -ForegroundColor White

try {
    $userCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM users;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1
    $customerCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM customers;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1
    $kbCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM enterprise_knowledge_base;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1

    if ($userCount) { Write-Host "  Users: $($userCount.Line.Trim())" -ForegroundColor Gray }
    if ($customerCount) { Write-Host "  Customers: $($customerCount.Line.Trim())" -ForegroundColor Gray }
    if ($kbCount) { Write-Host "  Knowledge Base: $($kbCount.Line.Trim())" -ForegroundColor Gray }
} catch {}

$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "Cleaning up temp file..." -ForegroundColor Yellow
Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ Database Synced!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Delete temp-db-sync.sql from Git!" -ForegroundColor Red
Write-Host "Run on server:" -ForegroundColor Yellow
Write-Host "  cd /root/crm" -ForegroundColor White
Write-Host "  git rm temp-db-sync.sql" -ForegroundColor White
Write-Host "  git commit -m 'chore: remove temp database file'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run dev-start-local-db.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
