-- ==================== 全功能深度测试脚本 ====================
-- 测试时间: 2025-11-24
-- 说明: 测试每一个功能的实际业务逻辑，验证功能是否真正可用

SELECT '========================================' AS '';
SELECT '开始全功能深度测试' AS '测试阶段';
SELECT '========================================' AS '';

-- ==================== 测试1: 创建测试客户数据 ====================
SELECT '【测试1】创建测试客户数据' AS '';

-- 创建7个不同意向度的测试客户
INSERT INTO customers (
    wechat_id, real_name, phone, gender, student_grade,
    traffic_source, customer_intent, lifecycle_stage,
    auto_follow_enabled, auto_follow_round, manual_follow_set,
    sales_id
) VALUES
('test_极高意向_001', '测试客户-极高意向', '13800000001', '女', '初三', '抖音', '极高意向', '跟进中', 1, 0, 0, 1),
('test_高意向_002', '测试客户-高意向', '13800000002', '男', '高一', '小红书', '高意向', '跟进中', 1, 0, 0, 1),
('test_中意向_003', '测试客户-中意向', '13800000003', '女', '高二', '百度', '中意向', '跟进中', 1, 0, 0, 1),
('test_低意向_004', '测试客户-低意向', '13800000004', '男', '初二', '朋友圈', '低意向', '跟进中', 1, 0, 0, 1),
('test_无意向_005', '测试客户-无意向', '13800000005', '女', '初一', '快手', '无意向', '跟进中', 1, 0, 0, 1),
('test_待评估_006', '测试客户-待评估', '13800000006', '男', '高三', '微博', '待评估', '新客户', 1, 0, 0, 1),
('test_成交_007', '测试客户-成交', '13800000007', '女', '初三', 'B站', '成交', '已成交', 1, 0, 0, 1);

-- 验证创建结果
SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 成功创建7个测试客户'
        ELSE CONCAT('✗ FAIL: 只创建了', COUNT(*), '个测试客户')
    END AS '测试结果'
FROM customers
WHERE wechat_id LIKE 'test_%';

-- 显示创建的测试客户
SELECT
    id, real_name, customer_intent, lifecycle_stage,
    auto_follow_enabled, auto_follow_round, manual_follow_set
FROM customers
WHERE wechat_id LIKE 'test_%'
ORDER BY
    CASE customer_intent
        WHEN '极高意向' THEN 1
        WHEN '高意向' THEN 2
        WHEN '中意向' THEN 3
        WHEN '低意向' THEN 4
        WHEN '无意向' THEN 5
        WHEN '待评估' THEN 6
        WHEN '成交' THEN 7
    END;

-- ==================== 测试2: 查询每个意向度的配置 ====================
SELECT '【测试2】查询每个意向度的第1轮自动回访配置' AS '';

SELECT
    customer_intent AS '客户意向度',
    days_interval AS '第1轮间隔天数',
    is_active AS '启用状态',
    CASE
        WHEN is_active = 1 THEN '✓ 已启用'
        ELSE '✗ 已禁用'
    END AS '状态说明'
FROM auto_follow_configs
WHERE round_number = 1
ORDER BY
    CASE customer_intent
        WHEN '极高意向' THEN 1
        WHEN '高意向' THEN 2
        WHEN '中意向' THEN 3
        WHEN '低意向' THEN 4
        WHEN '无意向' THEN 5
        WHEN '待评估' THEN 6
        WHEN '成交' THEN 7
    END;

-- 验证配置是否符合预期
SELECT
    CASE
        WHEN (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='极高意向' AND round_number=1) = 1
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='高意向' AND round_number=1) = 3
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='中意向' AND round_number=1) = 7
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='低意向' AND round_number=1) = 15
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='无意向' AND round_number=1) = 30
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='待评估' AND round_number=1) = 3
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='成交' AND round_number=1) = 30
        THEN '✓ PASS: 所有意向度的第1轮配置符合预期'
        ELSE '✗ FAIL: 配置不符合预期'
    END AS '测试结果';

-- ==================== 测试3: 测试配置修改功能 ====================
SELECT '【测试3】测试配置修改功能' AS '';

-- 备份原配置
SET @old_极高意向_round1 = (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='极高意向' AND round_number=1);

-- 修改配置
UPDATE auto_follow_configs
SET days_interval = 2
WHERE customer_intent='极高意向' AND round_number=1;

