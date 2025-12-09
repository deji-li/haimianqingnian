-- ==================== 全系统集成功能验证（修正版） ====================
-- 验证时间: 2025-11-24
-- 说明: 基于实际数据库结构验证所有模块功能和模块间集成

SELECT '========================================' AS '';
SELECT '全系统集成功能验证开始' AS '验证阶段';
SELECT '========================================' AS '';
SELECT NOW() AS '开始时间';
SELECT '' AS '';

-- ==================== 1. 核心业务表结构检查 ====================
SELECT '【1】核心业务表结构检查' AS '';
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
SELECT 'commission_calculations', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='commission_calculations'
UNION ALL
SELECT 'operation_accounts', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='operation_accounts'
UNION ALL
SELECT 'operation_daily_records', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='operation_daily_records'
UNION ALL
SELECT 'notifications', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='notifications'
UNION ALL
SELECT 'enterprise_knowledge_base', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='enterprise_knowledge_base'
UNION ALL
SELECT 'ai_marketing_history', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='ai_marketing_history'
UNION ALL
SELECT 'auto_follow_configs', CASE WHEN COUNT(*) > 0 THEN '✓ 存在' ELSE '✗ 缺失' END
FROM information_schema.tables WHERE table_schema='education_crm' AND table_name='auto_follow_configs';

SELECT '' AS '';

-- ==================== 2. 订单与佣金计算打通验证 ====================
SELECT '【2】订单与佣金计算打通验证（财务模块）' AS '';

-- 2.1 检查订单表数据
SELECT '2.1 订单表数据检查' AS '';
SELECT
    COUNT(*) AS '订单总数',
    SUM(CASE WHEN order_status IN ('已完成','上课中') THEN 1 ELSE 0 END) AS '有效订单数',
    SUM(COALESCE(payment_amount, 0)) AS '总订单金额',
    SUM(COALESCE(commission_amount, 0)) AS '已记录佣金金额'
FROM orders;

-- 2.2 检查佣金计算表
SELECT '' AS '';
SELECT '2.2 佣金计算表数据检查' AS '';
SELECT
    COUNT(*) AS '佣金记录总数',
    SUM(order_amount) AS '订单金额汇总',
    SUM(commission_amount) AS '佣金金额汇总',
    COUNT(DISTINCT sales_id) AS '涉及销售人员数',
    SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS '已支付佣金数',
    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS '待支付佣金数'
FROM commission_calculations;

-- 2.3 验证订单与佣金记录的关联
SELECT '' AS '';
SELECT '2.3 订单与佣金计算关联检查' AS '';
SELECT
    COUNT(DISTINCT o.id) AS '有订单的总数',
    COUNT(DISTINCT cc.order_id) AS '有佣金记录的订单数',
    CONCAT(ROUND(COUNT(DISTINCT cc.order_id) * 100.0 / NULLIF(COUNT(DISTINCT o.id), 0), 2), '%') AS '佣金记录覆盖率',
    CASE
        WHEN COUNT(DISTINCT cc.order_id) > 0
        THEN CONCAT('✓ 发现', COUNT(DISTINCT cc.order_id), '个订单有佣金记录')
        ELSE '⚠️ 未发现订单与佣金关联'
    END AS '验证结果'
FROM orders o
LEFT JOIN commission_calculations cc ON cc.order_id = o.id;

-- 2.4 订单金额与佣金记录一致性检查
SELECT '' AS '';
SELECT '2.4 订单金额与佣金记录一致性（抽样前5条）' AS '';
SELECT
    o.id AS '订单ID',
    o.order_no AS '订单号',
    o.payment_amount AS '订单金额',
    cc.order_amount AS '佣金表记录金额',
    cc.commission_amount AS '佣金金额',
    cc.status AS '佣金状态',
    CASE
        WHEN o.payment_amount = cc.order_amount THEN '✓ 一致'
        WHEN cc.order_amount IS NULL THEN '⚠️ 无佣金记录'
        ELSE '✗ 不一致'
    END AS '金额一致性'
FROM orders o
LEFT JOIN commission_calculations cc ON cc.order_id = o.id
WHERE o.payment_amount IS NOT NULL AND o.payment_amount > 0
LIMIT 5;

SELECT '' AS '';

-- ==================== 3. 运营账号管理与日报打通验证 ====================
SELECT '【3】运营账号管理与日报打通验证' AS '';

