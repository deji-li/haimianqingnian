-- 初始化客户生命周期相关表和数据

-- 1. 创建客户生命周期记录表
CREATE TABLE IF NOT EXISTS `customer_lifecycle` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL COMMENT '客户ID',
  `stage` VARCHAR(50) NOT NULL COMMENT '生命周期阶段：线索/意向客户/商机/成交客户/复购客户',
  `change_reason` TEXT COMMENT '阶段变更原因',
  `operator_id` INT NOT NULL COMMENT '操作人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_stage` (`stage`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户生命周期记录表';

-- 2. 在customer表添加当前生命周期阶段字段
ALTER TABLE `customer` ADD COLUMN IF NOT EXISTS `lifecycle_stage` VARCHAR(50) DEFAULT '线索' COMMENT '当前生命周期阶段' AFTER `customer_intent`;

-- 3. 初始化生命周期阶段字典
DELETE FROM dictionary WHERE dict_type = 'lifecycle_stage';

INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('lifecycle_stage', '线索', '线索', 1, 1, '刚获取到的潜在客户信息'),
('lifecycle_stage', '意向客户', '意向客户', 2, 1, '已经沟通过，有一定意向'),
('lifecycle_stage', '商机', '商机', 3, 1, '高意向，正在谈判中'),
('lifecycle_stage', '成交客户', '成交客户', 4, 1, '已经付款成为客户'),
('lifecycle_stage', '复购客户', '复购客户', 5, 1, '再次购买的客户'),
('lifecycle_stage', '流失客户', '流失客户', 6, 1, '长期未跟进或明确拒绝的客户');

-- 4. 为现有客户初始化生命周期记录
INSERT INTO customer_lifecycle (customer_id, stage, change_reason, operator_id)
SELECT
  c.id,
  '线索' as stage,
  '系统初始化' as change_reason,
  c.sales_id as operator_id
FROM customer c
WHERE NOT EXISTS (
  SELECT 1 FROM customer_lifecycle cl WHERE cl.customer_id = c.id
);

-- 5. 更新已有订单的客户为"成交客户"
UPDATE customer c
INNER JOIN (
  SELECT DISTINCT customer_id
  FROM `order`
  WHERE customer_id IS NOT NULL
) o ON c.id = o.customer_id
SET c.lifecycle_stage = '成交客户'
WHERE c.lifecycle_stage = '线索';

-- 6. 为已成交客户添加生命周期记录
INSERT INTO customer_lifecycle (customer_id, stage, change_reason, operator_id)
SELECT DISTINCT
  o.customer_id,
  '成交客户' as stage,
  '客户已下单付款' as change_reason,
  c.sales_id as operator_id
FROM `order` o
INNER JOIN customer c ON c.id = o.customer_id
WHERE o.customer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM customer_lifecycle cl
    WHERE cl.customer_id = o.customer_id
    AND cl.stage = '成交客户'
  );

-- 7. 检测复购客户
UPDATE customer c
INNER JOIN (
  SELECT customer_id, COUNT(*) as order_count
  FROM `order`
  WHERE customer_id IS NOT NULL
  GROUP BY customer_id
  HAVING order_count > 1
) o ON c.id = o.customer_id
SET c.lifecycle_stage = '复购客户';

-- 8. 为复购客户添加生命周期记录
INSERT INTO customer_lifecycle (customer_id, stage, change_reason, operator_id)
SELECT
  c.id,
  '复购客户' as stage,
  CONCAT('客户已完成', o.order_count, '次购买') as change_reason,
  c.sales_id as operator_id
FROM customer c
INNER JOIN (
  SELECT customer_id, COUNT(*) as order_count
  FROM `order`
  WHERE customer_id IS NOT NULL
  GROUP BY customer_id
  HAVING order_count > 1
) o ON c.id = o.customer_id
WHERE NOT EXISTS (
  SELECT 1 FROM customer_lifecycle cl
  WHERE cl.customer_id = c.id
  AND cl.stage = '复购客户'
);

-- 验证数据
SELECT
  dict_label as '生命周期阶段',
  dict_value as '值',
  remark as '说明'
FROM dictionary
WHERE dict_type = 'lifecycle_stage'
ORDER BY sort;

SELECT
  c.lifecycle_stage as '阶段',
  COUNT(*) as '客户数量'
FROM customer c
GROUP BY c.lifecycle_stage
ORDER BY
  CASE c.lifecycle_stage
    WHEN '线索' THEN 1
    WHEN '意向客户' THEN 2
    WHEN '商机' THEN 3
    WHEN '成交客户' THEN 4
    WHEN '复购客户' THEN 5
    WHEN '流失客户' THEN 6
    ELSE 7
  END;
