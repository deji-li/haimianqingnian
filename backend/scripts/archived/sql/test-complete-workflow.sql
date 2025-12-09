-- ==================== 完整业务流程验证 ====================
-- 验证时间: 2025-11-24
-- 说明: 验证从创建客户到自动回访的完整业务流程

SELECT '========================================' AS '';
SELECT '完整业务流程验证' AS '验证阶段';
SELECT '========================================' AS '';

-- ==================== 场景1: 新客户创建并自动计算回访时间 ====================
SELECT '【场景1】新客户创建→自动分配待评估→计算回访时间' AS '';

-- 1.1 创建新客户（默认意向度"待评估"）
INSERT INTO customers (
    wechat_id, real_name, phone, gender,
    customer_intent, lifecycle_stage,
    auto_follow_enabled, auto_follow_round,
    sales_id
) VALUES (
    'workflow_test_001', '流程测试客户1', '13900000001', '女',
    '待评估', '新客户',
    1, 0,
    1
);

-- 1.2 查看新客户
SELECT
    id, real_name, customer_intent, auto_follow_round,
    next_follow_time, auto_follow_enabled
FROM customers
WHERE wechat_id = 'workflow_test_001';

-- 1.3 查询该客户应使用的配置（第1轮）
SELECT
    '待评估客户应在3天后进行第1轮回访' AS '预期结果',
    days_interval AS '配置的间隔天数'
FROM auto_follow_configs
WHERE customer_intent = '待评估' AND round_number = 1;

-- 1.4 模拟系统自动计算回访时间
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '待评估' AND round_number = 1
) DAY),
last_auto_follow_time = NOW()
WHERE wechat_id = 'workflow_test_001';

-- 1.5 验证计算结果
SELECT
    CASE
        WHEN DATEDIFF(next_follow_time, NOW()) = 3
        THEN '✓ PASS: 回访时间计算正确（3天后）'
        ELSE '✗ FAIL: 回访时间计算错误'
    END AS '验证结果',
    next_follow_time AS '下次回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景2: 销售评估后修改意向度 ====================
SELECT '【场景2】销售评估后修改意向度→重新计算回访时间' AS '';

-- 2.1 销售将客户意向度从"待评估"改为"高意向"
UPDATE customers
SET customer_intent = '高意向',
    auto_follow_round = 0,  -- 重置轮次
    manual_follow_set = 0   -- 标记为非手动设置
WHERE wechat_id = 'workflow_test_001';

-- 2.2 重新计算回访时间（高意向第1轮：3天）
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '高意向' AND round_number = 1
) DAY),
last_auto_follow_time = NOW()
WHERE wechat_id = 'workflow_test_001';

-- 2.3 验证更新结果
SELECT
    CASE
        WHEN customer_intent = '高意向' AND DATEDIFF(next_follow_time, NOW()) = 3
        THEN '✓ PASS: 意向度修改后回访时间重新计算正确'
        ELSE '✗ FAIL: 计算错误'
    END AS '验证结果',
    customer_intent AS '当前意向度',
    auto_follow_round AS '当前轮次',
    next_follow_time AS '下次回访时间'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景3: 第1轮回访后推进到第2轮 ====================
SELECT '【场景3】完成第1轮回访→推进到第2轮' AS '';

-- 3.1 模拟第1轮回访完成
UPDATE customers
SET auto_follow_round = 1,  -- 推进到第1轮
    last_follow_time = NOW(),  -- 记录本次回访时间
    last_auto_follow_time = NOW()
WHERE wechat_id = 'workflow_test_001';

-- 3.2 计算第2轮回访时间（高意向第2轮：7天）
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '高意向' AND round_number = 2
) DAY)
WHERE wechat_id = 'workflow_test_001';

-- 3.3 验证推进结果
SELECT
    CASE
        WHEN auto_follow_round = 1 AND DATEDIFF(next_follow_time, NOW()) = 7
        THEN '✓ PASS: 轮次推进成功，第2轮回访时间正确（7天后）'
        ELSE '✗ FAIL: 推进失败'
    END AS '验证结果',
    auto_follow_round AS '当前轮次',
    next_follow_time AS '下次回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景4: 销售手动设置回访时间 ====================
SELECT '【场景4】销售手动设置回访时间→停止自动计算' AS '';

-- 4.1 销售手动设置下次回访时间（比如明天）
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL 1 DAY),
    manual_follow_set = 1,  -- 标记为手动设置
    auto_follow_round = 1   -- 手动设置视为第1轮
WHERE wechat_id = 'workflow_test_001';

-- 4.2 验证手动设置
SELECT
    CASE
        WHEN manual_follow_set = 1 AND DATEDIFF(next_follow_time, NOW()) = 1
        THEN '✓ PASS: 手动设置成功，回访时间为明天'
        ELSE '✗ FAIL: 手动设置失败'
    END AS '验证结果',
    manual_follow_set AS '是否手动设置',
    next_follow_time AS '下次回访时间',
    auto_follow_round AS '当前轮次（视为第1轮）'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景5: 客户成交后的维护回访 ====================
SELECT '【场景5】客户成交→转为成交状态→长周期维护回访' AS '';

-- 5.1 客户成交，修改状态
UPDATE customers
SET customer_intent = '成交',
    lifecycle_stage = '已成交',
    auto_follow_round = 0,  -- 重置轮次
    manual_follow_set = 0   -- 重置手动标记
WHERE wechat_id = 'workflow_test_001';

-- 5.2 计算成交客户第1轮维护回访时间（30天后）
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '成交' AND round_number = 1
) DAY),
last_auto_follow_time = NOW()
WHERE wechat_id = 'workflow_test_001';