-- 3.1 检查运营账号表
SELECT '3.1 运营账号表数据检查' AS '';
SELECT
    COUNT(*) AS '账号总数',
    SUM(CASE WHEN status='正常' THEN 1 ELSE 0 END) AS '正常账号',
    SUM(CASE WHEN status='风险' THEN 1 ELSE 0 END) AS '风险账号',
    SUM(CASE WHEN status='封号' THEN 1 ELSE 0 END) AS '封号账号',
    COUNT(DISTINCT platform_type) AS '平台类型数'
FROM operation_accounts;

-- 3.2 按平台统计账号
SELECT '' AS '';
SELECT '3.2 各平台账号统计' AS '';
SELECT
    platform_type AS '平台',
    COUNT(*) AS '账号数',
    SUM(CASE WHEN status='正常' THEN 1 ELSE 0 END) AS '正常账号',
    SUM(fans_count) AS '总粉丝数',
    SUM(total_likes) AS '总点赞数'
FROM operation_accounts
GROUP BY platform_type
ORDER BY COUNT(*) DESC;

-- 3.3 检查运营日报表
SELECT '' AS '';
SELECT '3.3 运营日报数据检查' AS '';
SELECT
    COUNT(*) AS '日报总数',
    COUNT(DISTINCT account_id) AS '涉及账号数',
    COUNT(DISTINCT report_date) AS '报告天数',
    COUNT(DISTINCT operator_id) AS '涉及运营人员数',
    MIN(report_date) AS '最早日期',
    MAX(report_date) AS '最新日期'
FROM operation_daily_records;

-- 3.4 验证运营账号与日报的关联
SELECT '' AS '';
SELECT '3.4 运营账号与日报关联检查' AS '';
SELECT
    COUNT(DISTINCT oa.id) AS '账号总数',
    COUNT(DISTINCT odr.account_id) AS '有日报的账号数',
    CONCAT(ROUND(COUNT(DISTINCT odr.account_id) * 100.0 / NULLIF(COUNT(DISTINCT oa.id), 0), 2), '%') AS '日报覆盖率',
    CASE
        WHEN COUNT(DISTINCT odr.account_id) > 0
        THEN CONCAT('✓ 发现', COUNT(DISTINCT odr.account_id), '个账号有日报数据')
        ELSE '⚠️ 未发现账号与日报关联'
    END AS '验证结果'
FROM operation_accounts oa
LEFT JOIN operation_daily_records odr ON odr.account_id = oa.id;

-- 3.5 运营日报数据质量检查（最近5条）
SELECT '' AS '';
SELECT '3.5 运营日报数据质量检查（最近5条）' AS '';
SELECT
    odr.report_date AS '日期',
    oa.account_name AS '账号名称',
    oa.platform_type AS '平台',
    odr.update_count AS '更新次数',
    CONCAT(odr.view_min, '-', odr.view_max) AS '浏览量范围',
    odr.remark AS '备注'
FROM operation_daily_records odr
LEFT JOIN operation_accounts oa ON oa.id = odr.account_id
ORDER BY odr.report_date DESC, odr.id DESC
LIMIT 5;

SELECT '' AS '';

-- ==================== 4. 订单同步功能验证 ====================
SELECT '【4】订单同步功能验证' AS '';

-- 4.1 检查外部订单同步状态
SELECT '4.1 外部订单同步状态检查' AS '';
SELECT
    COUNT(*) AS '总订单数',
    SUM(CASE WHEN is_external=1 THEN 1 ELSE 0 END) AS '外部订单数',
    SUM(CASE WHEN is_external=0 THEN 1 ELSE 0 END) AS '内部订单数',
    SUM(CASE WHEN sync_status='已同步' THEN 1 ELSE 0 END) AS '已同步订单',
    SUM(CASE WHEN sync_status='未同步' THEN 1 ELSE 0 END) AS '未同步订单',
    SUM(CASE WHEN sync_status='同步失败' THEN 1 ELSE 0 END) AS '同步失败订单'
FROM orders;

-- 4.2 检查订单数据来源
SELECT '' AS '';
SELECT '4.2 订单数据来源统计' AS '';
SELECT
    COALESCE(data_source, '未标记') AS '数据来源',
    COUNT(*) AS '订单数量',
    SUM(COALESCE(payment_amount, 0)) AS '总金额',
    COUNT(DISTINCT customer_id) AS '客户数'
FROM orders
GROUP BY data_source
ORDER BY COUNT(*) DESC;

-- 4.3 外部系统订单统计
SELECT '' AS '';
SELECT '4.3 外部系统订单统计' AS '';
SELECT
    COALESCE(external_system, '本地创建') AS '外部系统',
    COUNT(*) AS '订单数',
    SUM(COALESCE(payment_amount, 0)) AS '总金额',
    MAX(last_sync_time) AS '最后同步时间'
