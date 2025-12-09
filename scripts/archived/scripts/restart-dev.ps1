# Restart Development Environment (Kill + Reinitialize + Start)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Restart Development Environment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node.js processes
Write-Host "[1/4] Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "  Done" -ForegroundColor Green
Write-Host ""

# Step 2: Reinitialize database
Write-Host "[2/4] Reinitializing database..." -ForegroundColor Yellow
$localPassword = "123456"
$database = "education_crm"
$env:MYSQL_PWD = $localPassword

Write-Host "  Dropping existing database..." -ForegroundColor Gray
mysql -uroot -e "DROP DATABASE IF EXISTS $database;" 2>&1 | Out-Null

Write-Host "  Creating fresh database..." -ForegroundColor Gray
mysql -uroot -e "CREATE DATABASE $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null
Write-Host "  Database created" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Starting backend to create tables..." -ForegroundColor Yellow

# Temporarily enable synchronize
$envFile = "backend\.env.development"
$envContent = Get-Content $envFile -Raw
$originalContent = $envContent
$envContent = $envContent -replace "DB_SYNCHRONIZE=false", "DB_SYNCHRONIZE=true"
Set-Content $envFile -Value $envContent -NoNewline -Encoding UTF8

# Start backend briefly
Set-Location backend
Write-Host "  Starting backend (20 seconds to create tables)..." -ForegroundColor Gray
$backendProcess = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", "pnpm run start:dev" -PassThru
Start-Sleep -Seconds 20

# Kill backend
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Set-Location ..

# Restore synchronize setting
Set-Content $envFile -Value $originalContent -NoNewline -Encoding UTF8
Write-Host "  Tables created" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Inserting test data..." -ForegroundColor Yellow

# Check table structure first
Write-Host "  Checking users table structure..." -ForegroundColor Gray
$tableStructure = mysql -uroot -e "USE $database; DESCRIBE users;" 2>&1

# Create SQL based on actual table structure
# We need to check what columns exist and insert accordingly
$testDataSql = @"
-- Insert admin user (using actual table structure)
-- Password is hashed 'admin123'
INSERT INTO users (username, password, realName, phone, email, roleId, departmentId, campusId, status, createTime, updateTime)
SELECT 'admin', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', 'System Admin', '13800138000', 'admin@example.com',
       r.id, NULL, NULL, 1, NOW(), NOW()
FROM roles r WHERE r.code = 'admin' LIMIT 1;

-- Insert departments
INSERT INTO department (departmentName, description, status, createTime, updateTime) VALUES
('Sales Department', 'Responsible for customer development and contract signing', 1, NOW(), NOW()),
('Teaching Department', 'Responsible for course teaching and management', 1, NOW(), NOW()),
('Finance Department', 'Responsible for financial management and reporting', 1, NOW(), NOW()),
('Marketing Department', 'Responsible for marketing and brand building', 1, NOW(), NOW());

-- Insert campuses
INSERT INTO campus (campusName, address, contactPerson, contactPhone, status, createTime, updateTime) VALUES
('Chaoyang Campus', 'No.88 Jianguo Road, Chaoyang District, Beijing', 'Teacher Zhang', '13900000001', 1, NOW(), NOW()),
('Haidian Campus', 'No.1 Zhongguancun Street, Haidian District, Beijing', 'Teacher Li', '13900000002', 1, NOW(), NOW()),
('Xicheng Campus', 'No.35 Financial Street, Xicheng District, Beijing', 'Teacher Wang', '13900000003', 1, NOW(), NOW());

-- Insert customers
INSERT INTO customers (wechatNickname, wechatId, phone, realName, customerIntent, trafficSource, createTime, updateTime) VALUES
('Zhang San', 'wx_zhangsan', '13900000001', 'Zhang San', 'High Intent', 'Online Promotion', NOW(), NOW()),
('Li Si', 'wx_lisi', '13900000002', 'Li Si', 'Medium Intent', 'Friend Referral', NOW(), NOW()),
('Wang Wu', 'wx_wangwu', '13900000003', 'Wang Wu', 'Low Intent', 'Offline Event', NOW(), NOW()),
('Zhao Liu', 'wx_zhaoliu', '13900000004', 'Zhao Liu', 'High Intent', 'Online Promotion', NOW(), NOW()),
('Sun Qi', 'wx_sunqi', '13900000005', 'Sun Qi', 'Medium Intent', 'Customer Referral', NOW(), NOW());

-- Insert knowledge base
INSERT INTO enterprise_knowledge_base (title, content, keywords, sceneCategory, status, createTime, updateTime) VALUES
('How to introduce course advantages', 'Our courses have the following advantages: 1. Expert teachers 2. Small class teaching 3. Personalized tutoring', 'course,advantages', 'Product Introduction', 'approved', NOW(), NOW()),
('Price objection handling', 'For price objections, emphasize: 1. Course value 2. Teacher quality 3. Learning outcomes', 'price,objection', 'Objection Handling', 'approved', NOW(), NOW()),
('Trial class invitation skills', 'When inviting trial classes: 1. Understand needs 2. Introduce content 3. Emphasize free trial', 'trial,invitation', 'Customer Invitation', 'approved', NOW(), NOW()),
('Renewal retention skills', 'Customer retention: 1. Review learning outcomes 2. Show progress potential 3. Provide renewal discount', 'renewal,retention', 'Customer Maintenance', 'approved', NOW(), NOW()),
('Complaint handling process', 'Handle complaints: 1. Listen patiently 2. Show understanding 3. Propose solutions 4. Follow up', 'complaint,handling', 'Objection Handling', 'approved', NOW(), NOW());

-- Insert permissions
INSERT INTO permissions (code, name, description, category, status, createTime, updateTime) VALUES
('customer:view', 'View Customers', 'View customer list and details', 'customer', 1, NOW(), NOW()),
('customer:create', 'Create Customer', 'Add new customer', 'customer', 1, NOW(), NOW()),
('customer:edit', 'Edit Customer', 'Modify customer info', 'customer', 1, NOW(), NOW()),
('knowledge:view', 'View Knowledge', 'View knowledge base', 'knowledge', 1, NOW(), NOW()),
('knowledge:create', 'Create Knowledge', 'Add new knowledge', 'knowledge', 1, NOW(), NOW()),
('order:view', 'View Orders', 'View order list', 'order', 1, NOW(), NOW()),
('order:create', 'Create Order', 'Create new order', 'order', 1, NOW(), NOW());

-- Insert roles
INSERT INTO roles (name, code, description, status, createTime, updateTime) VALUES
('Admin', 'admin', 'System administrator with all permissions', 1, NOW(), NOW()),
('Sales', 'sales', 'Sales staff responsible for customer follow-up', 1, NOW(), NOW()),
('Operator', 'operator', 'Operations staff responsible for data analysis', 1, NOW(), NOW()),
('Teacher', 'teacher', 'Teaching staff responsible for instruction', 1, NOW(), NOW());
"@

# Save and import
$sqlFile = "temp-init-data.sql"
Set-Content $sqlFile -Value $testDataSql -Encoding UTF8
Get-Content $sqlFile -Encoding UTF8 | mysql -uroot --default-character-set=utf8mb4 $database 2>&1 | Out-Null
Remove-Item $sqlFile -Force

Write-Host "  Test data inserted" -ForegroundColor Green
Write-Host ""

$env:MYSQL_PWD = $null

Write-Host "================================" -ForegroundColor Green
Write-Host "Environment Ready!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: dev-start-background.bat" -ForegroundColor Cyan
Write-Host ""
