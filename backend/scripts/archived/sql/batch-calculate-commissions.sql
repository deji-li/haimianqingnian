-- ==================== 批量计算订单佣金 SQL方案 ====================
-- 如果不想使用Node.js脚本，可以使用SQL直接调用（需要数据库支持存储过程）
-- 或者通过API手动调用

-- 查看所有未计算佣金的订单
SELECT
    id AS '订单ID',
    order_no AS '订单号',
    payment_amount AS '订单金额',
    order_tag AS '订单标签',
    commission_scheme_id AS '佣金方案ID',
    commission_amount AS '佣金金额',
    commission_calculated_at AS '计算时间'
FROM orders
WHERE commission_calculated_at IS NULL;

-- 说明：需要通过API接口逐个调用计算
-- POST http://localhost:3000/api/commission/calculate/{订单ID}

-- 示例：手动为订单ID=1计算佣金（需要先登录获取token）
-- curl -X POST http://localhost:3000/api/commission/calculate/1 \
--   -H "Authorization: Bearer YOUR_TOKEN_HERE"

-- ==================== 验证佣金计算结果 ====================

-- 1. 查看所有订单的佣金计算状态
SELECT
    o.id,
    o.order_no AS '订单号',
    o.payment_amount AS '订单金额',
    o.order_tag AS '订单标签',
    cs.name AS '佣金方案',
    o.commission_amount AS '佣金金额',
    o.commission_calculated_at AS '计算时间'
FROM orders o
LEFT JOIN commission_schemes cs ON cs.id = o.commission_scheme_id
ORDER BY o.id;

-- 2. 查看佣金计算记录表
SELECT
    cc.id,
    cc.order_id AS '订单ID',
    o.order_no AS '订单号',
    cc.scheme_name AS '佣金方案',
    cc.order_amount AS '订单金额',
    cc.commission_amount AS '佣金金额',
    u.real_name AS '销售姓名',
    cc.status AS '状态',
    cc.create_time AS '创建时间'
FROM commission_calculations cc
LEFT JOIN orders o ON o.id = cc.order_id
LEFT JOIN users u ON u.id = cc.sales_id
ORDER BY cc.id;

-- 3. 统计佣金汇总
SELECT
    COUNT(*) AS '已计算订单数',
    SUM(order_amount) AS '订单总金额',
    SUM(commission_amount) AS '佣金总金额',
    AVG(commission_amount) AS '平均佣金',
    COUNT(DISTINCT sales_id) AS '涉及销售人数'
FROM commission_calculations;

-- 4. 按销售人员统计佣金
SELECT
    u.id AS '销售ID',
    u.real_name AS '销售姓名',
    COUNT(cc.id) AS '订单数',
    SUM(cc.order_amount) AS '订单总额',
    SUM(cc.commission_amount) AS '佣金总额',
    AVG(cc.commission_amount) AS '平均佣金'
FROM commission_calculations cc
LEFT JOIN users u ON u.id = cc.sales_id
GROUP BY u.id, u.real_name
ORDER BY SUM(cc.commission_amount) DESC;

-- 5. 按佣金方案统计
SELECT
    scheme_name AS '佣金方案',
    COUNT(*) AS '使用次数',
    SUM(order_amount) AS '订单总额',
    SUM(commission_amount) AS '佣金总额',
    AVG(commission_amount) AS '平均佣金'
FROM commission_calculations
GROUP BY scheme_name
ORDER BY COUNT(*) DESC;