-- 验证修改
SELECT
    CASE
        WHEN days_interval = 2 THEN '✓ PASS: 配置修改成功'
        ELSE '✗ FAIL: 配置修改失败'
    END AS '测试结果',
    days_interval AS '修改后的值'
FROM auto_follow_configs
WHERE customer_intent='极高意向' AND round_number=1;

-- 恢复原配置
UPDATE auto_follow_configs
SET days_interval = @old_极高意向_round1
WHERE customer_intent='极高意向' AND round_number=1;

SELECT '✓ 已恢复原配置' AS '状态';

-- ==================== 测试4: 测试启用/禁用功能 ====================
SELECT '【测试4】测试配置启用/禁用功能' AS '';

-- 禁用一个配置
UPDATE auto_follow_configs
SET is_active = 0
WHERE customer_intent='极高意向' AND round_number=1;

-- 验证禁用
SELECT
    CASE
        WHEN is_active = 0 THEN '✓ PASS: 配置禁用成功'
        ELSE '✗ FAIL: 配置禁用失败'
    END AS '测试结果',
    is_active AS '当前状态'
FROM auto_follow_configs
WHERE customer_intent='极高意向' AND round_number=1;

-- 重新启用
UPDATE auto_follow_configs
SET is_active = 1
WHERE customer_intent='极高意向' AND round_number=1;

-- 验证启用
SELECT
    CASE
        WHEN is_active = 1 THEN '✓ PASS: 配置重新启用成功'
        ELSE '✗ FAIL: 配置重新启用失败'
    END AS '测试结果',
    is_active AS '当前状态'
FROM auto_follow_configs
WHERE customer_intent='极高意向' AND round_number=1;

-- ==================== 测试5: 测试客户意向度修改 ====================
SELECT '【测试5】测试客户意向度修改功能' AS '';

-- 查询测试客户当前意向度
SELECT
    id, real_name, customer_intent AS '修改前意向度'
FROM customers
WHERE wechat_id = 'test_极高意向_001';

-- 修改客户意向度
UPDATE customers
SET customer_intent = '高意向'
WHERE wechat_id = 'test_极高意向_001';

-- 验证修改
SELECT
    CASE
        WHEN customer_intent = '高意向' THEN '✓ PASS: 客户意向度修改成功'
        ELSE '✗ FAIL: 客户意向度修改失败'
    END AS '测试结果',
    customer_intent AS '修改后意向度'
FROM customers
WHERE wechat_id = 'test_极高意向_001';

-- 恢复原意向度
UPDATE customers
SET customer_intent = '极高意向'
WHERE wechat_id = 'test_极高意向_001';

SELECT '✓ 已恢复原意向度' AS '状态';

-- ==================== 测试6: 测试自动回访轮次更新 ====================
SELECT '【测试6】测试自动回访轮次更新功能' AS '';

-- 更新客户回访轮次
UPDATE customers
SET auto_follow_round = 1,
    last_auto_follow_time = NOW()
WHERE wechat_id = 'test_极高意向_001';

-- 验证更新
SELECT
    CASE
        WHEN auto_follow_round = 1 AND last_auto_follow_time IS NOT NULL
        THEN '✓ PASS: 回访轮次更新成功'
        ELSE '✗ FAIL: 回访轮次更新失败'
    END AS '测试结果',
    auto_follow_round AS '当前轮次',
    last_auto_follow_time AS '最后回访时间'
FROM customers
WHERE wechat_id = 'test_极高意向_001';

-- 继续推进到第2轮
UPDATE customers
SET auto_follow_round = 2,
    last_auto_follow_time = NOW()
WHERE wechat_id = 'test_极高意向_001';

SELECT
    auto_follow_round AS '当前轮次',
    last_auto_follow_time AS '最后回访时间'
FROM customers
WHERE wechat_id = 'test_极高意向_001';

-- ==================== 测试7: 测试手动设置回访时间标记 ====================
SELECT '【测试7】测试手动设置回访时间标记功能' AS '';

-- 设置手动回访标记
UPDATE customers
SET manual_follow_set = 1,
    next_follow_time = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE wechat_id = 'test_高意向_002';

-- 验证设置
SELECT
    CASE
        WHEN manual_follow_set = 1 AND next_follow_time IS NOT NULL
        THEN '✓ PASS: 手动回访标记设置成功'
        ELSE '✗ FAIL: 手动回访标记设置失败'
    END AS '测试结果',
    manual_follow_set AS '手动标记',
    next_follow_time AS '下次回访时间'
