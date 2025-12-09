-- ==================== 全系统功能验证 ====================
-- 验证时间: 2025-11-24
-- 说明: 验证所有模块功能和模块间集成

SELECT '========================================' AS '';
SELECT '全系统功能验证开始' AS '验证阶段';
SELECT '========================================' AS '';
SELECT NOW() AS '开始时间';
SELECT '' AS '';

-- ==================== 1. 数据库表结构检查 ====================
SELECT '【1】数据库表结构检查' AS '';
SELECT '检查所有核心表是否存在...' AS '';

SELECT
    '表名' AS 'Table',
    '状态' AS 'Status'
UNION ALL
SELECT 'customers', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='customers'
UNION ALL
SELECT 'orders', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='orders'
UNION ALL
SELECT 'finance_records', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='finance_records'
UNION ALL
SELECT 'operation_accounts', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='operation_accounts'
UNION ALL
SELECT 'operation_daily_reports', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='operation_daily_reports'
UNION ALL
SELECT 'commissions', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='commissions'
UNION ALL
SELECT 'notifications', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='notifications'
UNION ALL
SELECT 'enterprise_knowledge', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='enterprise_knowledge'
UNION ALL
SELECT 'ai_marketing_history', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='ai_marketing_history'
UNION ALL
SELECT 'auto_follow_configs', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='auto_follow_configs';

SELECT '' AS '';

-- ==================== 2. 订单与财务打通验证 ====================
SELECT '【2】订单与财务打通验证' AS '';

-- 2.1 检查订单表数据
SELECT '2.1 订单表数据检查' AS '';
SELECT
    COUNT(*) AS '订单总数',
    SUM(CASE WHEN payment_status='已支付' THEN 1 ELSE 0 END) AS '已支付订单',
    SUM(CASE WHEN payment_status='已支付' THEN amount ELSE 0 END) AS '已支付金额'
FROM orders;

-- 2.2 检查财务记录表
SELECT '' AS '';
SELECT '2.2 财务记录表数据检查' AS '';
SELECT
    COUNT(*) AS '财务记录总数',
    SUM(CASE WHEN type='收入' THEN amount ELSE 0 END) AS '总收入',
    SUM(CASE WHEN type='支出' THEN amount ELSE 0 END) AS '总支出'
FROM finance_records;

-- 2.3 验证订单与财务记录的关联
SELECT '' AS '';
SELECT '2.3 订单与财务记录关联检查' AS '';
SELECT
    CASE
        WHEN COUNT(DISTINCT o.id) > 0
        THEN CONCAT('✓ 发现', COUNT(DISTINCT o.id), '个订单有对应的财务记录')
        ELSE '⚠️ 未发现订单与财务记录关联'
    END AS '验证结果'
FROM orders o
LEFT JOIN finance_records fr ON fr.order_id = o.id
WHERE o.payment_status = '已支付';

-- 2.4 订单金额与财务记录一致性检查
SELECT '' AS '';
SELECT '2.4 订单金额与财务记录一致性' AS '';
SELECT
    o.id AS '订单ID',
    o.order_no AS '订单号',
    o.amount AS '订单金额',
    COALESCE(fr.amount, 0) AS '财务记录金额',
    CASE
        WHEN o.amount = COALESCE(fr.amount, 0) THEN '✓ 一致'
        WHEN fr.amount IS NULL THEN '⚠️ 无财务记录'
        ELSE '✗ 不一致'
    END AS '一致性'
FROM orders o
LEFT JOIN finance_records fr ON fr.order_id = o.id
WHERE o.payment_status = '已支付'
LIMIT 5;

SELECT '' AS '';

-- ==================== 3. 运营账号管理验证 ====================
SELECT '【3】运营账号管理验证' AS '';

-- 3.1 检查运营账号表
SELECT '3.1 运营账号表数据检查' AS '';
SELECT
    COUNT(*) AS '账号总数',
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS '活跃账号数',
    COUNT(DISTINCT platform) AS '平台数量'
FROM operation_accounts;

-- 3.2 按平台统计账号
SELECT '' AS '';
SELECT '3.2 各平台账号统计' AS '';
SELECT
    platform AS '平台',
    COUNT(*) AS '账号数',
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS '活跃账号'
FROM operation_accounts
GROUP BY platform
ORDER BY COUNT(*) DESC;

