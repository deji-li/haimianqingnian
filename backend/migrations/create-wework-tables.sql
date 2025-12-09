-- 指定数据库
USE education_crm;

-- 创建企业微信配置表
CREATE TABLE IF NOT EXISTS wework_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  corp_id VARCHAR(64) NOT NULL COMMENT '企业ID',
  app_secret VARCHAR(255) NOT NULL COMMENT '应用Secret',
  token VARCHAR(255) NULL COMMENT '回调Token',
  aes_key VARCHAR(255) NULL COMMENT '回调AESKey',
  webhook_url VARCHAR(500) NULL COMMENT 'Webhook回调地址',
  api_access_token TEXT NULL COMMENT 'API访问令牌缓存',
  token_expire_time DATETIME NULL COMMENT 'Token过期时间',
  sync_strategy JSON NULL COMMENT '同步策略配置',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX idx_corp_id (corp_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业微信配置表';

-- 创建外部联系人表
CREATE TABLE IF NOT EXISTS wework_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  external_userid VARCHAR(64) NOT NULL UNIQUE COMMENT '外部联系人ID',
  name VARCHAR(100) NULL COMMENT '客户姓名',
  avatar VARCHAR(500) NULL COMMENT '头像URL',
  type ENUM('single', 'external') DEFAULT 'external' COMMENT '联系人类型',
  gender ENUM('unknown', 'male', 'female') DEFAULT 'unknown' COMMENT '性别',
  position VARCHAR(100) NULL COMMENT '职位',
  corp_name VARCHAR(255) NULL COMMENT '企业名称',
  external_profile JSON NULL COMMENT '对外资料信息',
  follow_user_id VARCHAR(64) NULL COMMENT '添加了此外部联系人的企业成员userid',
  remark VARCHAR(255) NULL COMMENT '备注',
  add_time DATETIME NULL COMMENT '添加时间',
  tags JSON NULL COMMENT '客户标签',
  customer_id INT NULL COMMENT '关联CRM客户ID',
  sync_time DATETIME NULL COMMENT '最后同步时间',
  sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX idx_external_userid (external_userid),
  INDEX idx_customer_id (customer_id),
  INDEX idx_sync_status (sync_status),
  INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业微信外部联系人表';

-- 创建同步日志表
CREATE TABLE IF NOT EXISTS wework_sync_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sync_type VARCHAR(50) COMMENT '同步类型：contact/chat/config',
  sync_direction VARCHAR(20) COMMENT '同步方向：crm_to_wework/wework_to_crm',
  total_count INT DEFAULT 0 COMMENT '总记录数',
  success_count INT DEFAULT 0 COMMENT '成功记录数',
  failed_count INT DEFAULT 0 COMMENT '失败记录数',
  sync_status VARCHAR(20) DEFAULT 'running' COMMENT '同步状态：running/completed/failed',
  start_time DATETIME NULL COMMENT '开始时间',
  end_time DATETIME NULL COMMENT '结束时间',
  duration_seconds INT NULL COMMENT '耗时（秒）',
  error_message TEXT NULL COMMENT '错误信息',
  sync_details JSON NULL COMMENT '同步详情',
  trigger_type VARCHAR(20) NULL COMMENT '触发类型：manual/scheduled/webhook',
  trigger_user_id VARCHAR(64) NULL COMMENT '触发用户ID',
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  INDEX idx_sync_type (sync_type),
  INDEX idx_sync_status (sync_status),
  INDEX idx_created_time (created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业微信同步日志表';

-- 为客户表添加企业微信相关字段
ALTER TABLE customers
ADD COLUMN wework_external_userid VARCHAR(64) NULL COMMENT '企业微信外部联系人ID',
ADD COLUMN wework_follow_userid VARCHAR(64) NULL COMMENT '企业微信跟进成员ID',
ADD COLUMN wework_tags JSON NULL COMMENT '企业微信客户标签',
ADD COLUMN wework_sync_time DATETIME NULL COMMENT '企业微信数据同步时间',
ADD COLUMN wework_chat_count INT DEFAULT 0 COMMENT '企业微信聊天记录数量',
ADD COLUMN wework_last_chat_time DATETIME NULL COMMENT '最后企业微信聊天时间',
ADD INDEX idx_wework_external_userid (wework_external_userid);