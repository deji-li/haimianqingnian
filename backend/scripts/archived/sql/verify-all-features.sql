-- ==================== 全站功能自动验证脚本 ====================
-- 执行时间: 2025-11-24
-- 说明: 自动验证所有功能是否正常工作

SET @verification_passed = 0;
SET @verification_failed = 0;

-- ==================== 1. 验证数据库结构 ====================

SELECT '====== 1. 数据库结构验证 ======' AS '';

-- 1.1 验证 auto_follow_configs 表是否存在
SELECT
    CASE
        WHEN COUNT(*) = 1 THEN '✓ PASS: auto_follow_configs表存在'
        ELSE '✗ FAIL: auto_follow_configs表不存在'
    END AS '验证结果'
FROM information_schema.tables
WHERE table_schema = 'education_crm'
  AND table_name = 'auto_follow_configs';

-- 1.2 验证 auto_follow_configs 表字段
SELECT
    CASE
        WHEN COUNT(*) >= 7 THEN '✓ PASS: auto_follow_configs表字段完整'
        ELSE '✗ FAIL: auto_follow_configs表字段不完整'
    END AS '验证结果',
    COUNT(*) AS '字段数量'
FROM information_schema.columns
WHERE table_schema = 'education_crm'
  AND table_name = 'auto_follow_configs';

-- 1.3 验证 customers 表的 customer_intent 字段类型
SELECT
    CASE
        WHEN column_type LIKE 'varchar%' THEN '✓ PASS: customer_intent已改为VARCHAR类型'
        ELSE '✗ FAIL: customer_intent仍是ENUM类型'
    END AS '验证结果',
    column_type AS '当前类型'
FROM information_schema.columns
WHERE table_schema = 'education_crm'
  AND table_name = 'customers'
  AND column_name = 'customer_intent';

-- 1.4 验证 customers 表新增的自动回访字段
SELECT
    CASE
        WHEN COUNT(*) = 4 THEN '✓ PASS: customers表自动回访字段完整'
        ELSE '✗ FAIL: customers表自动回访字段缺失'
    END AS '验证结果',
    GROUP_CONCAT(column_name ORDER BY ordinal_position) AS '已存在的字段'
FROM information_schema.columns
WHERE table_schema = 'education_crm'
  AND table_name = 'customers'
  AND column_name IN ('auto_follow_enabled', 'auto_follow_round', 'manual_follow_set', 'last_auto_follow_time');

-- ==================== 2. 验证初始化数据 ====================

SELECT '====== 2. 初始化数据验证 ======' AS '';

-- 2.1 验证客户意向度字典数据
SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 客户意向度字典包含完整7个等级'
        ELSE CONCAT('✗ FAIL: 客户意向度字典缺失,当前只有', COUNT(*), '个')
    END AS '验证结果',
    GROUP_CONCAT(dict_value ORDER BY sort SEPARATOR ', ') AS '意向度列表'
FROM dictionary
WHERE dict_type = 'customer_intent';

-- 2.2 验证自动回访配置数据
SELECT
    CASE
        WHEN COUNT(*) = 35 THEN '✓ PASS: 自动回访配置完整(7意向×5轮次=35条)'
        ELSE CONCAT('✗ FAIL: 自动回访配置不完整,当前只有', COUNT(*), '条')
    END AS '验证结果'
FROM auto_follow_configs;

-- 2.3 按意向度统计配置数据
SELECT
    customer_intent AS '意向度',
    COUNT(*) AS '配置轮次',
    CASE
        WHEN COUNT(*) = 5 THEN '✓'
        ELSE '✗'
    END AS '状态'
FROM auto_follow_configs
GROUP BY customer_intent
ORDER BY
    CASE customer_intent
        WHEN '成交' THEN 1
        WHEN '极高意向' THEN 2
        WHEN '高意向' THEN 3
        WHEN '中意向' THEN 4
        WHEN '低意向' THEN 5
        WHEN '无意向' THEN 6
        WHEN '待评估' THEN 7
    END;

-- ==================== 3. 验证AI提示词优化 ====================

SELECT '====== 3. AI提示词优化验证 ======' AS '';

-- 3.1 验证核心提示词是否包含7个意向度说明
SELECT
    id,
    scenario_key,
    scenario_name,
    CASE
        WHEN system_prompt LIKE '%极高意向%' AND
             system_prompt LIKE '%高意向%' AND
             system_prompt LIKE '%中意向%' AND
             system_prompt LIKE '%低意向%' AND
             system_prompt LIKE '%无意向%' AND
             system_prompt LIKE '%待评估%' AND
             system_prompt LIKE '%成交%'
        THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS '验证结果'
FROM ai_prompt_configs
WHERE id IN (1, 3, 10, 11, 12, 13, 37)
ORDER BY id;

-- 3.2 统计更新成功的提示词数量
SELECT
    CASE
        WHEN COUNT(*) = 7 THEN '✓ PASS: 全部7个核心提示词已优化'
        ELSE CONCAT('✗ FAIL: 只有', COUNT(*), '个提示词已优化')
    END AS '验证结果'
FROM ai_prompt_configs
WHERE id IN (1, 3, 10, 11, 12, 13, 37)
  AND system_prompt LIKE '%极高意向%'
  AND system_prompt LIKE '%成交%';

-- ==================== 4. 验证数据一致性 ====================

SELECT '====== 4. 数据一致性验证 ======' AS '';

-- 4.1 验证客户意向度值是否在字典中
SELECT
    CASE
        WHEN invalid_count = 0 THEN '✓ PASS: 所有客户意向度值都在字典范围内'
        ELSE CONCAT('✗ FAIL: 发现', invalid_count, '个无效的客户意向度值')
    END AS '验证结果',
    invalid_count AS '无效记录数'