FROM orders
GROUP BY external_system
ORDER BY COUNT(*) DESC;

SELECT '' AS '';

-- ==================== 5. 佣金计算功能详细验证 ====================
SELECT '【5】佣金计算功能详细验证' AS '';

-- 5.1 佣金方案统计
SELECT '5.1 佣金方案使用统计' AS '';
SELECT
    scheme_name AS '佣金方案',
    COUNT(*) AS '使用次数',
    SUM(order_amount) AS '订单总额',
    SUM(commission_amount) AS '佣金总额',
    CONCAT(ROUND(SUM(commission_amount) * 100.0 / NULLIF(SUM(order_amount), 0), 2), '%') AS '平均佣金率'
FROM commission_calculations
GROUP BY scheme_name
ORDER BY COUNT(*) DESC;

-- 5.2 销售人员佣金统计（前5名）
SELECT '' AS '';
SELECT '5.2 销售人员佣金统计（TOP 5）' AS '';
SELECT
    u.real_name AS '销售姓名',
    COUNT(DISTINCT cc.order_id) AS '订单数',
    SUM(cc.order_amount) AS '订单总额',
    SUM(cc.commission_amount) AS '佣金总额',
    SUM(CASE WHEN cc.status='paid' THEN cc.commission_amount ELSE 0 END) AS '已发放佣金',
    SUM(CASE WHEN cc.status='pending' THEN cc.commission_amount ELSE 0 END) AS '待发放佣金'
FROM commission_calculations cc
LEFT JOIN users u ON u.id = cc.sales_id
GROUP BY cc.sales_id, u.real_name
ORDER BY SUM(cc.commission_amount) DESC
LIMIT 5;

-- 5.3 验证订单佣金自动计算
SELECT '' AS '';
SELECT '5.3 订单佣金自动计算验证' AS '';
SELECT
    CASE
        WHEN COUNT(DISTINCT o.id) > 0 AND COUNT(DISTINCT cc.order_id) > 0
        THEN CONCAT('✓ PASS: ', COUNT(DISTINCT cc.order_id), '/', COUNT(DISTINCT o.id), ' 订单已自动计算佣金')
        WHEN COUNT(DISTINCT o.id) > 0
        THEN CONCAT('⚠️ WARNING: ', COUNT(DISTINCT o.id), '个订单但无佣金计算记录')
        ELSE '⚠️ 无订单数据'
    END AS '验证结果'
FROM orders o
LEFT JOIN commission_calculations cc ON cc.order_id = o.id
WHERE o.order_status IN ('已完成', '上课中');

SELECT '' AS '';

-- ==================== 6. 通知系统验证 ====================
SELECT '【6】通知系统验证' AS '';

-- 6.1 检查通知记录
SELECT '6.1 通知记录统计' AS '';
SELECT
    COUNT(*) AS '通知总数',
    SUM(CASE WHEN isRead=1 THEN 1 ELSE 0 END) AS '已读通知',
    SUM(CASE WHEN isRead=0 THEN 1 ELSE 0 END) AS '未读通知',
    COUNT(DISTINCT userId) AS '涉及用户数',
    COUNT(DISTINCT CASE WHEN relatedType='customer' THEN relatedId END) AS '客户相关通知数'
FROM notifications;

-- 6.2 按类型统计通知
SELECT '' AS '';
SELECT '6.2 通知类型统计（TOP 5）' AS '';
SELECT
    type AS '通知类型',
    COUNT(*) AS '数量',
    SUM(CASE WHEN isRead=1 THEN 1 ELSE 0 END) AS '已读',
    SUM(CASE WHEN isRead=0 THEN 1 ELSE 0 END) AS '未读',
    CONCAT(ROUND(SUM(CASE WHEN isRead=1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2), '%') AS '阅读率'
FROM notifications
GROUP BY type
ORDER BY COUNT(*) DESC
LIMIT 5;

-- 6.3 验证通知与用户关联
SELECT '' AS '';
SELECT '6.3 通知与用户关联检查' AS '';
SELECT
    COUNT(DISTINCT n.userId) AS '有通知的用户数',
    COUNT(*) AS '通知总数',
    CASE
        WHEN COUNT(DISTINCT n.userId) > 0
        THEN CONCAT('✓ ', COUNT(DISTINCT n.userId), '个用户有相关通知')
        ELSE '⚠️ 无用户通知'
    END AS '验证结果'
FROM notifications n;

SELECT '' AS '';

-- ==================== 7. 企业知识库验证 ====================
SELECT '【7】企业知识库验证' AS '';

-- 7.1 检查知识库条目
SELECT '7.1 知识库条目统计' AS '';
SELECT
    COUNT(*) AS '知识库总条目',
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS '活跃条目',
    SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) AS '非活跃条目',
    SUM(CASE WHEN status='pending_review' THEN 1 ELSE 0 END) AS '待审核条目',
    COUNT(DISTINCT scene_category) AS '场景分类数',
    COUNT(DISTINCT product_category) AS '产品分类数',
    COUNT(DISTINCT creator_id) AS '创建人数'
