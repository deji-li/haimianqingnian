# Reset Database and Insert Fresh Test Data

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Reset Database and Insert Data" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$localPassword = "123456"
$database = "education_crm"
$env:MYSQL_PWD = $localPassword

# Step 1: Truncate all tables
Write-Host "[1/3] Clearing existing data..." -ForegroundColor Yellow
Write-Host "  Disabling foreign key checks..." -ForegroundColor Gray

$truncateSql = @"
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE permissions;
TRUNCATE TABLE department;
TRUNCATE TABLE campus;
TRUNCATE TABLE customers;
TRUNCATE TABLE enterprise_knowledge_base;
TRUNCATE TABLE dictionary;
SET FOREIGN_KEY_CHECKS = 1;
"@

$truncateSql | mysql -uroot --default-character-set=utf8mb4 $database 2>&1 | Out-Null
Write-Host "  All tables cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Insert all data in one transaction
Write-Host "[2/3] Inserting fresh test data..." -ForegroundColor Yellow

$insertSql = @"
-- Insert roles
INSERT INTO roles (name, code, description, status, createTime, updateTime) VALUES
('管理员', 'admin', '系统管理员，拥有所有权限', 1, NOW(), NOW()),
('销售', 'sales', '销售人员，负责客户跟进', 1, NOW(), NOW()),
('运营', 'operator', '运营人员，负责数据分析', 1, NOW(), NOW()),
('教师', 'teacher', '教学人员，负责授课', 1, NOW(), NOW());

-- Insert permissions
INSERT INTO permissions (code, name, description, category, status, createTime, updateTime) VALUES
('customer:view', '查看客户', '查看客户列表和详情', 'customer', 1, NOW(), NOW()),
('customer:create', '创建客户', '添加新客户', 'customer', 1, NOW(), NOW()),
('customer:edit', '编辑客户', '修改客户信息', 'customer', 1, NOW(), NOW()),
('customer:delete', '删除客户', '删除客户信息', 'customer', 1, NOW(), NOW()),
('knowledge:view', '查看知识库', '查看知识库内容', 'knowledge', 1, NOW(), NOW()),
('knowledge:create', '创建知识', '添加新知识', 'knowledge', 1, NOW(), NOW()),
('order:view', '查看订单', '查看订单列表', 'order', 1, NOW(), NOW()),
('order:create', '创建订单', '创建新订单', 'order', 1, NOW(), NOW());

-- Insert departments
INSERT INTO department (departmentName, description, status, createTime, updateTime) VALUES
('销售部', '负责客户开发和订单签约', 1, NOW(), NOW()),
('教学部', '负责课程授课和教学管理', 1, NOW(), NOW()),
('财务部', '负责财务管理和报表统计', 1, NOW(), NOW()),
('市场部', '负责市场推广和品牌建设', 1, NOW(), NOW());

-- Insert campuses
INSERT INTO campus (campusName, address, contactPerson, contactPhone, status, createTime, updateTime) VALUES
('朝阳校区', '北京市朝阳区建国路88号', '张老师', '13900000001', 1, NOW(), NOW()),
('海淀校区', '北京市海淀区中关村大街1号', '李老师', '13900000002', 1, NOW(), NOW()),
('西城校区', '北京市西城区金融街35号', '王老师', '13900000003', 1, NOW(), NOW());

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, realName, phone, email, roleId, status, createTime, updateTime)
VALUES ('admin', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '系统管理员', '13800138000', 'admin@example.com', 1, 1, NOW(), NOW());

-- Insert sales users
INSERT INTO users (username, password, realName, phone, email, roleId, departmentId, status, createTime, updateTime) VALUES
('sales001', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '张三', '13900001001', 'zhangsan@example.com', 2, 1, 1, NOW(), NOW()),
('sales002', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '李四', '13900001002', 'lisi@example.com', 2, 1, 1, NOW(), NOW());

-- Insert customers
INSERT INTO customers (wechatNickname, wechatId, phone, realName, customerIntent, trafficSource, createTime, updateTime) VALUES
('张三', 'wx_zhangsan', '13900000001', '张三', '高意向', '线上推广', NOW(), NOW()),
('李四', 'wx_lisi', '13900000002', '李四', '中意向', '朋友推荐', NOW(), NOW()),
('王五', 'wx_wangwu', '13900000003', '王五', '低意向', '线下活动', NOW(), NOW()),
('赵六', 'wx_zhaoliu', '13900000004', '赵六', '高意向', '线上推广', NOW(), NOW()),
('孙七', 'wx_sunqi', '13900000005', '孙七', '中意向', '老客户介绍', NOW(), NOW()),
('周八', 'wx_zhouba', '13900000006', '周八', '高意向', 'SEO搜索', NOW(), NOW()),
('吴九', 'wx_wujiu', '13900000007', '吴九', '中意向', '抖音推广', NOW(), NOW()),
('郑十', 'wx_zhengshi', '13900000008', '郑十', '低意向', '线下活动', NOW(), NOW());