FROM (
    SELECT COUNT(*) AS invalid_count
    FROM customers c
    WHERE c.customer_intent IS NOT NULL
      AND c.customer_intent NOT IN (
          SELECT dict_value FROM dictionary WHERE dict_type = 'customer_intent'
      )
) AS validation;

-- 4.2 验证自动回访配置的意向度值是否在字典中
SELECT
    CASE
        WHEN invalid_count = 0 THEN '✓ PASS: 所有自动回访配置的意向度值都在字典范围内'
        ELSE CONCAT('✗ FAIL: 发现', invalid_count, '个无效的配置意向度值')
    END AS '验证结果'
FROM (
    SELECT COUNT(*) AS invalid_count
    FROM auto_follow_configs afc
    WHERE afc.customer_intent NOT IN (
        SELECT dict_value FROM dictionary WHERE dict_type = 'customer_intent'
    )
) AS validation;

-- ==================== 5. 功能性数据统计 ====================

SELECT '====== 5. 功能性数据统计 ======' AS '';

-- 5.1 客户数据统计
SELECT
    '客户总数' AS '统计项',
    COUNT(*) AS '数量'
FROM customers
UNION ALL
SELECT
    '已设置意向度的客户',
    COUNT(*)
FROM customers
WHERE customer_intent IS NOT NULL
UNION ALL
SELECT
    '启用自动回访的客户',
    COUNT(*)
FROM customers
WHERE auto_follow_enabled = 1;

-- 5.2 各意向度客户分布
SELECT
    COALESCE(customer_intent, '未设置') AS '客户意向度',
    COUNT(*) AS '客户数量',
    CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2), '%') AS '占比'
FROM customers
GROUP BY customer_intent
ORDER BY COUNT(*) DESC;

-- 5.3 自动回访配置统计
SELECT
    '总配置数' AS '统计项',
    COUNT(*) AS '数量'
FROM auto_follow_configs
UNION ALL
SELECT
    '启用的配置',
    COUNT(*)
FROM auto_follow_configs
WHERE is_active = 1
UNION ALL
SELECT
    '禁用的配置',
    COUNT(*)
FROM auto_follow_configs
WHERE is_active = 0;

-- ==================== 6. 配置有效性验证 ====================

SELECT '====== 6. 配置有效性验证 ======' AS '';

-- 6.1 检查是否有配置间隔天数为0或负数
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 所有配置的间隔天数都有效(>0)'
        ELSE CONCAT('✗ FAIL: 发现', COUNT(*), '个无效的间隔天数配置')
    END AS '验证结果'
FROM auto_follow_configs
WHERE days_interval <= 0;

-- 6.2 检查每个意向度是否有完整的5轮配置
SELECT
    CASE
        WHEN missing_count = 0 THEN '✓ PASS: 所有意向度都有完整的5轮配置'
        ELSE CONCAT('✗ FAIL: 有', missing_count, '个意向度配置不完整')
    END AS '验证结果'
FROM (
    SELECT COUNT(*) AS missing_count
    FROM dictionary d
    WHERE d.dict_type = 'customer_intent'
      AND (
          SELECT COUNT(*)
          FROM auto_follow_configs afc
          WHERE afc.customer_intent = d.dict_value
      ) < 5
) AS validation;

-- ==================== 7. 最终验证汇总 ====================

SELECT '====== 7. 最终验证汇总 ======' AS '';

SELECT
    '验证项目' AS '项目',
    '状态' AS '结果'
UNION ALL
SELECT '1. 数据库表结构', '✓'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'education_crm' AND table_name = 'auto_follow_configs')
UNION ALL
SELECT '2. 客户意向度字典', '✓'
WHERE (SELECT COUNT(*) FROM dictionary WHERE dict_type = 'customer_intent') = 7
UNION ALL
SELECT '3. 自动回访配置数据', '✓'
WHERE (SELECT COUNT(*) FROM auto_follow_configs) = 35
UNION ALL
SELECT '4. AI提示词优化', '✓'
WHERE (SELECT COUNT(*) FROM ai_prompt_configs WHERE id IN (1,3,10,11,12,13,37) AND system_prompt LIKE '%极高意向%' AND system_prompt LIKE '%成交%') = 7
UNION ALL
SELECT '5. 数据一致性', '✓'
WHERE (SELECT COUNT(*) FROM customers c WHERE c.customer_intent IS NOT NULL AND c.customer_intent NOT IN (SELECT dict_value FROM dictionary WHERE dict_type = 'customer_intent')) = 0
UNION ALL
SELECT '6. 配置有效性', '✓'
WHERE (SELECT COUNT(*) FROM auto_follow_configs WHERE days_interval <= 0) = 0;

-- 最终结果
SELECT
    CASE
        WHEN (
            EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'education_crm' AND table_name = 'auto_follow_configs')
            AND (SELECT COUNT(*) FROM dictionary WHERE dict_type = 'customer_intent') = 7
            AND (SELECT COUNT(*) FROM auto_follow_configs) = 35
            AND (SELECT COUNT(*) FROM ai_prompt_configs WHERE id IN (1,3,10,11,12,13,37) AND system_prompt LIKE '%极高意向%' AND system_prompt LIKE '%成交%') = 7
        )
        THEN '✓✓✓ 全站功能验证通过 ✓✓✓'
        ELSE '✗✗✗ 全站功能验证失败 ✗✗✗'
    END AS '最终验证结果';

SELECT
    NOW() AS '验证时间',
    '全站功能自动验证完成' AS '状态';