FROM enterprise_knowledge_base;

-- 7.2 按场景分类统计知识
SELECT '' AS '';
SELECT '7.2 知识库场景分类统计（TOP 5）' AS '';
SELECT
    COALESCE(scene_category, '未分类') AS '场景分类',
    COUNT(*) AS '条目数',
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS '活跃',
    MAX(update_time) AS '最后更新时间'
FROM enterprise_knowledge_base
GROUP BY scene_category
ORDER BY COUNT(*) DESC
LIMIT 5;

-- 7.3 知识库使用情况
SELECT '' AS '';
SELECT '7.3 知识库使用情况' AS '';
SELECT
    COUNT(*) AS '总使用次数',
    COUNT(DISTINCT user_id) AS '使用用户数',
    COUNT(DISTINCT customer_id) AS '涉及客户数',
    SUM(CASE WHEN ai_decision='use_knowledge' THEN 1 ELSE 0 END) AS '使用知识库次数',
    SUM(CASE WHEN ai_decision='use_ai_generate' THEN 1 ELSE 0 END) AS 'AI生成次数'
FROM knowledge_usage_log;

SELECT '' AS '';

-- ==================== 8. AI营销助手验证 ====================
SELECT '【8】AI营销助手验证' AS '';

-- 8.1 检查AI营销历史
SELECT '8.1 AI营销历史记录统计' AS '';
SELECT
    COUNT(*) AS '总生成次数',
    COUNT(DISTINCT user_id) AS '使用用户数',
    COUNT(DISTINCT content_type) AS '内容类型数',
    SUM(CASE WHEN generation_mode='knowledge_ai' THEN 1 ELSE 0 END) AS '知识库+AI生成',
    SUM(CASE WHEN generation_mode='pure_ai' THEN 1 ELSE 0 END) AS '纯AI生成'
FROM ai_marketing_history;

-- 8.2 按内容类型统计
SELECT '' AS '';
SELECT '8.2 AI营销内容类型统计（TOP 5）' AS '';
SELECT
    content_type AS '内容类型',
    COUNT(*) AS '生成次数',
    AVG(LENGTH(generated_content)) AS '平均内容长度',
    MAX(create_time) AS '最后使用时间'
FROM ai_marketing_history
GROUP BY content_type
ORDER BY COUNT(*) DESC
LIMIT 5;

-- 8.3 验证用户与AI营销使用
SELECT '' AS '';
SELECT '8.3 用户与AI营销使用检查' AS '';
SELECT
    COUNT(DISTINCT amh.user_id) AS '使用AI营销的用户数',
    COUNT(*) AS 'AI营销生成次数',
    CASE
        WHEN COUNT(DISTINCT amh.user_id) > 0
        THEN CONCAT('✓ ', COUNT(DISTINCT amh.user_id), '个用户使用了AI营销')
        ELSE '⚠️ 无用户使用AI营销'
    END AS '验证结果'
FROM ai_marketing_history amh;

SELECT '' AS '';

-- ==================== 9. 客户管理与其他模块联动验证 ====================
SELECT '【9】客户管理与其他模块联动验证' AS '';

-- 9.1 客户与订单关联
SELECT '9.1 客户与订单关联' AS '';
SELECT
    COUNT(DISTINCT c.id) AS '总客户数',
    COUNT(DISTINCT o.customer_id) AS '有订单的客户数',
    COUNT(DISTINCT o.id) AS '总订单数',
    SUM(o.payment_amount) AS '总订单金额',
    CONCAT(ROUND(COUNT(DISTINCT o.customer_id) * 100.0 / NULLIF(COUNT(DISTINCT c.id), 0), 2), '%') AS '客户成交率'
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;

-- 9.2 客户与通知关联
SELECT '' AS '';
SELECT '9.2 客户与通知关联' AS '';
SELECT
    COUNT(DISTINCT c.id) AS '总客户数',
    COUNT(DISTINCT CASE WHEN n.relatedType='customer' THEN n.relatedId END) AS '有通知的客户数',
    SUM(CASE WHEN n.relatedType='customer' THEN 1 ELSE 0 END) AS '客户相关通知总数',
    CONCAT(ROUND(COUNT(DISTINCT CASE WHEN n.relatedType='customer' THEN n.relatedId END) * 100.0 / NULLIF(COUNT(DISTINCT c.id), 0), 2), '%') AS '通知覆盖率'
