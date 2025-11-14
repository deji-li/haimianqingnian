-- Migration: Add Order Sync Fields
-- Date: 2025-11-14
-- Description: 添加订单同步功能所需的数据库字段和表

-- ========== 1. 客户表（customers）新增字段 ==========
ALTER TABLE customers
ADD COLUMN external_order_ids JSON COMMENT '关联的外部订单ID列表，如["20227343","20228888"]';

-- ========== 2. 订单表（orders）新增字段 ==========
-- 添加外部订单标识字段
ALTER TABLE orders
ADD COLUMN is_external TINYINT NOT NULL DEFAULT 0 COMMENT '是否外部订单：0=否，1=是',
ADD INDEX idx_is_external (is_external);

-- 添加外部系统标识
ALTER TABLE orders
ADD COLUMN external_system VARCHAR(50) NULL COMMENT '来源系统标识（如：HAIMIAN）',
ADD INDEX idx_external_system (external_system);

-- 添加海绵原始状态值
ALTER TABLE orders
ADD COLUMN external_status INT NULL COMMENT '海绵系统原始状态值（1-9）';

-- 添加海绵退款标识
ALTER TABLE orders
ADD COLUMN external_refund INT NULL COMMENT '海绵退款标识：0=默认 1=申请退款 2=已退款 3=不予退款';

-- 添加海绵退款状态
ALTER TABLE orders
ADD COLUMN external_refund_status INT NULL COMMENT '海绵退款状态：0=默认 1=通过 2=驳回';

-- 添加同步状态
ALTER TABLE orders
ADD COLUMN sync_status ENUM('未同步', '已同步', '同步失败') NOT NULL DEFAULT '未同步' COMMENT '同步状态',
ADD INDEX idx_sync_status (sync_status);

-- 添加最后同步时间
ALTER TABLE orders
ADD COLUMN last_sync_time DATETIME NULL COMMENT '最后同步时间',
ADD INDEX idx_last_sync_time (last_sync_time);

-- 添加删除标记
ALTER TABLE orders
ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '外部系统是否删除：0=否，1=是';

-- 修改data_source枚举，增加'海绵青年GO'
ALTER TABLE orders
MODIFY COLUMN data_source ENUM('手工录入', '小程序导入', '海绵青年GO') NOT NULL DEFAULT '手工录入';

-- ========== 3. 创建订单同步日志表（order_sync_logs）==========
CREATE TABLE IF NOT EXISTS order_sync_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  sync_batch_id VARCHAR(50) NULL COMMENT '同步批次ID（UUID）',
  order_no VARCHAR(50) NOT NULL COMMENT '订单号',
  sync_type VARCHAR(20) NOT NULL COMMENT '同步类型：create-新建, update-更新, skip-跳过, delete-删除',
  old_status VARCHAR(50) NULL COMMENT '更新前的订单状态',
  new_status VARCHAR(50) NULL COMMENT '更新后的订单状态',
  changes JSON NULL COMMENT '变更字段详情（JSON格式）',
  external_data JSON NULL COMMENT '海绵原始数据快照（JSON格式）',
  sync_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
  result VARCHAR(20) NOT NULL COMMENT '同步结果：success-成功, failed-失败',
  error_message TEXT NULL COMMENT '错误信息',
  execution_time INT NULL COMMENT '执行耗时（毫秒）',
  INDEX idx_sync_batch_id (sync_batch_id),
  INDEX idx_order_no (order_no),
  INDEX idx_sync_time (sync_time),
  INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单同步日志表';

-- ========== 4. 业务配置表（business_config）插入配置项 ==========
INSERT INTO business_config (category, config_key, config_value, config_name, remark, create_time, update_time) VALUES
('order_sync', 'order_sync.api_key', '12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT', 'API密钥', '海绵系统API密钥', NOW(), NOW()),
('order_sync', 'order_sync.api_url', 'https://yx.vipstore.top/yoga/admin/getGoodsOrderList', 'API地址', '海绵订单列表接口地址', NOW(), NOW()),
('order_sync', 'order_sync.default_sales_id', '1', '默认销售ID', '外部订单默认分配的销售人员ID', NOW(), NOW()),
('order_sync', 'order_sync.enabled', 'true', '启用自动同步', '是否启用定时自动同步', NOW(), NOW()),
('order_sync', 'order_sync.interval', '30', '同步间隔(分钟)', '定时同步的时间间隔，建议10-60分钟', NOW(), NOW()),
('order_sync', 'order_sync.daily_update_time', '02:00', '每日批量更新时间', '每天批量更新订单状态的时间，建议凌晨执行', NOW(), NOW()),
('order_sync', 'order_sync.sync_range_days', '7', '增量同步天数', '定时同步时拉取最近N天的订单，建议3-7天', NOW(), NOW()),
('order_sync', 'order_sync.batch_size', '100', '每批次同步数量', '每次同步处理的订单数量，建议50-200', NOW(), NOW()),
('order_sync', 'order_sync.update_existing', 'true', '更新已存在订单', '是否更新已同步的订单（关闭则只创建新订单）', NOW(), NOW()),
('order_sync', 'order_sync.sync_customer_info', 'true', '同步客户信息', '是否将订单中的手机号、昵称等信息补充到客户档案', NOW(), NOW()),
('order_sync', 'order_sync.auto_create_campus', 'true', '自动创建校区', '遇到不存在的校区时是否自动创建', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  config_value = VALUES(config_value),
  update_time = NOW();

-- Migration completed successfully
