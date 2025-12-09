$env:MYSQL_PWD = "123456"
$database = "education_crm"

Write-Host "Clearing old data..." -ForegroundColor Yellow
mysql -uroot $database -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE customers; TRUNCATE TABLE department; TRUNCATE TABLE campus; TRUNCATE TABLE enterprise_knowledge_base; TRUNCATE TABLE roles; TRUNCATE TABLE permissions; SET FOREIGN_KEY_CHECKS=1;"

Write-Host "Inserting fresh data..." -ForegroundColor Yellow
Get-Content "D:\CC\1.1\direct-insert-data.sql" -Encoding UTF8 | mysql -uroot --default-character-set=utf8mb4 $database

$env:MYSQL_PWD = $null
Write-Host "Done!" -ForegroundColor Green