FROM customers c
LEFT JOIN notifications n ON n.relatedId = c.id AND n.relatedType = 'customer';

-- 9.3 用户AI营销使用统计
SELECT '' AS '';
SELECT '9.3 用户AI营销使用统计' AS '';
SELECT
    COUNT(DISTINCT u.id) AS '总用户数',
    COUNT(DISTINCT amh.user_id) AS '使用AI营销的用户数',
    SUM(CASE WHEN amh.user_id IS NOT NULL THEN 1 ELSE 0 END) AS 'AI营销生成总次数',
    CONCAT(ROUND(COUNT(DISTINCT amh.user_id) * 100.0 / NULLIF(COUNT(DISTINCT u.id), 0), 2), '%') AS 'AI营销使用率'
FROM users u
LEFT JOIN ai_marketing_history amh ON amh.user_id = u.id;

-- 9.4 客户生命周期统计
SELECT '' AS '';
SELECT '9.4 客户生命周期统计' AS '';
SELECT
    lifecycle_stage AS '生命周期阶段',
    COUNT(*) AS '客户数',
    COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM orders WHERE customer_id=customers.id) THEN customers.id END) AS '有订单客户数',
    CONCAT(ROUND(AVG(CASE WHEN auto_follow_enabled=1 THEN 100 ELSE 0 END), 2), '%') AS '自动回访启用率'
FROM customers
GROUP BY lifecycle_stage
ORDER BY COUNT(*) DESC;

SELECT '' AS '';

-- ==================== 10. 数据完整性验证 ====================
SELECT '【10】数据完整性验证' AS '';

-- 10.1 孤立订单检查
SELECT '10.1 孤立订单检查（订单但客户不存在）' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立订单'
        ELSE CONCAT('✗ FAIL: 发现', COUNT(*), '个孤立订单')
    END AS '验证结果'
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;

-- 10.2 孤立佣金记录检查
SELECT '' AS '';
SELECT '10.2 孤立佣金记录检查（佣金但订单不存在）' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立佣金记录'
        ELSE CONCAT('⚠️ 发现', COUNT(*), '条佣金记录无对应订单')
    END AS '验证结果'
FROM commission_calculations cc
LEFT JOIN orders o ON o.id = cc.order_id
WHERE o.id IS NULL;

-- 10.3 孤立运营日报检查
SELECT '' AS '';
SELECT '10.3 孤立运营日报检查（日报但账号不存在）' AS '';
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASS: 无孤立日报'
        ELSE CONCAT('⚠️ 发现', COUNT(*), '条日报无对应账号')
    END AS '验证结果'
FROM operation_daily_records odr
LEFT JOIN operation_accounts oa ON oa.id = odr.account_id
WHERE oa.id IS NULL;

-- 10.4 订单佣金一致性检查
SELECT '' AS '';
SELECT '10.4 订单佣金金额一致性检查' AS '';
SELECT
    COUNT(*) AS '检查订单数',
    SUM(CASE WHEN o.commission_amount = cc.commission_amount THEN 1 ELSE 0 END) AS '佣金金额一致',
    SUM(CASE WHEN o.commission_amount != cc.commission_amount THEN 1 ELSE 0 END) AS '佣金金额不一致',
    CASE
        WHEN SUM(CASE WHEN o.commission_amount != cc.commission_amount THEN 1 ELSE 0 END) = 0
        THEN '✓ PASS: 所有订单佣金金额一致'
        ELSE CONCAT('⚠️ WARNING: ', SUM(CASE WHEN o.commission_amount != cc.commission_amount THEN 1 ELSE 0 END), '个订单佣金金额不一致')
    END AS '验证结果'
FROM orders o
INNER JOIN commission_calculations cc ON cc.order_id = o.id
WHERE o.commission_amount IS NOT NULL;

SELECT '' AS '';

-- ==================== 验证结果汇总 ====================
SELECT '========================================' AS '';
SELECT '全系统集成功能验证完成' AS '验证阶段';
SELECT '========================================' AS '';

SELECT
    '验证模块' AS '模块',
    '状态' AS '结果'
UNION ALL
SELECT '1. 核心业务表结构', '✓ 检查完成'
UNION ALL
SELECT '2. 订单与佣金计算打通（财务模块）', '✓ 检查完成'
UNION ALL
SELECT '3. 运营账号管理与日报打通', '✓ 检查完成'
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
