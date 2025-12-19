-- ============================================
-- AI话术助手数据库初始化脚本
-- ============================================

-- 1. 创建场景表
CREATE TABLE IF NOT EXISTS `ai_script_scenario` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '场景ID',
  `functionType` enum('deal_assist','reply_assist','script_polish','opening_lines') NOT NULL COMMENT '功能类型',
  `scenarioName` varchar(50) NOT NULL COMMENT '场景名称',
  `sceneCategory` varchar(50) DEFAULT NULL COMMENT '映射到知识库的sceneCategory',
  `scenarioDesc` text COMMENT '场景描述',
  `sortOrder` int DEFAULT '0' COMMENT '排序',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术助手-场景表';

-- 2. 创建技巧表
CREATE TABLE IF NOT EXISTS `ai_script_technique` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '技巧ID',
  `scenarioId` int NOT NULL COMMENT '关联场景ID',
  `techniqueName` varchar(50) NOT NULL COMMENT '技巧名称',
  `techniqueDesc` text COMMENT '技巧描述',
  `promptTemplate` text COMMENT '提示词模板',
  `sortOrder` int DEFAULT '0' COMMENT '排序',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_scenario_id` (`scenarioId`),
  CONSTRAINT `fk_technique_scenario` FOREIGN KEY (`scenarioId`) REFERENCES `ai_script_scenario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术助手-技巧表';

