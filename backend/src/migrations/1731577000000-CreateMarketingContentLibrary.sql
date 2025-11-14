-- 营销文案库表
CREATE TABLE IF NOT EXISTS `ai_marketing_content_library` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT NOT NULL COMMENT '创建用户ID',
  `content_type` VARCHAR(50) NOT NULL COMMENT '文案类型：朋友圈文案、微信群发、抖音、小红书、短视频脚本、公众号',
  `title` VARCHAR(200) NOT NULL COMMENT '文案标题',
  `content` TEXT NOT NULL COMMENT '文案内容',
  `pain_points` JSON NULL COMMENT '关联的痛点',
  `interest_points` JSON NULL COMMENT '关联的兴趣点',
  `generation_params` JSON NULL COMMENT '生成参数（用于重新生成）',
  `purpose` VARCHAR(50) NULL COMMENT '发圈目的：引流获客、促进成交、品牌宣传等',
  `style` VARCHAR(50) NULL COMMENT '风格：专业严谨、轻松幽默、温馨亲切等',
  `word_count` VARCHAR(50) NULL COMMENT '字数要求',
  `tags` JSON NULL COMMENT '标签数组，如["高意向客户","价格敏感"]',
  `use_count` INT DEFAULT 0 COMMENT '使用次数',
  `last_used_time` DATETIME NULL COMMENT '最后使用时间',
  `is_favorite` TINYINT DEFAULT 0 COMMENT '是否收藏：0-否，1-是',
  `category` VARCHAR(50) NULL COMMENT '自定义分类',
  `remark` TEXT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_is_favorite` (`is_favorite`),
  KEY `idx_category` (`category`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI营销文案库';

-- 文案使用记录表（可选，用于详细追踪）
CREATE TABLE IF NOT EXISTS `ai_marketing_content_usage` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `content_id` INT NOT NULL COMMENT '文案ID',
  `user_id` INT NOT NULL COMMENT '使用用户ID',
  `customer_id` INT NULL COMMENT '关联客户ID（可选）',
  `usage_channel` VARCHAR(50) NULL COMMENT '使用渠道：微信、抖音、小红书等',
  `usage_result` VARCHAR(50) NULL COMMENT '使用效果：已发送、客户回复、无回应等',
  `usage_remark` TEXT NULL COMMENT '使用备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
  PRIMARY KEY (`id`),
  KEY `idx_content_id` (`content_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='营销文案使用记录';

-- 插入示例数据
INSERT INTO `ai_marketing_content_library` (`user_id`, `content_type`, `title`, `content`, `pain_points`, `interest_points`, `purpose`, `style`, `word_count`, `tags`, `category`) VALUES
(1, '朋友圈文案', '孩子注意力不集中？这个方法太实用了！', '很多家长跟我反馈，孩子写作业总是坐不住，东看看西摸摸...\n\n其实，注意力是可以训练的！✨\n\n我们的专注力提升课程，已经帮助300+孩子改善了这个问题：\n✅ 科学训练方法，每天15分钟\n✅ 游戏化设计，孩子爱学\n✅ 3周见效，家长放心\n\n本周报名立减300元！\n名额有限，先到先得👇', '["孩子注意力不集中","写作业拖拉"]', '["提升专注力","科学训练方法"]', '引流获客', '温馨亲切', '100-200字', '["高意向客户","注意力问题"]', '教育培训'),
(1, '微信群发文案', '【限时优惠】暑期课程早鸟价来啦', '亲爱的家长朋友们：\n\n暑假马上就要到了，您是否在为孩子的暑期安排发愁？\n\n我们的暑期集训营现已开始报名：\n📚 数学思维提升班\n📚 阅读写作强化班\n📚 英语口语特训班\n\n早鸟优惠：前50名享8折！\n报名截止：本周五\n\n详情咨询请回复"1"', '["暑期安排困难","学习进度落后"]', '["课程效果","优惠活动"]', '促进成交', '专业严谨', '100-200字', '["暑期课程","限时优惠"]', '促销活动');
