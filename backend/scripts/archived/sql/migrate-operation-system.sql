-- ========================================
-- 运营管理系统数据库升级脚本
-- 创建时间：2025-01-21
-- 功能：账号管理 + 日报优化 + 运营-客户数据打通
-- ========================================

-- ==================== 第一部分：运营账号表优化 ====================

-- 检查表是否存在，不存在则创建
CREATE TABLE IF NOT EXISTS operation_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform_type ENUM('小红书', '抖音', '视频号') NOT NULL COMMENT '平台类型',
  account_name VARCHAR(100) NOT NULL COMMENT '账号名称',
  account_id VARCHAR(100) NULL COMMENT '账号ID/链接',
  campus_id INT NOT NULL COMMENT '关联校区ID',
  operator_id INT NOT NULL COMMENT '负责运营人员ID',
  account_type VARCHAR(50) DEFAULT '专业号' COMMENT '账号类型',
  status ENUM('正常', '风险', '封号', '掉号') DEFAULT '正常' COMMENT '账号状态',
  fans_count INT DEFAULT 0 COMMENT '粉丝量',
  total_likes INT DEFAULT 0 COMMENT '总点赞量',
  last_update_time DATETIME NULL COMMENT '数据最后更新时间',
  remark TEXT NULL COMMENT '备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_operator (operator_id),
  INDEX idx_campus (campus_id),
  INDEX idx_platform (platform_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营账号表';

-- ==================== 第二部分：运营日报表重构 ====================

-- 备份旧日报表数据（如果存在）
CREATE TABLE IF NOT EXISTS operation_daily_records_backup_20250121
SELECT * FROM operation_daily_records;

-- 删除旧表（谨慎操作）
-- DROP TABLE IF EXISTS operation_daily_records;

-- 创建新的日报表结构
CREATE TABLE IF NOT EXISTS operation_daily_records_new (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_date DATE NOT NULL COMMENT '日报日期',
  account_id INT NOT NULL COMMENT '账号ID',
  operator_id INT NOT NULL COMMENT '运营人员ID',

  -- 更新情况
  update_frequency VARCHAR(20) NULL COMMENT '更新频率（如"2更"）',
  content_types JSON NULL COMMENT '内容类型标签（JSON数组）',

  -- 流量数据
  view_min INT DEFAULT 0 COMMENT '浏览量最小值',
  view_max INT DEFAULT 0 COMMENT '浏览量最大值',
  play_min INT DEFAULT 0 COMMENT '播放量最小值',
  play_max INT DEFAULT 0 COMMENT '播放量最大值',
  comment_min INT DEFAULT 0 COMMENT '评论数最小值',
  comment_max INT DEFAULT 0 COMMENT '评论数最大值',
  like_min INT DEFAULT 0 COMMENT '点赞数最小值',
  like_max INT DEFAULT 0 COMMENT '点赞数最大值',
  message_min INT DEFAULT 0 COMMENT '私信数最小值',
  message_max INT DEFAULT 0 COMMENT '私信数最大值',

  -- 转化数据
  group_join_count INT DEFAULT 0 COMMENT '进群人数',
  fans_increment INT DEFAULT 0 COMMENT '新增粉丝数',
  today_fans_total INT DEFAULT 0 COMMENT '今日粉丝总数',
  new_customer_count INT DEFAULT 0 COMMENT '新增客户数（统计字段）',

  -- 异常情况
  account_status_changed TINYINT DEFAULT 0 COMMENT '账号状态是否变化',
  new_status ENUM('正常', '风险', '封号', '掉号') NULL COMMENT '新状态',
  has_exception TINYINT DEFAULT 0 COMMENT '是否有异常',
  exception_type VARCHAR(100) NULL COMMENT '异常类型',

  remark TEXT NULL COMMENT '备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY uk_account_date (account_id, report_date),
  INDEX idx_operator (operator_id),
  INDEX idx_date (report_date),
  INDEX idx_account (account_id),
  FOREIGN KEY (account_id) REFERENCES operation_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营日报表';

-- 数据迁移：将旧表数据迁移到新表（如果旧表存在且有数据）
-- INSERT INTO operation_daily_records_new (
--   report_date, account_id, operator_id,
--   view_min, view_max, play_min, play_max,
--   comment_min, comment_max, message_min, message_max,
--   account_status_changed, new_status, remark,
--   create_time, update_time
-- )
-- SELECT
--   report_date, account_id, operator_id,
--   view_min, view_max, play_min, play_max,
--   comment_min, comment_max, message_min, message_max,
--   account_status_changed, new_status, remark,
--   create_time, update_time
-- FROM operation_daily_records_backup_20250121;

-- 重命名表（数据迁移完成后执行）
-- RENAME TABLE operation_daily_records TO operation_daily_records_old,
--              operation_daily_records_new TO operation_daily_records;

-- ==================== 第三部分：客户表扩展 ====================

-- 检查customers表是否存在operator_id字段，如果不存在则添加
-- ALTER TABLE customers
-- ADD COLUMN IF NOT EXISTS operator_id INT NULL COMMENT '引流运营人员ID' AFTER sales_id;

-- 添加索引
-- ALTER TABLE customers ADD INDEX IF NOT EXISTS idx_operator (operator_id);

-- 如果需要关联具体账号（可选）
-- ALTER TABLE customers
-- ADD COLUMN IF NOT EXISTS traffic_account_id INT NULL COMMENT '来源运营账号ID（可选）' AFTER operator_id;

-- ALTER TABLE customers ADD INDEX IF NOT EXISTS idx_traffic_account (traffic_account_id);

-- ==================== 第四部分：日报模板表（新增） ====================

CREATE TABLE IF NOT EXISTS operation_report_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  operator_id INT NOT NULL COMMENT '运营人员ID',
  template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
  platform_type ENUM('小红书', '抖音', '视频号') NULL COMMENT '平台类型',
  update_frequency VARCHAR(20) NULL COMMENT '更新频率',
  content_types JSON NULL COMMENT '内容类型标签',
  view_min INT DEFAULT 0 COMMENT '浏览量最小值',
  view_max INT DEFAULT 0 COMMENT '浏览量最大值',
  play_min INT DEFAULT 0 COMMENT '播放量最小值',
  play_max INT DEFAULT 0 COMMENT '播放量最大值',
  comment_min INT DEFAULT 0 COMMENT '评论数最小值',
  comment_max INT DEFAULT 0 COMMENT '评论数最大值',
  message_min INT DEFAULT 0 COMMENT '私信数最小值',
  message_max INT DEFAULT 0 COMMENT '私信数最大值',
  is_default TINYINT DEFAULT 0 COMMENT '是否默认模板',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营日报模板表';

-- ==================== 第五部分：插入预设内容标签字典 ====================

-- 添加运营内容标签字典
INSERT INTO dictionaries (category, dict_key, dict_value, sort_order, remark) VALUES
('operation_content_tags', 'course_schedule', '拍课表', 1, '运营内容类型'),
('operation_content_tags', 'schedule', '课表', 2, '运营内容类型'),
('operation_content_tags', 'cover_image', '生成封面', 3, '运营内容类型'),
('operation_content_tags', 'table_schedule', '表格课表', 4, '运营内容类型'),
('operation_content_tags', 'area_schedule', '区域课表', 5, '运营内容类型'),
('operation_content_tags', 'live_video', '真人出镜', 6, '运营内容类型'),
('operation_content_tags', 'pure_image', '纯图文', 7, '运营内容类型'),
('operation_content_tags', 'video_editing', '视频剪辑', 8, '运营内容类型'),
('operation_content_tags', 'business_district', '商圈推广', 9, '运营内容类型'),
('operation_content_tags', 'popular_course', '热门课程', 10, '运营内容类型'),
('operation_content_tags', 'new_campus', '新校区宣传', 11, '运营内容类型')
ON DUPLICATE KEY UPDATE dict_value=VALUES(dict_value);

-- ==================== 第六部分：插入示例数据（可选） ====================

-- 示例：添加运营账号
-- INSERT INTO operation_accounts
-- (platform_type, account_name, account_id, campus_id, operator_id, account_type, status, fans_count, total_likes, remark)
-- VALUES
-- ('小红书', '广州小红书专业号01', 'xhs_gz_01', 1, 5, '专业号', '正常', 1200, 5600, '广州主账号'),
-- ('小红书', '广州小红书专业号02', 'xhs_gz_02', 1, 5, '专业号', '正常', 800, 3200, '广州副账号'),
-- ('抖音', '广州抖音官方账号', 'dy_gz_01', 1, 5, '企业号', '正常', 5000, 12000, '广州抖音主账号'),
-- ('视频号', '广州视频号', 'sph_gz_01', 1, 5, '企业号', '正常', 2000, 8000, '广州视频号');

-- 示例：添加常用模板
-- INSERT INTO operation_report_templates
-- (operator_id, template_name, platform_type, update_frequency, content_types, view_min, view_max, message_min, message_max)
-- VALUES
-- (5, '小红书日常2更', '小红书', '2更', '["拍课表", "课表", "封面"]', 50, 300, 3, 5),
-- (5, '抖音日常1更', '抖音', '1更', '["视频剪辑", "热门课程"]', 50, 100, 1, 2),
-- (5, '视频号周更', '视频号', '2更', '["真人出镜", "课程宣传"]', 300, 500, 1, 2);

-- ==================== 第七部分：视图创建 ====================

-- 创建运营效果统计视图
CREATE OR REPLACE VIEW v_operation_account_stats AS
SELECT
  oa.id AS account_id,
  oa.account_name,
  oa.platform_type,
  oa.operator_id,
  u.real_name AS operator_name,
  c.name AS campus_name,
  oa.status,
  oa.fans_count,
  oa.total_likes,

  -- 统计最近30天的数据
  COUNT(DISTINCT odr.id) AS report_count_30d,
  COALESCE(SUM(odr.view_max), 0) AS total_views_30d,
  COALESCE(SUM(odr.message_max), 0) AS total_messages_30d,
  COALESCE(SUM(odr.group_join_count), 0) AS total_group_joins_30d,
  COALESCE(SUM(odr.fans_increment), 0) AS total_fans_increment_30d,

  -- 统计引流客户数
  (SELECT COUNT(*) FROM customers WHERE operator_id = oa.operator_id) AS total_customers,
  (SELECT COUNT(*) FROM customers
   WHERE operator_id = oa.operator_id
   AND create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS new_customers_30d

FROM operation_accounts oa
LEFT JOIN users u ON oa.operator_id = u.id
LEFT JOIN campus c ON oa.campus_id = c.id
LEFT JOIN operation_daily_records odr ON oa.id = odr.account_id
  AND odr.report_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY oa.id, oa.account_name, oa.platform_type, oa.operator_id,
  u.real_name, c.name, oa.status, oa.fans_count, oa.total_likes;

-- ==================== 脚本执行说明 ====================
-- 1. 本脚本包含表结构创建、数据迁移、字典数据插入
-- 2. 部分语句已注释，请根据实际情况取消注释执行
-- 3. 执行前请务必备份数据库
-- 4. 建议在测试环境先执行验证
-- 5. operation_daily_records表的重命名需要在数据迁移完成后手动执行

-- 检查执行结果
SELECT '运营账号表检查' AS step, COUNT(*) AS count FROM operation_accounts;
SELECT '运营日报表检查' AS step, COUNT(*) AS count FROM operation_daily_records_new;
SELECT '日报模板表检查' AS step, COUNT(*) AS count FROM operation_report_templates;
SELECT '内容标签字典检查' AS step, COUNT(*) AS count FROM dictionaries WHERE category = 'operation_content_tags';
