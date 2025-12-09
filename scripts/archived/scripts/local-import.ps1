# Import database from git-synced backup

$localPassword = "123456"
$database = "education_crm"
$backupFile = "education_crm_backup.sql"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Import Database from Server Backup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if backup file exists
if (-Not (Test-Path $backupFile)) {
    Write-Host "Error: Backup file not found!" -ForegroundColor Red
    Write-Host "Please follow these steps first:" -ForegroundColor Yellow
    Write-Host "1. SSH to server: ssh root@106.53.77.212" -ForegroundColor White
    Write-Host "2. Run: cd /root/crm && bash server-export.sh" -ForegroundColor White
    Write-Host "3. Commit: git add education_crm_backup.sql && git commit -m 'backup' && git push" -ForegroundColor White
    Write-Host "4. Pull locally: git pull" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "[1/3] Pulling latest from git..." -ForegroundColor Yellow
git pull origin master
Write-Host ""

Write-Host "[2/3] Recreating local database..." -ForegroundColor Yellow
$env:MYSQL_PWD = $localPassword
mysql -uroot -e "DROP DATABASE IF EXISTS $database;"
mysql -uroot -e "CREATE DATABASE $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "  Database recreated" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Importing data..." -ForegroundColor Yellow
Get-Content $backupFile -Encoding UTF8 | mysql -uroot --default-character-set=utf8mb4 $database

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Import successful!" -ForegroundColor Green
    Write-Host ""

    # Update admin password
    mysql -uroot $database -e "UPDATE users SET password = '\$2b\$10\$O5JAAV.9y0cv3StqlwF8ses.apDi2UDnl/zKW4JBi/9i32IhKXepi' WHERE username = 'admin';"

    Write-Host "================================" -ForegroundColor Green
    Write-Host "Import Complete!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All server data has been synced to local" -ForegroundColor Cyan
    Write-Host "Admin password reset to: admin123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Error: Import failed" -ForegroundColor Red
}

$env:MYSQL_PWD = $null
