-- 跟进提醒配置表
CREATE TABLE IF NOT EXISTS `follow_up_reminder_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用系统提醒：0-禁用，1-启用',
  `config` JSON NOT NULL COMMENT '各意向等级的配置JSON',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跟进提醒配置表';

-- 跟进提醒任务表
CREATE TABLE IF NOT EXISTS `follow_up_reminder_tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `customer_id` INT UNSIGNED NOT NULL COMMENT '客户ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '销售ID',
  `intention_level` VARCHAR(50) NOT NULL COMMENT '意向等级',
  `round_number` INT NOT NULL DEFAULT 1 COMMENT '第几轮跟进',
  `remind_date` DATE NOT NULL COMMENT '提醒日期',
  `remind_time` TIME DEFAULT '09:00:00' COMMENT '提醒时间',
  `remind_method` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '提醒方式：system-系统通知，homepage-工作台卡片，email-邮件通知',
  `message` TEXT NULL COMMENT '自定义提醒消息',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态：pending-待提醒，sent-已发送，completed-已完成，cancelled-已取消',
  `is_manual` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否手动设置：0-系统自动，1-手动设置',
  `sent_at` DATETIME NULL COMMENT '发送时间',
  `completed_at` DATETIME NULL COMMENT '完成时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_remind_date` (`remind_date`),
  KEY `idx_status` (`status`),
  KEY `idx_intention_level` (`intention_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跟进提醒任务表';

-- 插入默认配置
INSERT INTO `follow_up_reminder_config` (`enabled`, `config`) VALUES (
  1,
  JSON_OBJECT(
    '极高意向', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 1, 'message', '第1轮跟进：极高意向客户，建议优先联系'),
        JSON_OBJECT('intervalDays', 2, 'message', '第2轮跟进：持续关注'),
        JSON_OBJECT('intervalDays', 3, 'message', '第3轮跟进：保持联系'),
        JSON_OBJECT('intervalDays', 5, 'message', '第4轮跟进：再次跟进'),
        JSON_OBJECT('intervalDays', 7, 'message', '第5轮跟进：最后提醒')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    ),
    '高意向', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 2, 'message', '第1轮跟进：高意向客户'),
        JSON_OBJECT('intervalDays', 3, 'message', '第2轮跟进'),
        JSON_OBJECT('intervalDays', 5, 'message', '第3轮跟进'),
        JSON_OBJECT('intervalDays', 7, 'message', '第4轮跟进'),
        JSON_OBJECT('intervalDays', 10, 'message', '第5轮跟进')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    ),
    '中意向', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 3, 'message', '第1轮跟进：中意向客户'),
        JSON_OBJECT('intervalDays', 5, 'message', '第2轮跟进'),
        JSON_OBJECT('intervalDays', 7, 'message', '第3轮跟进'),
        JSON_OBJECT('intervalDays', 10, 'message', '第4轮跟进'),
        JSON_OBJECT('intervalDays', 15, 'message', '第5轮跟进')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    ),
    '低意向', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 5, 'message', '第1轮跟进：低意向客户'),
        JSON_OBJECT('intervalDays', 7, 'message', '第2轮跟进'),
        JSON_OBJECT('intervalDays', 10, 'message', '第3轮跟进'),
        JSON_OBJECT('intervalDays', 15, 'message', '第4轮跟进'),
        JSON_OBJECT('intervalDays', 20, 'message', '第5轮跟进')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    ),
    '无意向', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 7, 'message', '第1轮跟进：无意向客户'),
        JSON_OBJECT('intervalDays', 10, 'message', '第2轮跟进'),
        JSON_OBJECT('intervalDays', 15, 'message', '第3轮跟进'),
        JSON_OBJECT('intervalDays', 20, 'message', '第4轮跟进'),
        JSON_OBJECT('intervalDays', 30, 'message', '第5轮跟进')
      ),
      'reminderMethods', JSON_ARRAY('system')
    ),
    '待评估', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 1, 'message', '第1轮跟进：待评估客户，优先确认意向'),
        JSON_OBJECT('intervalDays', 3, 'message', '第2轮跟进'),
        JSON_OBJECT('intervalDays', 5, 'message', '第3轮跟进'),
        JSON_OBJECT('intervalDays', 7, 'message', '第4轮跟进'),
        JSON_OBJECT('intervalDays', 10, 'message', '第5轮跟进')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    ),
    '成交', JSON_OBJECT(
      'rounds', JSON_ARRAY(
        JSON_OBJECT('intervalDays', 15, 'message', '第1轮跟进：成交后回访'),
        JSON_OBJECT('intervalDays', 30, 'message', '第2轮跟进：1个月关怀'),
        JSON_OBJECT('intervalDays', 60, 'message', '第3轮跟进：2个月关怀'),
        JSON_OBJECT('intervalDays', 90, 'message', '第4轮跟进：3个月关怀'),
        JSON_OBJECT('intervalDays', 180, 'message', '第5轮跟进：半年关怀')
      ),
      'reminderMethods', JSON_ARRAY('system', 'homepage')
    )
  )
) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
