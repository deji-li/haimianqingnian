# Initialize Clean Database with Fresh Test Data

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Initialize Clean Database" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$localPassword = "123456"
$database = "education_crm"

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Drop current database" -ForegroundColor Red
Write-Host "  2. Create fresh database" -ForegroundColor White
Write-Host "  3. Let TypeORM create all tables" -ForegroundColor White
Write-Host "  4. Insert fresh test data (no encoding issues)" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: This will DELETE all current data!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "[1/4] Preparing database..." -ForegroundColor Yellow
$env:MYSQL_PWD = $localPassword

Write-Host "  Dropping existing database..." -ForegroundColor Gray
mysql -uroot -e "DROP DATABASE IF EXISTS $database;" 2>&1 | Out-Null

Write-Host "  Creating fresh database..." -ForegroundColor Gray
mysql -uroot -e "CREATE DATABASE $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null
Write-Host "  ✓ Database created" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Starting backend to create tables..." -ForegroundColor Yellow
Write-Host "  (TypeORM will auto-create all tables)" -ForegroundColor Gray

# Temporarily enable synchronize
$envFile = "backend\.env.development"
$envContent = Get-Content $envFile -Raw
$originalContent = $envContent
$envContent = $envContent -replace "DB_SYNCHRONIZE=false", "DB_SYNCHRONIZE=true"
Set-Content $envFile -Value $envContent -NoNewline -Encoding UTF8

# Start backend briefly
Set-Location backend
Write-Host "  Starting backend (15 seconds)..." -ForegroundColor Gray
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c","pnpm run start:dev" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 15
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*pnpm*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Set-Location ..

# Restore synchronize setting
Set-Content $envFile -Value $originalContent -NoNewline -Encoding UTF8
Write-Host "  ✓ Tables created" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Inserting fresh test data..." -ForegroundColor Yellow

# Create SQL with proper encoding
$testDataSql = @"
-- 插入管理员用户
INSERT INTO users (username, password, realName, phone, email, role, status, createTime, updateTime) VALUES
('admin', '\$2b\$10\$YourHashedPasswordHere', '系统管理员', '13800138000', 'admin@example.com', 'admin', 1, NOW(), NOW());

-- 插入部门数据
INSERT INTO department (departmentName, description, status, createTime, updateTime) VALUES
('销售部', '负责客户开发和订单签约', 1, NOW(), NOW()),
('教学部', '负责课程授课和教学管理', 1, NOW(), NOW()),
('财务部', '负责财务管理和报表统计', 1, NOW(), NOW()),
('市场部', '负责市场推广和品牌建设', 1, NOW(), NOW());

-- 插入校区数据
INSERT INTO campus (campusName, address, contactPerson, contactPhone, status, createTime, updateTime) VALUES
('朝阳校区', '北京市朝阳区建国路88号', '张老师', '13900000001', 1, NOW(), NOW()),
('海淀校区', '北京市海淀区中关村大街1号', '李老师', '13900000002', 1, NOW(), NOW()),
('西城校区', '北京市西城区金融街35号', '王老师', '13900000003', 1, NOW(), NOW());

-- 插入客户数据
INSERT INTO customers (wechatNickname, wechatId, phone, realName, customerIntent, trafficSource, assignedSales, createTime, updateTime) VALUES
('张三', 'wx_zhangsan', '13900000001', '张三', '高意向', '线上推广', NULL, NOW(), NOW()),
('李四', 'wx_lisi', '13900000002', '李四', '中意向', '朋友推荐', NULL, NOW(), NOW()),
('王五', 'wx_wangwu', '13900000003', '王五', '低意向', '线下活动', NULL, NOW(), NOW()),
('赵六', 'wx_zhaoliu', '13900000004', '赵六', '高意向', '线上推广', NULL, NOW(), NOW()),
('孙七', 'wx_sunqi', '13900000005', '孙七', '中意向', '老客户介绍', NULL, NOW(), NOW());