-- 3.3 检查运营日报表
SELECT '' AS '';
SELECT '3.3 运营日报数据检查' AS '';
SELECT
    COUNT(*) AS '日报总数',
    COUNT(DISTINCT account_id) AS '涉及账号数',
    COUNT(DISTINCT report_date) AS '报告天数'
FROM operation_daily_reports;

-- 3.4 验证运营账号与日报的关联
SELECT '' AS '';
SELECT '3.4 运营账号与日报关联检查' AS '';
SELECT
    CASE
        WHEN COUNT(DISTINCT odr.account_id) > 0
        THEN CONCAT('✓ 发现', COUNT(DISTINCT odr.account_id), '个账号有日报数据')
        ELSE '⚠️ 未发现账号与日报关联'
    END AS '验证结果'
FROM operation_accounts oa
LEFT JOIN operation_daily_reports odr ON odr.account_id = oa.id;

SELECT '' AS '';

-- ==================== 4. 订单同步功能验证 ====================
SELECT '【4】订单同步功能验证' AS '';

-- 4.1 检查外部订单ID
SELECT '4.1 外部订单ID检查' AS '';
SELECT
    COUNT(*) AS '总订单数',
    SUM(CASE WHEN external_order_ids IS NOT NULL AND external_order_ids != '' THEN 1 ELSE 0 END) AS '有外部ID的订单',
    SUM(CASE WHEN external_order_ids IS NULL OR external_order_ids = '' THEN 1 ELSE 0 END) AS '无外部ID的订单'
FROM orders;

-- 4.2 检查订单来源
SELECT '' AS '';
SELECT '4.2 订单来源统计' AS '';
SELECT
    source AS '订单来源',
    COUNT(*) AS '订单数量',
    SUM(amount) AS '总金额'
FROM orders
GROUP BY source
ORDER BY COUNT(*) DESC;

SELECT '' AS '';

-- ==================== 5. 佣金计算功能验证 ====================
SELECT '【5】佣金计算功能验证' AS '';

-- 5.1 检查佣金记录
SELECT '5.1 佣金记录检查' AS '';
SELECT
    COUNT(*) AS '佣金记录总数',
    SUM(commission_amount) AS '总佣金金额',
    COUNT(DISTINCT sales_id) AS '涉及销售人员数'
FROM commissions;

-- 5.2 验证订单与佣金的关联
SELECT '' AS '';
SELECT '5.2 订单与佣金关联检查' AS '';
SELECT
    CASE
        WHEN COUNT(DISTINCT c.order_id) > 0
        THEN CONCAT('✓ 发现', COUNT(DISTINCT c.order_id), '个订单有佣金记录')
        ELSE '⚠️ 未发现订单与佣金关联'
    END AS '验证结果'
FROM orders o
LEFT JOIN commissions c ON c.order_id = o.id
WHERE o.payment_status = '已支付';

SELECT '' AS '';

-- ==================== 6. 通知系统验证 ====================
SELECT '【6】通知系统验证' AS '';

-- 6.1 检查通知记录
SELECT '6.1 通知记录检查' AS '';
SELECT
    COUNT(*) AS '通知总数',
    SUM(CASE WHEN is_read=1 THEN 1 ELSE 0 END) AS '已读通知',
    SUM(CASE WHEN is_read=0 THEN 1 ELSE 0 END) AS '未读通知'
FROM notifications;

-- 6.2 按类型统计通知
SELECT '' AS '';
SELECT '6.2 通知类型统计' AS '';
SELECT
    type AS '通知类型',
    COUNT(*) AS '数量',
    SUM(CASE WHEN is_read=1 THEN 1 ELSE 0 END) AS '已读'
FROM notifications
GROUP BY type
ORDER BY COUNT(*) DESC
LIMIT 5;

SELECT '' AS '';

-- ==================== 7. 企业知识库验证 ====================
SELECT '【7】企业知识库验证' AS '';

-- 7.1 检查知识库条目
SELECT '7.1 知识库条目检查' AS '';
SELECT
    COUNT(*) AS '知识库总条目',
    SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS '已发布条目',
    COUNT(DISTINCT category) AS '分类数量'
FROM enterprise_knowledge;

-- 7.2 按分类统计知识
SELECT '' AS '';
SELECT '7.2 知识库分类统计' AS '';
SELECT
    category AS '分类',
    COUNT(*) AS '条目数',
    SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS '已发布'
FROM enterprise_knowledge
GROUP BY category
ORDER BY COUNT(*) DESC
LIMIT 5;