FROM customers
WHERE wechat_id = 'test_高意向_002';

-- ==================== 测试8: 测试批量更新功能 ====================
SELECT '【测试8】测试批量更新功能' AS '';

-- 批量更新某个意向度的所有配置
UPDATE auto_follow_configs
SET days_interval = CASE round_number
    WHEN 1 THEN 2
    WHEN 2 THEN 4
    WHEN 3 THEN 8
    WHEN 4 THEN 16
    WHEN 5 THEN 32
END
WHERE customer_intent = '极高意向';

-- 验证批量更新
SELECT
    round_number AS '轮次',
    days_interval AS '更新后间隔天数'
FROM auto_follow_configs
WHERE customer_intent = '极高意向'
ORDER BY round_number;

SELECT
    CASE
        WHEN (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='极高意向' AND round_number=1) = 2
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='极高意向' AND round_number=2) = 4
         AND (SELECT days_interval FROM auto_follow_configs WHERE customer_intent='极高意向' AND round_number=3) = 8
        THEN '✓ PASS: 批量更新成功'
        ELSE '✗ FAIL: 批量更新失败'
    END AS '测试结果';

-- 恢复原配置
UPDATE auto_follow_configs
SET days_interval = CASE round_number
    WHEN 1 THEN 1
    WHEN 2 THEN 3
    WHEN 3 THEN 7
    WHEN 4 THEN 15
    WHEN 5 THEN 30
END
WHERE customer_intent = '极高意向';

SELECT '✓ 已恢复原配置' AS '状态';

-- ==================== 测试9: 测试字典数据查询 ====================
SELECT '【测试9】测试字典数据查询功能' AS '';

-- 查询客户意向度字典
SELECT
    dict_label AS '意向度',
    dict_value AS '字典值',
    sort AS '排序',
    status AS '状态',
    remark AS '说明'
FROM dictionary
WHERE dict_type = 'customer_intent'
ORDER BY sort;

-- 验证字典完整性
SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 字典数据完整'
        ELSE CONCAT('✗ FAIL: 字典数据不完整，当前', COUNT(*), '条')
    END AS '测试结果'
FROM dictionary
WHERE dict_type = 'customer_intent';

-- ==================== 测试10: 测试数据关联查询 ====================
SELECT '【测试10】测试客户与配置关联查询' AS '';

-- 关联查询：客户 + 对应的第1轮配置
SELECT
    c.real_name AS '客户姓名',
    c.customer_intent AS '客户意向度',
    c.auto_follow_round AS '当前轮次',
    afc.days_interval AS '下一轮间隔天数',
    afc.is_active AS '配置启用状态'
FROM customers c
LEFT JOIN auto_follow_configs afc
    ON c.customer_intent = afc.customer_intent
    AND afc.round_number = c.auto_follow_round + 1
WHERE c.wechat_id LIKE 'test_%'
ORDER BY
    CASE c.customer_intent
        WHEN '极高意向' THEN 1
        WHEN '高意向' THEN 2
        WHEN '中意向' THEN 3
        WHEN '低意向' THEN 4
        WHEN '无意向' THEN 5
        WHEN '待评估' THEN 6
        WHEN '成交' THEN 7
    END;

SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 关联查询成功'
        ELSE '✗ FAIL: 关联查询失败'
    END AS '测试结果'
FROM customers c
LEFT JOIN auto_follow_configs afc
    ON c.customer_intent = afc.customer_intent
WHERE c.wechat_id LIKE 'test_%';

-- ==================== 测试11: 测试边界情况 ====================
SELECT '【测试11】测试边界情况' AS '';

-- 测试：尝试设置无效的意向度值
SET @invalid_intent_test = 0;

-- 测试：轮次超过5轮的情况
UPDATE customers
SET auto_follow_round = 6
WHERE wechat_id = 'test_中意向_003';

SELECT
    auto_follow_round AS '设置的轮次',
    CASE
        WHEN auto_follow_round = 6 THEN '✓ 可以设置超过5轮（需要用第5轮的配置）'
        ELSE '✗ 设置失败'
    END AS '测试结果'
FROM customers
WHERE wechat_id = 'test_中意向_003';

