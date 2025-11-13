-- 创建业务配置表
CREATE TABLE IF NOT EXISTS `business_config` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` JSON NOT NULL COMMENT '配置值（JSON格式）',
  `config_category` VARCHAR(50) NOT NULL COMMENT '配置分类',
  `description` VARCHAR(500) NULL COMMENT '配置说明',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category` (`config_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务配置表';

-- 插入默认的意向评分规则配置
INSERT INTO `business_config` (`config_key`, `config_value`, `config_category`, `description`)
VALUES (
  'customer_intention_score_rules',
  JSON_OBJECT(
    'high', JSON_OBJECT('minScore', 80, 'label', '高意向', 'color', 'success'),
    'medium', JSON_OBJECT('minScore', 60, 'label', '中意向', 'color', 'warning'),
    'low', JSON_OBJECT('minScore', 40, 'label', '低意向', 'color', 'info'),
    'none', JSON_OBJECT('minScore', 0, 'label', '无意向', 'color', 'danger')
  ),
  'customer',
  '客户意向评分规则：根据意向评分(0-100)自动判定意向等级'
);

-- 插入AI字段映射配置
INSERT INTO `business_config` (`config_key`, `config_value`, `config_category`, `description`)
VALUES (
  'ai_field_mapping',
  JSON_ARRAY(
    JSON_OBJECT(
      'aiField', 'customerProfile.wechatNickname',
      'dbField', 'wechatNickname',
      'enabled', true,
      'overwrite', false,
      'description', '微信昵称（从聊天截图识别）'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.parentRole',
      'dbField', 'parentRole',
      'enabled', true,
      'overwrite', true,
      'description', '家长身份（妈妈/爸爸/爷爷奶奶）'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.location',
      'dbField', 'location',
      'enabled', true,
      'overwrite', true,
      'description', '所在地区/城市'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.studentGrade',
      'dbField', 'studentGrade',
      'enabled', true,
      'overwrite', true,
      'description', '学生年级'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.studentAge',
      'dbField', 'studentAge',
      'enabled', true,
      'overwrite', true,
      'description', '学生年龄'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.familyEconomicLevel',
      'dbField', 'familyEconomicLevel',
      'enabled', true,
      'overwrite', true,
      'description', '家庭经济水平（高/中/低）'
    ),
    JSON_OBJECT(
      'aiField', 'customerProfile.decisionMakerRole',
      'dbField', 'decisionMakerRole',
      'enabled', true,
      'overwrite', true,
      'description', '决策者角色'
    ),
    JSON_OBJECT(
      'aiField', 'estimatedValue',
      'dbField', 'estimatedValue',
      'enabled', true,
      'overwrite', true,
      'description', '预估成交金额'
    ),
    JSON_OBJECT(
      'aiField', 'qualityLevel',
      'dbField', 'qualityLevel',
      'enabled', true,
      'overwrite', true,
      'description', '质量等级（A/B/C/D）'
    )
  ),
  'ai',
  'AI字段映射配置：控制AI识别结果如何填充到数据库字段'
);