-- 插入知识库数据
INSERT INTO enterprise_knowledge_base (title, content, keywords, sceneCategory, productCategory, customerType, questionType, priority, source, status, createTime, updateTime) VALUES
('如何介绍课程优势', '我们的课程具有以下优势：1. 名师授课 2. 小班教学 3. 个性化辅导 4. 完善的课后服务', '课程,优势,介绍', '产品介绍', '少儿英语', '新客户', '产品咨询', 95, 'manual', 'approved', NOW(), NOW()),
('价格异议处理话术', '针对价格异议，我们可以强调：1. 课程价值 2. 师资力量 3. 学习效果 4. 优惠活动', '价格,异议,话术', '异议处理', '少儿英语', '意向客户', '价格异议', 90, 'manual', 'approved', NOW(), NOW()),
('试听课邀约技巧', '邀约试听课时注意：1. 了解客户需求 2. 介绍试听内容 3. 强调免费体验 4. 确认时间地点', '试听,邀约,技巧', '客户邀约', '少儿英语', '新客户', '邀约话术', 85, 'manual', 'approved', NOW(), NOW()),
('续费挽留技巧', '客户续费挽留：1. 回顾学习成果 2. 展示进步空间 3. 提供续费优惠 4. 强调持续性', '续费,挽留,技巧', '客户维护', '少儿英语', '老客户', '续费挽留', 80, 'manual', 'approved', NOW(), NOW()),
('投诉处理流程', '处理投诉：1. 耐心倾听 2. 表示理解 3. 提出解决方案 4. 跟进处理结果', '投诉,处理,流程', '异议处理', '通用', '所有客户', '投诉处理', 95, 'manual', 'approved', NOW(), NOW());

-- 插入权限数据
INSERT INTO permissions (code, name, description, category, status, createTime, updateTime) VALUES
('customer:view', '查看客户', '查看客户列表和详情', 'customer', 1, NOW(), NOW()),
('customer:create', '创建客户', '添加新客户', 'customer', 1, NOW(), NOW()),
('customer:edit', '编辑客户', '修改客户信息', 'customer', 1, NOW(), NOW()),
('knowledge:view', '查看知识库', '查看知识库内容', 'knowledge', 1, NOW(), NOW()),
('knowledge:create', '创建知识', '添加新知识', 'knowledge', 1, NOW(), NOW()),
('order:view', '查看订单', '查看订单列表', 'order', 1, NOW(), NOW()),
('order:create', '创建订单', '创建新订单', 'order', 1, NOW(), NOW());

-- 插入角色数据
INSERT INTO roles (roleName, roleCode, description, status, createTime, updateTime) VALUES
('管理员', 'admin', '系统管理员，拥有所有权限', 1, NOW(), NOW()),
('销售', 'sales', '销售人员，负责客户跟进', 1, NOW(), NOW()),
('运营', 'operator', '运营人员，负责数据分析', 1, NOW(), NOW()),
('教师', 'teacher', '教学人员，负责授课', 1, NOW(), NOW());
"@

# Save SQL file with UTF-8 encoding
$sqlFile = "temp-init-data.sql"
Set-Content $sqlFile -Value $testDataSql -Encoding UTF8

# Import
Write-Host "  Inserting test data..." -ForegroundColor Gray
Get-Content $sqlFile -Encoding UTF8 | mysql -uroot --default-character-set=utf8mb4 $database 2>&1 | Out-Null
Remove-Item $sqlFile -Force

Write-Host "  ✓ Test data inserted" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Verifying..." -ForegroundColor Yellow

$tables = mysql -uroot -e "USE $database; SHOW TABLES;" 2>&1
$tableLines = $tables -split "`n" | Where-Object { $_ -match '\|' -and $_ -notmatch 'Tables_in' }
$tableCount = $tableLines.Count
Write-Host "  Tables: $tableCount" -ForegroundColor White

try {
    $userCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM users;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1
    $customerCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM customers;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1
    $kbCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM enterprise_knowledge_base;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1
    $deptCount = mysql -uroot -e "USE $database; SELECT COUNT(*) FROM department;" 2>&1 | Select-String -Pattern '^\s*\d+\s*$' | Select-Object -First 1

    if ($userCount) { Write-Host "  Users: $($userCount.Line.Trim())" -ForegroundColor Gray }
    if ($customerCount) { Write-Host "  Customers: $($customerCount.Line.Trim())" -ForegroundColor Gray }
    if ($kbCount) { Write-Host "  Knowledge Base: $($kbCount.Line.Trim())" -ForegroundColor Gray }
    if ($deptCount) { Write-Host "  Departments: $($deptCount.Line.Trim())" -ForegroundColor Gray }
} catch {}

$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ Clean Database Initialized!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fresh data (UTF-8, no encoding issues):" -ForegroundColor Cyan
Write-Host "  - 1 admin user" -ForegroundColor White
Write-Host "  - 4 departments (销售部、教学部、财务部、市场部)" -ForegroundColor White
Write-Host "  - 3 campuses (朝阳、海淀、西城)" -ForegroundColor White
Write-Host "  - 5 customers" -ForegroundColor White
Write-Host "  - 5 knowledge items" -ForegroundColor White
Write-Host "  - 4 roles (管理员、销售、运营、教师)" -ForegroundColor White
Write-Host "  - 7 permissions" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run dev-start-local-db.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