-- 3. 创建对话表
CREATE TABLE IF NOT EXISTS `ai_script_conversation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '对话ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `customerId` int DEFAULT NULL COMMENT '客户ID',
  `functionType` enum('deal_assist','reply_assist','script_polish','opening_lines') NOT NULL COMMENT '功能类型',
  `scenarioId` int DEFAULT NULL COMMENT '场景ID',
  `techniqueId` int DEFAULT NULL COMMENT '技巧ID',
  `title` varchar(100) DEFAULT NULL COMMENT '对话标题',
  `lastMessageTime` datetime DEFAULT NULL COMMENT '最后消息时间',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '是否活跃',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_customer_id` (`customerId`),
  KEY `idx_function_type` (`functionType`),
  KEY `idx_scenario_id` (`scenarioId`),
  KEY `idx_technique_id` (`techniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术助手-对话表';

-- 4. 创建消息表
CREATE TABLE IF NOT EXISTS `ai_script_message` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversationId` int NOT NULL COMMENT '对话ID',
  `role` enum('user','assistant','system') NOT NULL COMMENT '角色',
  `content` text NOT NULL COMMENT '消息内容',
  `thinkingProcess` text COMMENT '思考过程',
  `knowledgeSource` json DEFAULT NULL COMMENT '知识来源',
  `sourceType` varchar(50) DEFAULT NULL COMMENT '来源类型',
  `suggestions` json DEFAULT NULL COMMENT '建议',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversationId`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversationId`) REFERENCES `ai_script_conversation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术助手-消息表';

-- 5. 创建反馈表
CREATE TABLE IF NOT EXISTS `ai_script_feedback` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `messageId` int NOT NULL COMMENT '消息ID',
  `feedbackType` enum('like','dislike') NOT NULL COMMENT '反馈类型',
  `feedbackReason` text COMMENT '反馈原因',
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`messageId`),
  CONSTRAINT `fk_feedback_message` FOREIGN KEY (`messageId`) REFERENCES `ai_script_message` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术助手-反馈表';

-- ============================================
-- 初始化场景和技巧数据
-- ============================================

-- 清空已有数据（如果需要重新初始化）
DELETE FROM `ai_script_feedback`;
DELETE FROM `ai_script_message`;
DELETE FROM `ai_script_conversation`;
DELETE FROM `ai_script_technique`;
DELETE FROM `ai_script_scenario`;

-- 插入场景数据
INSERT INTO `ai_script_scenario` (functionType, scenarioName, sceneCategory, scenarioDesc, sortOrder, isActive) VALUES
-- 帮你谈单
('deal_assist', '首次接触', 'GENERAL_GUIDE', '客户首次咨询时的谈单场景', 1, 1),
('deal_assist', '需求挖掘', 'GENERAL_GUIDE', '深入了解客户需求和痛点', 2, 1),
('deal_assist', '方案介绍', 'GENERAL_GUIDE', '向客户介绍解决方案', 3, 1),
('deal_assist', '价格谈判', 'OBJECTION_HANDLING', '处理客户的价格异议', 4, 1),
('deal_assist', '临门一脚', 'GENERAL_GUIDE', '促成最后的签单', 5, 1),

-- 帮你回复
('reply_assist', '价格异议', 'OBJECTION_HANDLING', '客户对价格提出异议', 1, 1),
('reply_assist', '效果质疑', 'OBJECTION_HANDLING', '客户质疑产品或服务效果', 2, 1),
('reply_assist', '对比竞品', 'OBJECTION_HANDLING', '客户拿竞品进行对比', 3, 1),
('reply_assist', '服务咨询', 'GENERAL_GUIDE', '客户咨询具体服务内容', 4, 1),
('reply_assist', '售后问题', 'OBJECTION_HANDLING', '处理售后相关问题', 5, 1),

-- 话术润色
('script_polish', '简洁优化', 'GENERAL_GUIDE', '让话术更加简洁明了', 1, 1),
('script_polish', '专业提升', 'GENERAL_GUIDE', '提升话术的专业度', 2, 1),
('script_polish', '亲和力强化', 'GENERAL_GUIDE', '增强话术的亲和力', 3, 1),

-- 开场白生成
('opening_lines', '电话开场', 'GENERAL_GUIDE', '电话销售的开场白', 1, 1),
('opening_lines', '微信开场', 'GENERAL_GUIDE', '微信沟通的开场白', 2, 1),
('opening_lines', '面访开场', 'GENERAL_GUIDE', '面对面拜访的开场白', 3, 1);

-- 插入技巧数据（为每个场景添加具体技巧）
INSERT INTO `ai_script_technique` (scenarioId, techniqueName, techniqueDesc, promptTemplate, sortOrder, isActive) VALUES
-- 首次接触的技巧
(1, 'SPIN提问法', '运用SPIN销售法进行首次接触', '使用SPIN销售法（情境S、问题P、暗示I、需求-效益N）来引导客户', 1, 1),
(1, '建立信任', '快速建立客户信任关系', '通过专业知识展示和同理心表达快速建立信任', 2, 1),
(1, '需求探索', '初步了解客户需求', '通过开放式提问探索客户的基本需求', 3, 1),

-- 需求挖掘的技巧
(2, '深度提问', '深入挖掘客户痛点', '通过多层次提问挖掘客户的真实需求和痛点', 1, 1),
(2, '场景化引导', '通过场景引导客户思考', '描述具体使用场景，引导客户思考自身需求', 2, 1),
(2, '案例对照', '用成功案例激发需求', '分享类似客户的成功案例，激发需求认同', 3, 1),

-- 方案介绍的技巧
(3, 'FAB法则', '特征-优势-利益展示', '按照特征(Feature)-优势(Advantage)-利益(Benefit)的顺序介绍', 1, 1),
(3, '价值聚焦', '聚焦客户最关心的价值', '重点强调能解决客户核心问题的价值点', 2, 1),
(3, '差异化对比', '突出我们的独特优势', '与市场其他方案对比，突出我们的差异化优势', 3, 1),

-- 价格谈判的技巧
(4, '价值锚定', '先建立价值认知再谈价格', '先充分展示价值，让客户认同价值后再谈价格', 1, 1),
(4, '成本分解', '将价格分解到具体成本', '把价格分解到单位时间或单位效益，降低价格敏感度', 2, 1),
(4, '附加价值', '通过增值服务平衡价格', '提供额外的增值服务来平衡价格差异', 3, 1),

-- 临门一脚的技巧
(5, '紧迫感营造', '营造促单的紧迫感', '通过限时优惠、名额有限等方式营造紧迫感', 1, 1),
(5, '风险规避', '消除客户的决策顾虑', '提供保障措施，消除客户的购买风险顾虑', 2, 1),
(5, '阶梯式成交', '降低决策门槛', '提供小额试用或分期方案，降低决策门槛', 3, 1),

-- 价格异议的技巧
(6, '价值重述', '重新强调产品价值', '再次强调产品能带来的价值和收益', 1, 1),
(6, 'ROI分析', '投资回报率分析', '帮客户算账，展示投资回报比', 2, 1),
(6, '分期方案', '提供灵活付款方式', '提供分期付款或其他灵活的支付方案', 3, 1),

-- 效果质疑的技巧
(7, '案例证明', '用实际案例证明效果', '分享真实客户案例和数据证明', 1, 1),
(7, '试用体验', '邀请客户试用体验', '提供免费试用或体验机会', 2, 1),
(7, '保障承诺', '提供效果保障承诺', '给出明确的效果保障或退款承诺', 3, 1),

-- 对比竞品的技巧
(8, '优势对比', '客观对比我们的优势', '客观展示我们相比竞品的核心优势', 1, 1),
(8, '适配度分析', '强调与客户需求的适配', '分析哪个方案更适合客户的具体需求', 2, 1),
(8, '服务差异化', '突出服务的差异化', '强调我们在服务方面的独特优势', 3, 1),

-- 服务咨询的技巧
(9, '详细解答', '详细解答客户疑问', '耐心、专业地解答客户的每个疑问', 1, 1),
(9, '流程说明', '清晰说明服务流程', '用简单明了的方式说明整个服务流程', 2, 1),
(9, '预期管理', '合理管理客户预期', '设定合理的服务预期和时间节点', 3, 1),

-- 售后问题的技巧
(10, '同理心回应', '先表示理解和同理', '首先表达对客户困扰的理解和同理心', 1, 1),
(10, '快速响应', '承诺快速解决问题', '给出明确的解决时间和方案', 2, 1),
(10, '补偿方案', '提供合理的补偿', '根据情况提供合理的补偿或优惠', 3, 1),

-- 简洁优化的技巧
(11, '删繁就简', '删除冗余表达', '删除不必要的修饰词和重复表达', 1, 1),
(11, '重点突出', '突出核心信息', '将最重要的信息放在最前面', 2, 1),
(11, '结构清晰', '优化表达结构', '使用清晰的逻辑结构组织内容', 3, 1),

-- 专业提升的技巧
(12, '术语规范', '使用行业规范术语', '使用行业标准的专业术语', 1, 1),
(12, '数据支撑', '增加数据和案例', '用具体数据和案例支撑观点', 2, 1),
(12, '逻辑严谨', '确保逻辑严密', '确保表达的逻辑性和严密性', 3, 1),

-- 亲和力强化的技巧
(13, '语气柔和', '调整为更柔和的语气', '使用更温和、友好的表达方式', 1, 1),
(13, '共情表达', '增加共情内容', '加入对客户感受的理解和认同', 2, 1),
(13, '个性化', '增加个性化内容', '根据客户特点调整表达方式', 3, 1),

-- 电话开场的技巧
(14, '礼貌问候', '礼貌的电话问候', '简短礼貌的问候，确认对方时间是否方便', 1, 1),
(14, '快速说明', '快速说明来意', '在30秒内说明自己身份和来意', 2, 1),
(15, '价值钩子', '抛出吸引点', '用一个核心价值点吸引客户继续沟通', 3, 1),

-- 微信开场的技巧
(16, '个性化问候', '个性化的微信问候', '根据客户信息发送个性化问候', 1, 1),
(16, '有价值内容', '分享有价值的内容', '先分享一个对客户有价值的信息或资料', 2, 1),
(16, '轻松话题', '从轻松话题切入', '从一个轻松的话题开始建立联系', 3, 1),

-- 面访开场的技巧
(17, '专业形象', '展现专业形象', '通过穿着、谈吐展现专业形象', 1, 1),
(17, '破冰话题', '选择合适的破冰话题', '选择恰当的话题快速拉近距离', 2, 1),
(17, '简明介绍', '简明扼要的自我介绍', '30秒内完成专业的自我介绍', 3, 1);

-- 完成初始化
SELECT '✅ AI话术助手数据库初始化完成！' as result;
SELECT CONCAT('📊 已创建 ', COUNT(*), ' 个场景') as scenarios FROM ai_script_scenario;
SELECT CONCAT('💡 已创建 ', COUNT(*), ' 个技巧') as techniques FROM ai_script_technique;
