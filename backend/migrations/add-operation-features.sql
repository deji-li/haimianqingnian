-- 运营客户转化记录表
CREATE TABLE IF NOT EXISTS operation_customer_conversions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT '客户ID',
  operator_id INT NOT NULL COMMENT '运营人员ID',
  traffic_platform VARCHAR(50) COMMENT '流量平台（小红书、抖音、视频号）',
  traffic_city VARCHAR(50) COMMENT '流量城市',
  conversion_stage VARCHAR(50) DEFAULT '引流' COMMENT '转化阶段（引流、初步接触、深度咨询、试听体验、成交转化）',
  conversion_time DATETIME COMMENT '转化时间',
  notes TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  INDEX idx_operator_id (operator_id),
  INDEX idx_conversion_stage (conversion_stage),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营客户转化记录表';

-- 运营通知表
CREATE TABLE IF NOT EXISTS operation_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  operator_id INT NOT NULL COMMENT '运营人员ID',
  customer_id INT NULL COMMENT '关联客户ID',
  order_id INT NULL COMMENT '关联订单ID',
  type ENUM('conversion', 'reminder', 'alert') NOT NULL COMMENT '通知类型',
  title VARCHAR(255) NOT NULL COMMENT '通知标题',
  content TEXT COMMENT '通知内容',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operator_id (operator_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营通知表';

-- 为运营账号表添加额外字段
ALTER TABLE operation_accounts
ADD COLUMN last_post_date DATE NULL COMMENT '最后发布日期',
ADD COLUMN avg_views INT DEFAULT 0 COMMENT '平均浏览量',
ADD COLUMN engagement_rate DECIMAL(5,2) DEFAULT 0 COMMENT '互动率（百分比）',
ADD COLUMN total_comments INT DEFAULT 0 COMMENT '总评论数',
ADD COLUMN total_messages INT DEFAULT 0 COMMENT '总私信数',
ADD COLUMN account_link VARCHAR(500) NULL COMMENT '账号链接';

-- 为提成记录表添加订单标签字段
ALTER TABLE operation_commission_records
ADD COLUMN order_tags VARCHAR(100) NULL COMMENT '订单标签';

-- 添加索引优化查询性能
ALTER TABLE operation_daily_records
ADD INDEX idx_report_date (report_date),
ADD INDEX idx_operator_date (operator_id, report_date);

ALTER TABLE operation_commission_records
ADD INDEX idx_operator_status (operator_id, status),
ADD INDEX idx_created_date (create_time);

-- 客户表添加运营相关索引
ALTER TABLE customers
ADD INDEX idx_operator_created (operator_id, create_time);

-- 订单表添加运营相关索引
ALTER TABLE orders
ADD INDEX idx_customer_created (customer_id, create_time);