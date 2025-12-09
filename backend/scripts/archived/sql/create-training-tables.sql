-- 创建训练剧本表
CREATE TABLE IF NOT EXISTS `training_scripts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '剧本标题',
  `scenario` varchar(100) NOT NULL COMMENT '场景',
  `difficulty` enum('简单','普通','困难') NOT NULL DEFAULT '普通' COMMENT '难度等级',
  `source_type` enum('AI生成','手动创建','聊天记录') NOT NULL DEFAULT 'AI生成' COMMENT '来源类型',
  `source_chat_id` int DEFAULT NULL COMMENT '来源聊天记录ID',
  `customer_background` text NOT NULL COMMENT '客户背景信息',
  `training_goal` text NOT NULL COMMENT '训练目标',
  `key_objections` json DEFAULT NULL COMMENT '关键异议点',
  `standard_scripts` json DEFAULT NULL COMMENT '标准话术',
  `dialogue_flow` json DEFAULT NULL COMMENT '对话流程模板',
  `max_rounds` int NOT NULL DEFAULT 10 COMMENT '建议轮次',
  `objection_count` int NOT NULL DEFAULT 0 COMMENT '异议数量',
  `status` enum('草稿','已发布','已下架') NOT NULL DEFAULT '草稿',
  `creator_id` int DEFAULT NULL COMMENT '创建人ID',
  `creator_type` varchar(50) NOT NULL DEFAULT '系统' COMMENT '创建人类型',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '使用次数',
  `avg_score` decimal(3,1) DEFAULT NULL COMMENT '平均得分',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_scenario` (`scenario`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI培训剧本';

-- 创建训练评估详情表
CREATE TABLE IF NOT EXISTS `training_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `training_id` int NOT NULL COMMENT '关联的训练记录ID',
  `dimension` varchar(50) NOT NULL COMMENT '评估维度',
  `score` decimal(3,1) NOT NULL COMMENT '该维度得分',
  `comment` text COMMENT '评价内容',
  `good_examples` json DEFAULT NULL COMMENT '优秀话术示例',
  `bad_examples` json DEFAULT NULL COMMENT '待改进话术示例',
  `suggestions` json DEFAULT NULL COMMENT '改进建议',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_training_id` (`training_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='训练评估详情';

-- 插入一些示例训练剧本数据
INSERT IGNORE INTO `training_scripts` (`id`, `title`, `scenario`, `difficulty`, `source_type`, `customer_background`, `training_goal`, `key_objections`, `max_rounds`, `objection_count`, `status`) VALUES
(1, '首次接触-理性型客户', '首次接触', '普通', 'AI生成', '客户是一位教育行业从业者，注重数据和效果，对价格较为敏感', '学习如何快速建立信任，挖掘客户需求', '["价格太贵", "需要考虑", "货比三家"]', 8, 3, '已发布'),
(2, '价格谈判-挑剔型客户', '价格谈判', '困难', 'AI生成', '客户对产品细节要求很高，会挑刺，需要大量的证明和案例支持', '掌握处理价格异议的技巧，学会展示价值而非降价', '["你们价格比竞品贵", "没有看到价值", "为什么要选你们", "优惠力度不够"]', 12, 5, '已发布'),
(3, '需求挖掘-犹豫型客户', '需求挖掘', '普通', 'AI生成', '客户犹豫不决，需要时间考虑，担心做错决定', '学习如何引导客户表达真实需求，帮助客户下决心', '["我再想想", "不确定是否合适", "有点担心"]', 10, 3, '已发布'),
(4, '促成签单-情感型客户', '促成签单', '简单', 'AI生成', '客户重视感受、口碑和服务态度，容易被情感打动', '掌握临门一脚的技巧，学会用情感和服务打动客户', '["担心售后", "听说有人投诉"]', 6, 2, '已发布');
