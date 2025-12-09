-- 老师多校区功能数据库升级脚本

-- 1. 创建老师校区关联表
CREATE TABLE IF NOT EXISTS `teacher_campuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL COMMENT '老师ID',
  `campus_id` int NOT NULL COMMENT '校区ID',
  `is_primary` tinyint NOT NULL DEFAULT '0' COMMENT '是否为主要校区：0=否，1=是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teacher_campus` (`teacher_id`, `campus_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_campus_id` (`campus_id`),
  CONSTRAINT `fk_teacher_campuses_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_campuses_campus_id` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='老师校区关联表';

-- 2. 迁移现有数据：将现有老师的单个校区迁移到关联表
INSERT IGNORE INTO `teacher_campuses` (teacher_id, campus_id, is_primary, create_time, update_time)
SELECT
  id as teacher_id,
  campus_id,
  1 as is_primary,  -- 现有的校区设为主要校区
  create_time,
  update_time
FROM teachers
WHERE campus_id IS NOT NULL;

-- 3. 为teachers表添加多校区支持字段（可选，用于向后兼容）
-- ALTER TABLE teachers ADD COLUMN `campus_ids` text COMMENT '关联校区ID列表（JSON格式，仅用于查询缓存）' AFTER `campus_id`;

-- 4. 创建索引优化查询性能
CREATE INDEX idx_teacher_campuses_teacher_primary ON teacher_campuses(teacher_id, is_primary);
CREATE INDEX idx_teacher_campuses_campus_primary ON teacher_campuses(campus_id, is_primary);