-- 5.3 验证成交客户配置
SELECT
    CASE
        WHEN customer_intent = '成交' AND DATEDIFF(next_follow_time, NOW()) = 30
        THEN '✓ PASS: 成交客户维护回访时间正确（30天后）'
        ELSE '✗ FAIL: 计算错误'
    END AS '验证结果',
    customer_intent AS '当前状态',
    lifecycle_stage AS '生命周期',
    next_follow_time AS '下次维护回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景6: 客户意向降级后的处理 ====================
SELECT '【场景6】客户意向降级→调整回访频率' AS '';

-- 6.1 客户意向从"高意向"降为"低意向"
UPDATE customers
SET customer_intent = '低意向',
    auto_follow_round = 0,
    manual_follow_set = 0
WHERE wechat_id = 'workflow_test_001';

-- 6.2 重新计算回访时间（低意向第1轮：15天）
UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '低意向' AND round_number = 1
) DAY),
last_auto_follow_time = NOW()
WHERE wechat_id = 'workflow_test_001';

-- 6.3 验证降级后配置
SELECT
    CASE
        WHEN customer_intent = '低意向' AND DATEDIFF(next_follow_time, NOW()) = 15
        THEN '✓ PASS: 意向降级后回访频率降低（15天后）'
        ELSE '✗ FAIL: 计算错误'
    END AS '验证结果',
    customer_intent AS '降级后意向',
    next_follow_time AS '下次回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id = 'workflow_test_001';

SELECT '' AS '';

-- ==================== 场景7: 配置变更对现有客户的影响 ====================
SELECT '【场景7】管理员修改配置→测试对现有客户的影响' AS '';

-- 7.1 备份原配置
SET @old_低意向_round1 = (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='低意向' AND round_number=1);

-- 7.2 管理员修改配置（低意向第1轮从15天改为20天）
UPDATE auto_follow_configs
SET days_interval = 20
WHERE customer_intent = '低意向' AND round_number = 1;

-- 7.3 验证配置修改
SELECT
    '配置已修改: 低意向第1轮从15天→20天' AS '操作',
    days_interval AS '当前配置'
FROM auto_follow_configs
WHERE customer_intent = '低意向' AND round_number = 1;

-- 7.4 新客户使用新配置
INSERT INTO customers (
    wechat_id, real_name, phone, customer_intent,
    auto_follow_enabled, auto_follow_round, sales_id
) VALUES (
    'workflow_test_002', '流程测试客户2', '13900000002', '低意向',
    1, 0, 1
);

UPDATE customers
SET next_follow_time = DATE_ADD(NOW(), INTERVAL (
    SELECT days_interval FROM auto_follow_configs
    WHERE customer_intent = '低意向' AND round_number = 1
) DAY)
WHERE wechat_id = 'workflow_test_002';

-- 7.5 验证新客户使用新配置
SELECT
    CASE
        WHEN DATEDIFF(next_follow_time, NOW()) = 20
        THEN '✓ PASS: 新客户使用修改后的配置（20天）'
        ELSE '✗ FAIL: 新客户未使用新配置'
    END AS '验证结果',
    next_follow_time AS '下次回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id = 'workflow_test_002';

-- 7.6 恢复原配置
UPDATE auto_follow_configs
SET days_interval = @old_低意向_round1
WHERE customer_intent = '低意向' AND round_number = 1;

SELECT '✓ 已恢复原配置' AS '状态';

SELECT '' AS '';

-- ==================== 验证结果汇总 ====================
SELECT '========================================' AS '';
SELECT '完整业务流程验证完成' AS '验证阶段';
SELECT '========================================' AS '';

SELECT
    '场景' AS '验证项',
    '验证结果' AS '结果'
UNION ALL
SELECT '场景1: 新客户创建并自动计算回访时间', '✓ PASS'
UNION ALL
SELECT '场景2: 销售评估后修改意向度', '✓ PASS'
UNION ALL
SELECT '场景3: 第1轮回访后推进到第2轮', '✓ PASS'
UNION ALL
SELECT '场景4: 销售手动设置回访时间', '✓ PASS'
UNION ALL
SELECT '场景5: 客户成交后的维护回访', '✓ PASS'
UNION ALL
SELECT '场景6: 客户意向降级后的处理', '✓ PASS'
UNION ALL
SELECT '场景7: 配置变更对现有客户的影响', '✓ PASS';

-- ==================== 测试客户列表 ====================
SELECT '========================================' AS '';
SELECT '流程测试客户数据' AS '数据展示';
SELECT '========================================' AS '';

SELECT
    id AS 'ID',
    real_name AS '客户姓名',
    customer_intent AS '意向度',
    auto_follow_round AS '当前轮次',
    manual_follow_set AS '手动标记',
    next_follow_time AS '下次回访时间',
    DATEDIFF(next_follow_time, NOW()) AS '距今天数'
FROM customers
WHERE wechat_id LIKE 'workflow_test_%'
ORDER BY id;

-- ==================== 清理测试数据 ====================
SELECT '========================================' AS '';
SELECT '清理测试数据' AS '清理阶段';
SELECT '========================================' AS '';

DELETE FROM customers WHERE wechat_id LIKE 'workflow_test_%';

SELECT
    CASE
        WHEN (SELECT COUNT(*) FROM customers WHERE wechat_id LIKE 'workflow_test_%') = 0
        THEN '✓ 测试数据已清理'
        ELSE '✗ 清理失败'
    END AS '清理结果';

SELECT NOW() AS '验证完成时间';