SELECT '' AS '';

-- ==================== 8. AI营销助手验证 ====================
SELECT '【8】AI营销助手验证' AS '';

-- 8.1 检查AI营销历史
SELECT '8.1 AI营销历史记录检查' AS '';
SELECT
    COUNT(*) AS '总生成次数',
    COUNT(DISTINCT customer_id) AS '涉及客户数',
    COUNT(DISTINCT scenario) AS '场景类型数'
FROM ai_marketing_history;

-- 8.2 按场景统计
SELECT '' AS '';
SELECT '8.2 AI营销场景统计' AS '';
SELECT
    scenario AS '场景',
    COUNT(*) AS '生成次数',
    AVG(LENGTH(generated_content)) AS '平均内容长度'
FROM ai_marketing_history
GROUP BY scenario
ORDER BY COUNT(*) DESC
LIMIT 5;

SELECT '' AS '';

-- ==================== 9. 客户管理与其他模块联动 ====================
SELECT '【9】客户管理与其他模块联动验证' AS '';

-- 9.1 客户与订单关联
SELECT '9.1 客户与订单关联' AS '';
SELECT
    COUNT(DISTINCT c.id) AS '有订单的客户数',
    COUNT(DISTINCT o.id) AS '关联的订单数',
    SUM(o.amount) AS '总订单金额'
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;

-- 9.2 客户与通知关联
SELECT '' AS '';
SELECT '9.2 客户与通知关联' AS '';
SELECT
    COUNT(DISTINCT n.customer_id) AS '有通知的客户数',
    COUNT(*) AS '通知总数'
FROM notifications n
WHERE n.customer_id IS NOT NULL;

-- 9.3 客户与AI营销关联
SELECT '' AS '';
SELECT '9.3 客户与AI营销关联' AS '';
SELECT
    COUNT(DISTINCT amh.customer_id) AS '使用AI营销的客户数',
    COUNT(*) AS 'AI营销生成次数'
FROM ai_marketing_history amh
WHERE amh.customer_id IS NOT NULL;

SELECT '' AS '';

-- ==================== 10. 数据完整性验证 ====================
SELECT '【10】数据完整性验证' AS '';

-- 10.1 孤立订单检查（订单但客户不存在）
SELECT '10.1 孤立订单检查' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立订单'
        ELSE CONCAT('✗ FAIL: 发现', COUNT(*), '个孤立订单')
    END AS '验证结果'
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;

-- 10.2 孤立财务记录检查
SELECT '' AS '';
SELECT '10.2 孤立财务记录检查' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立财务记录'
        ELSE CONCAT('⚠️ 发现', COUNT(*), '条财务记录无对应订单')
    END AS '验证结果'
FROM finance_records fr
LEFT JOIN orders o ON o.id = fr.order_id
WHERE fr.order_id IS NOT NULL AND o.id IS NULL;

-- 10.3 孤立佣金记录检查
SELECT '' AS '';
SELECT '10.3 孤立佣金记录检查' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立佣金记录'
        ELSE CONCAT('⚠️ 发现', COUNT(*), '条佣金记录无对应订单')
    END AS '验证结果'
FROM commissions c
LEFT JOIN orders o ON o.id = c.order_id
WHERE c.order_id IS NOT NULL AND o.id IS NULL;

SELECT '' AS '';

-- ==================== 验证结果汇总 ====================
SELECT '========================================' AS '';
SELECT '全系统功能验证完成' AS '验证阶段';
SELECT '========================================' AS '';

SELECT
    '验证项' AS '模块',
    '状态' AS '结果'
UNION ALL
SELECT '1. 数据库表结构', '✓ 检查完成'
UNION ALL
SELECT '2. 订单与财务打通', '✓ 检查完成'
UNION ALL
SELECT '3. 运营账号管理', '✓ 检查完成'
UNION ALL
SELECT '4. 订单同步功能', '✓ 检查完成'
UNION ALL
SELECT '5. 佣金计算功能', '✓ 检查完成'
UNION ALL
SELECT '6. 通知系统', '✓ 检查完成'
UNION ALL
SELECT '7. 企业知识库', '✓ 检查完成'
UNION ALL
SELECT '8. AI营销助手', '✓ 检查完成'
UNION ALL
SELECT '9. 客户管理联动', '✓ 检查完成'
UNION ALL
SELECT '10. 数据完整性', '✓ 检查完成';

SELECT NOW() AS '完成时间';