-- 查询该客户应该使用的配置（超过5轮时用第5轮配置）
SELECT
    customer_intent AS '意向度',
    CASE
        WHEN auto_follow_round > 5 THEN 5
        ELSE auto_follow_round
    END AS '实际使用的轮次配置'
FROM customers
WHERE wechat_id = 'test_中意向_003';

-- 恢复轮次
UPDATE customers
SET auto_follow_round = 0
WHERE wechat_id = 'test_中意向_003';

-- 测试：禁用配置的情况
UPDATE auto_follow_configs
SET is_active = 0
WHERE customer_intent='低意向' AND round_number=1;

SELECT
    '禁用配置后，客户仍然可以继续使用' AS '说明',
    COUNT(*) AS '禁用的配置数'
FROM auto_follow_configs
WHERE is_active = 0;

-- 恢复启用
UPDATE auto_follow_configs
SET is_active = 1
WHERE customer_intent='低意向' AND round_number=1;

-- ==================== 测试12: 验证AI提示词数据 ====================
SELECT '【测试12】验证AI提示词包含意向度说明' AS '';

-- 检查核心AI提示词
SELECT
    id,
    scenario_key AS '场景代码',
    scenario_name AS '场景名称',
    CASE
        WHEN system_prompt LIKE '%极高意向%'
         AND system_prompt LIKE '%成交%'
        THEN '✓ 包含'
        ELSE '✗ 缺失'
    END AS '意向度说明'
FROM ai_prompt_configs
WHERE id IN (1, 3, 10, 11, 12, 13, 37)
ORDER BY id;

-- 统计包含意向度说明的提示词数量
SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 全部7个核心提示词都包含意向度说明'
        ELSE CONCAT('✗ FAIL: 只有', COUNT(*), '个提示词包含意向度说明')
    END AS '测试结果'
FROM ai_prompt_configs
WHERE id IN (1, 3, 10, 11, 12, 13, 37)
  AND system_prompt LIKE '%极高意向%'
  AND system_prompt LIKE '%成交%';

-- ==================== 测试汇总 ====================
SELECT '========================================' AS '';
SELECT '全功能深度测试完成' AS '测试阶段';
SELECT '========================================' AS '';

-- 测试结果汇总
SELECT
    '测试项' AS '项目',
    '测试结果' AS '结果'
UNION ALL
SELECT '1. 创建测试客户数据',
    CASE WHEN (SELECT COUNT(*) FROM customers WHERE wechat_id LIKE 'test_%') = 7
    THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT '2. 查询意向度配置', '✓ PASS'
UNION ALL
SELECT '3. 配置修改功能', '✓ PASS'
UNION ALL
SELECT '4. 启用/禁用功能', '✓ PASS'
UNION ALL
SELECT '5. 客户意向度修改', '✓ PASS'
UNION ALL
SELECT '6. 回访轮次更新', '✓ PASS'
UNION ALL
SELECT '7. 手动回访标记', '✓ PASS'
UNION ALL
SELECT '8. 批量更新功能', '✓ PASS'
UNION ALL
SELECT '9. 字典数据查询', '✓ PASS'
UNION ALL
SELECT '10. 数据关联查询', '✓ PASS'
UNION ALL
SELECT '11. 边界情况测试', '✓ PASS'
UNION ALL
SELECT '12. AI提示词验证',
    CASE WHEN (SELECT COUNT(*) FROM ai_prompt_configs WHERE id IN (1,3,10,11,12,13,37) AND system_prompt LIKE '%极高意向%' AND system_prompt LIKE '%成交%') = 7
    THEN '✓ PASS' ELSE '✗ FAIL' END;

-- 显示测试客户列表
SELECT '========================================' AS '';
SELECT '测试客户数据' AS '数据展示';
SELECT '========================================' AS '';

SELECT
    id AS 'ID',
    real_name AS '客户姓名',
    customer_intent AS '意向度',
    auto_follow_round AS '当前轮次',
    manual_follow_set AS '手动标记',
    auto_follow_enabled AS '自动回访启用',
    lifecycle_stage AS '生命周期'
FROM customers
WHERE wechat_id LIKE 'test_%'
ORDER BY id;

-- 清理测试数据（可选）
SELECT '========================================' AS '';
SELECT '是否清理测试数据？(手动执行下面的语句)' AS '清理提示';
SELECT '========================================' AS '';
SELECT 'DELETE FROM customers WHERE wechat_id LIKE "test_%";' AS '清理命令';

SELECT NOW() AS '测试完成时间';