-- Insert knowledge base
INSERT INTO enterprise_knowledge_base (title, content, keywords, sceneCategory, status, createTime, updateTime) VALUES
('如何介绍课程优势', '我们的课程具有以下优势：1. 名师授课 - 所有教师均有5年以上教学经验 2. 小班教学 - 每班不超过15人，确保教学质量 3. 个性化辅导 - 根据学生特点定制学习方案 4. 完善的课后服务 - 24小时在线答疑', '课程,优势,介绍', '产品介绍', 'approved', NOW(), NOW()),
('价格异议处理话术', '针对价格异议，我们可以这样回应：1. 强调课程价值 - 投资教育就是投资未来 2. 师资力量 - 名师团队，教学质量有保障 3. 学习效果 - 95%的学员都取得了显著进步 4. 优惠活动 - 现在报名可享受早鸟优惠', '价格,异议,话术', '异议处理', 'approved', NOW(), NOW()),
('试听课邀约技巧', '邀约试听课的黄金话术：1. 了解客户需求 2. 介绍试听内容 3. 强调免费体验 4. 确认时间地点', '试听,邀约,技巧', '客户邀约', 'approved', NOW(), NOW()),
('续费挽留技巧', '客户续费挽留策略：1. 回顾学习成果 2. 展示进步空间 3. 提供续费优惠 4. 强调持续性', '续费,挽留,技巧', '客户维护', 'approved', NOW(), NOW()),
('投诉处理流程', '处理客户投诉的标准流程：1. 耐心倾听 - 让客户充分表达不满 2. 表示理解 3. 提出解决方案 4. 跟进处理结果', '投诉,处理,流程', '异议处理', 'approved', NOW(), NOW()),
('新客户首次沟通技巧', '首次沟通要点：1. 自我介绍 - 专业、亲和 2. 了解需求 - 开放式提问 3. 建立信任 - 分享成功案例 4. 引导下一步 - 邀约试听或到访', '新客户,沟通,技巧', '客户开发', 'approved', NOW(), NOW()),
('老客户维护话术', '老客户维护要点：1. 定期回访 - 关心学习进度 2. 生日祝福 - 增强情感连接 3. 优惠活动 - 优先通知老客户 4. 推荐奖励 - 介绍新客户有礼', '老客户,维护,话术', '客户维护', 'approved', NOW(), NOW());

-- Insert dictionary data
INSERT INTO dictionary (type, code, label, value, sort, status, remark, createTime, updateTime) VALUES
('customer_intent', 'high', '高意向', '高意向', 1, 1, '客户意向度：高', NOW(), NOW()),
('customer_intent', 'medium', '中意向', '中意向', 2, 1, '客户意向度：中', NOW(), NOW()),
('customer_intent', 'low', '低意向', '低意向', 3, 1, '客户意向度：低', NOW(), NOW()),
('traffic_source', 'online', '线上推广', '线上推广', 1, 1, '流量来源：线上推广', NOW(), NOW()),
('traffic_source', 'offline', '线下活动', '线下活动', 2, 1, '流量来源：线下活动', NOW(), NOW()),
('traffic_source', 'referral', '朋友推荐', '朋友推荐', 3, 1, '流量来源：朋友推荐', NOW(), NOW()),
('traffic_source', 'old_customer', '老客户介绍', '老客户介绍', 4, 1, '流量来源：老客户介绍', NOW(), NOW()),
('traffic_source', 'seo', 'SEO搜索', 'SEO搜索', 5, 1, '流量来源：SEO搜索', NOW(), NOW()),
('traffic_source', 'douyin', '抖音推广', '抖音推广', 6, 1, '流量来源：抖音推广', NOW(), NOW());
"@

# Save to temp file and import
$sqlFile = "temp-reset-data.sql"
$insertSql | Out-File -FilePath $sqlFile -Encoding UTF8
Get-Content $sqlFile -Encoding UTF8 | mysql -uroot --default-character-set=utf8mb4 $database 2>&1
Remove-Item $sqlFile -Force

Write-Host "  Data inserted" -ForegroundColor Green
Write-Host ""

# Step 3: Verify
Write-Host "[3/3] Verifying data..." -ForegroundColor Yellow
$userCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM users;" 2>&1 | Select-Object -First 1
$roleCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM roles;" 2>&1 | Select-Object -First 1
$customerCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM customers;" 2>&1 | Select-Object -First 1
$kbCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM enterprise_knowledge_base;" 2>&1 | Select-Object -First 1
$deptCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM department;" 2>&1 | Select-Object -First 1
$campusCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM campus;" 2>&1 | Select-Object -First 1
$dictCount = mysql -uroot -N -e "USE $database; SELECT COUNT(*) FROM dictionary;" 2>&1 | Select-Object -First 1

Write-Host "  Users: $userCount" -ForegroundColor White
Write-Host "  Roles: $roleCount" -ForegroundColor White
Write-Host "  Customers: $customerCount" -ForegroundColor White
Write-Host "  Knowledge Base: $kbCount" -ForegroundColor White
Write-Host "  Departments: $deptCount" -ForegroundColor White
Write-Host "  Campuses: $campusCount" -ForegroundColor White
Write-Host "  Dictionary: $dictCount" -ForegroundColor White

$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Database Reset Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Login with:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Refresh your browser to see the data!" -ForegroundColor Yellow
Write-Host ""
