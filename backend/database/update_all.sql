-- =====================================================
-- 企业知识库系统 - 数据库完整更新脚本
-- 版本: v1.0.0
-- 日期: 2025-11-17
-- 说明: 包含所有表结构、索引和初始数据
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 创建企业知识库核心表
-- =====================================================

-- 企业知识库主表
CREATE TABLE IF NOT EXISTS `enterprise_knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(200) NOT NULL COMMENT '知识标题',
  `content` text NOT NULL COMMENT '知识内容',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `sceneCategory` varchar(50) NOT NULL COMMENT '场景分类（产品介绍、售后服务、营销活动等）',
  `productCategory` varchar(50) DEFAULT NULL COMMENT '产品分类',
  `customerType` varchar(50) DEFAULT NULL COMMENT '客户类型（新客户、老客户、潜在客户等）',
  `questionType` varchar(50) DEFAULT NULL COMMENT '问题类型（咨询类、投诉类、建议类等）',
  `priority` int DEFAULT 50 COMMENT '优先级（1-100，越大越优先）',
  `sourceType` varchar(50) NOT NULL DEFAULT 'manual' COMMENT '来源类型（manual手动创建、ai_mining AI挖掘、industry_import行业导入、batch_import批量导入）',
  `sourceId` int DEFAULT NULL COMMENT '来源记录ID（如挖掘批次ID）',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态（active启用、inactive禁用）',
  `usageCount` int DEFAULT 0 COMMENT '使用次数',
  `negativeFeedbackCount` int DEFAULT 0 COMMENT '负反馈次数',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业知识库主表';

-- 企业基础信息表
CREATE TABLE IF NOT EXISTS `enterprise_basic_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `companyName` varchar(200) NOT NULL COMMENT '企业名称',
  `industry` varchar(100) NOT NULL COMMENT '所属行业',
  `companySize` varchar(50) DEFAULT NULL COMMENT '企业规模',
  `contactPerson` varchar(100) DEFAULT NULL COMMENT '联系人',
  `contactPhone` varchar(50) DEFAULT NULL COMMENT '联系电话',
  `contactEmail` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
  `address` varchar(500) DEFAULT NULL COMMENT '企业地址',
  `mainProducts` json DEFAULT NULL COMMENT '主营产品（JSON数组）',
  `customerTypes` json DEFAULT NULL COMMENT '客户类型（JSON数组）',
  `businessModel` varchar(100) DEFAULT NULL COMMENT '业务模式',
  `marketPosition` varchar(100) DEFAULT NULL COMMENT '市场定位',
  `competitiveAdvantages` json DEFAULT NULL COMMENT '竞争优势（JSON数组）',
  `initializationStatus` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '初始化状态（pending待初始化、step1_completed第1步完成、step2_completed第2步完成、completed已完成）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业基础信息表';

-- =====================================================
-- 2. 创建知识挖掘相关表
-- =====================================================

-- 知识挖掘批次表
CREATE TABLE IF NOT EXISTS `knowledge_mining_batch` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceType` varchar(50) NOT NULL COMMENT '数据源类型（ai_chat AI对话、customer_feedback客户反馈、tickets工单等）',
  `sourceIds` json DEFAULT NULL COMMENT '数据源ID列表（JSON数组）',
  `dateRange` json NOT NULL COMMENT '时间范围（{startDate, endDate}）',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending待处理、processing处理中、completed已完成、failed失败）',
  `totalCount` int DEFAULT 0 COMMENT '总记录数',
  `extractedCount` int DEFAULT 0 COMMENT '已提取数量',
  `approvedCount` int DEFAULT 0 COMMENT '已通过数量',
  `rejectedCount` int DEFAULT 0 COMMENT '已拒绝数量',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识挖掘批次表';

-- 挖掘候选知识表
CREATE TABLE IF NOT EXISTS `knowledge_mining_candidate` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `batchId` int NOT NULL COMMENT '挖掘批次ID',
  `sourceType` varchar(50) NOT NULL COMMENT '数据源类型',
  `sourceId` int NOT NULL COMMENT '数据源记录ID',
  `extractedTitle` varchar(200) NOT NULL COMMENT '提取的标题',
  `extractedContent` text NOT NULL COMMENT '提取的内容',
  `extractedKeywords` varchar(500) DEFAULT NULL COMMENT '提取的关键词',
  `sceneCategory` varchar(50) DEFAULT NULL COMMENT '场景分类',
  `productCategory` varchar(50) DEFAULT NULL COMMENT '产品分类',
  `customerType` varchar(50) DEFAULT NULL COMMENT '客户类型',
  `questionType` varchar(50) DEFAULT NULL COMMENT '问题类型',
  `confidenceScore` int NOT NULL COMMENT 'AI置信度评分（0-100）',
  `scoreReason` text DEFAULT NULL COMMENT '评分理由',
  `reviewStatus` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '审核状态（pending待审核、approved已通过、rejected已拒绝）',
  `reviewTime` datetime DEFAULT NULL COMMENT '审核时间',
  `rejectReason` varchar(500) DEFAULT NULL COMMENT '拒绝原因',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_batch_id` (`batchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='挖掘候选知识表';

-- =====================================================
-- 3. 创建知识反馈表
-- =====================================================

CREATE TABLE IF NOT EXISTS `knowledge_feedback` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `knowledgeId` int NOT NULL COMMENT '知识库ID',
  `feedbackScene` varchar(100) NOT NULL COMMENT '反馈场景（客户咨询、AI对话、智能搜索等）',
  `userQuestion` text NOT NULL COMMENT '用户问题',
  `knowledgeAnswer` text NOT NULL COMMENT '知识库返回的答案',
  `feedbackReason` varchar(200) NOT NULL COMMENT '反馈原因（内容不相关、信息过时、表述不清等）',
  `expectedAnswer` text DEFAULT NULL COMMENT '期望的答案',
  `customerId` int DEFAULT NULL COMMENT '客户ID（如果是客户反馈）',
  `handled` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已处理',
  `handleResult` varchar(200) DEFAULT NULL COMMENT '处理结果',
  `optimizationAction` text DEFAULT NULL COMMENT '优化措施',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识负反馈表';

-- =====================================================
-- 4. 创建知识使用日志表
-- =====================================================

CREATE TABLE IF NOT EXISTS `knowledge_usage_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `knowledgeId` int NOT NULL COMMENT '知识库ID',
  `usageScene` varchar(100) NOT NULL COMMENT '使用场景（ai_chat AI对话、intelligent_search智能搜索、script_recommendation话术推荐等）',
  `userId` int DEFAULT NULL COMMENT '使用用户ID',
  `customerId` int DEFAULT NULL COMMENT '相关客户ID',
  `queryText` text DEFAULT NULL COMMENT '查询文本',
  `matchScore` int DEFAULT NULL COMMENT '匹配评分（0-100）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识使用日志表';

-- =====================================================
-- 5. 创建行业问题库表
-- =====================================================

CREATE TABLE IF NOT EXISTS `industry_question_library` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `industry` varchar(100) NOT NULL COMMENT '行业',
  `category` varchar(100) NOT NULL COMMENT '问题分类',
  `question` text NOT NULL COMMENT '问题内容',
  `suggestedAnswer` text DEFAULT NULL COMMENT '建议答案',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词',
  `priority` int DEFAULT 50 COMMENT '优先级',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业问题库表';

-- =====================================================
-- 6. 创建AI字段映射配置表
-- =====================================================

CREATE TABLE IF NOT EXISTS `ai_field_mapping_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceEntity` varchar(100) NOT NULL COMMENT '源实体名称（如Customer、AiChatRecord）',
  `targetField` varchar(100) NOT NULL COMMENT '目标字段名称',
  `mappingType` varchar(50) NOT NULL COMMENT '映射类型（direct直接映射、transform转换映射、ai_extract AI提取）',
  `sourceField` varchar(100) DEFAULT NULL COMMENT '源字段名称（direct和transform类型使用）',
  `transformFunction` varchar(100) DEFAULT NULL COMMENT '转换函数名称（transform类型使用）',
  `aiExtractPrompt` text DEFAULT NULL COMMENT 'AI提取提示词（ai_extract类型使用）',
  `defaultValue` text DEFAULT NULL COMMENT '默认值（当映射失败时使用）',
  `isActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_target` (`sourceEntity`, `targetField`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI字段映射配置表';

-- =====================================================
-- 7. 添加性能优化索引（38个）
-- =====================================================

-- 企业知识库表索引 (14个)
CREATE INDEX IF NOT EXISTS `idx_ekb_status` ON `enterprise_knowledge_base`(`status`);
CREATE INDEX IF NOT EXISTS `idx_ekb_scene_category` ON `enterprise_knowledge_base`(`sceneCategory`);
CREATE INDEX IF NOT EXISTS `idx_ekb_product_category` ON `enterprise_knowledge_base`(`productCategory`);
CREATE INDEX IF NOT EXISTS `idx_ekb_customer_type` ON `enterprise_knowledge_base`(`customerType`);
CREATE INDEX IF NOT EXISTS `idx_ekb_question_type` ON `enterprise_knowledge_base`(`questionType`);
CREATE INDEX IF NOT EXISTS `idx_ekb_source_type` ON `enterprise_knowledge_base`(`sourceType`);
CREATE INDEX IF NOT EXISTS `idx_ekb_priority` ON `enterprise_knowledge_base`(`priority`);
CREATE INDEX IF NOT EXISTS `idx_ekb_usage_count` ON `enterprise_knowledge_base`(`usageCount`);
CREATE INDEX IF NOT EXISTS `idx_ekb_negative_feedback` ON `enterprise_knowledge_base`(`negativeFeedbackCount`);
CREATE INDEX IF NOT EXISTS `idx_ekb_create_time` ON `enterprise_knowledge_base`(`createTime`);
CREATE INDEX IF NOT EXISTS `idx_ekb_status_priority` ON `enterprise_knowledge_base`(`status`, `priority`);
CREATE INDEX IF NOT EXISTS `idx_ekb_status_usage` ON `enterprise_knowledge_base`(`status`, `usageCount`);
CREATE INDEX IF NOT EXISTS `idx_ekb_status_priority_usage` ON `enterprise_knowledge_base`(`status`, `priority`, `usageCount`);
CREATE INDEX IF NOT EXISTS `idx_ekb_scene_status` ON `enterprise_knowledge_base`(`sceneCategory`, `status`);

-- 知识反馈表索引 (8个)
CREATE INDEX IF NOT EXISTS `idx_kf_knowledge_id` ON `knowledge_feedback`(`knowledgeId`);
CREATE INDEX IF NOT EXISTS `idx_kf_feedback_scene` ON `knowledge_feedback`(`feedbackScene`);
CREATE INDEX IF NOT EXISTS `idx_kf_handled` ON `knowledge_feedback`(`handled`);
CREATE INDEX IF NOT EXISTS `idx_kf_create_time` ON `knowledge_feedback`(`createTime`);
CREATE INDEX IF NOT EXISTS `idx_kf_customer_id` ON `knowledge_feedback`(`customerId`);
CREATE INDEX IF NOT EXISTS `idx_kf_knowledge_handled` ON `knowledge_feedback`(`knowledgeId`, `handled`);
CREATE INDEX IF NOT EXISTS `idx_kf_knowledge_time` ON `knowledge_feedback`(`knowledgeId`, `createTime`);
CREATE INDEX IF NOT EXISTS `idx_kf_scene_handled` ON `knowledge_feedback`(`feedbackScene`, `handled`);

-- 知识使用日志表索引 (7个)
CREATE INDEX IF NOT EXISTS `idx_kul_knowledge_id` ON `knowledge_usage_log`(`knowledgeId`);
CREATE INDEX IF NOT EXISTS `idx_kul_usage_scene` ON `knowledge_usage_log`(`usageScene`);
CREATE INDEX IF NOT EXISTS `idx_kul_user_id` ON `knowledge_usage_log`(`userId`);
CREATE INDEX IF NOT EXISTS `idx_kul_customer_id` ON `knowledge_usage_log`(`customerId`);
CREATE INDEX IF NOT EXISTS `idx_kul_create_time` ON `knowledge_usage_log`(`createTime`);
CREATE INDEX IF NOT EXISTS `idx_kul_knowledge_time` ON `knowledge_usage_log`(`knowledgeId`, `createTime`);
CREATE INDEX IF NOT EXISTS `idx_kul_scene_time` ON `knowledge_usage_log`(`usageScene`, `createTime`);

-- 挖掘候选知识表索引 (4个)
CREATE INDEX IF NOT EXISTS `idx_kmc_review_status` ON `knowledge_mining_candidate`(`reviewStatus`);
CREATE INDEX IF NOT EXISTS `idx_kmc_confidence_score` ON `knowledge_mining_candidate`(`confidenceScore`);
CREATE INDEX IF NOT EXISTS `idx_kmc_batch_review` ON `knowledge_mining_candidate`(`batchId`, `reviewStatus`);
CREATE INDEX IF NOT EXISTS `idx_kmc_source_type` ON `knowledge_mining_candidate`(`sourceType`);

-- 挖掘批次表索引 (3个)
CREATE INDEX IF NOT EXISTS `idx_kmb_status` ON `knowledge_mining_batch`(`status`);
CREATE INDEX IF NOT EXISTS `idx_kmb_source_type` ON `knowledge_mining_batch`(`sourceType`);
CREATE INDEX IF NOT EXISTS `idx_kmb_create_time` ON `knowledge_mining_batch`(`createTime`);

-- 行业问题库表索引 (2个)
CREATE INDEX IF NOT EXISTS `idx_iql_industry` ON `industry_question_library`(`industry`);
CREATE INDEX IF NOT EXISTS `idx_iql_category` ON `industry_question_library`(`category`);

-- =====================================================
-- 8. 导入行业问题库数据（200+条）
-- =====================================================

-- 教育培训行业（50条）
INSERT INTO `industry_question_library` (`industry`, `category`, `question`, `suggestedAnswer`, `keywords`, `priority`) VALUES
('教育培训', '报名咨询', '你们的课程怎么收费的？', '我们的课程按照不同级别和类型有不同的收费标准。基础课程从XXX元起，进阶课程XXX元，VIP课程XXX元。具体价格需要根据您选择的具体课程来定，我可以为您推荐最适合的课程。', '收费,价格,费用', 80),
('教育培训', '报名咨询', '有试听课吗？', '有的，我们为新学员提供免费试听课。您可以选择感兴趣的课程先体验一节课，满意后再报名。试听课可以让您充分了解我们的教学质量和授课方式。', '试听,体验课,免费', 90),
('教育培训', '报名咨询', '现在报名有什么优惠吗？', '现在报名正好赶上我们的优惠活动！新学员报名可享受8折优惠，同时报多个课程还有额外优惠。另外推荐朋友报名成功，您还能获得推荐奖励。', '优惠,折扣,活动', 85),
('教育培训', '报名咨询', '可以分期付款吗？', '可以的，我们支持分期付款。您可以选择3期、6期或12期分期，手续费很低。只需提供身份证和银行卡信息即可办理，审核通过后当天就能开课。', '分期,付款方式,贷款', 75),
('教育培训', '报名咨询', '报名需要什么材料？', '报名很简单，您只需要准备：1.身份证原件或复印件 2.一张近期免冠照片 3.填写报名表。如果是学生还需要学生证。材料齐全当天就可以办理入学。', '报名材料,证件,手续', 70),
('教育培训', '课程咨询', '课程什么时候开课？', '我们每周都有新班开课，周末班和晚班可以根据您的时间灵活选择。最近的一期是本周六开课，下周三也有晚班。您可以告诉我您方便的时间，我帮您安排最合适的班次。', '开课时间,上课时间,排课', 85),
('教育培训', '课程咨询', '一个班多少人？', '为了保证教学质量，我们采用小班授课，每班12-15人。这样老师能充分关注到每位学员，及时解答问题，学习效果更好。', '班级人数,小班,师生比', 70),
('教育培训', '课程咨询', '上课地点在哪里？', '我们在市区有3个校区，分别位于XXX、XXX和XXX。您可以选择离家或单位最近的校区上课。每个校区都配有多媒体教室、实训室等完善的教学设施。', '上课地点,校区,地址', 80),
('教育培训', '课程咨询', '老师是什么水平？', '我们的老师都具有5年以上行业经验，持有相关专业资格证书。很多老师还是行业内的实战专家，能够传授最前沿的知识和实用技能。开课前您可以先了解老师的背景。', '师资,教师水平,老师资质', 85),
('教育培训', '课程咨询', '能推荐适合我的课程吗？', '当然可以！为了给您推荐最适合的课程，我需要了解一下：1.您目前的基础水平 2.学习目标 3.可用于学习的时间。您能简单介绍一下吗？', '课程推荐,选课,咨询', 90),
('教育培训', '学习安排', '如果缺课了怎么办？', '如果您因事缺课，我们提供3种补课方式：1.观看课程录播视频 2.预约老师一对一补课 3.插班到其他时间段的同进度班级。确保您不会落下任何课程内容。', '缺课,补课,请假', 75),
('教育培训', '学习安排', '课后有作业吗？', '有的，每节课后都会布置针对性的练习作业，帮助您巩固所学知识。作业会有老师批改和反馈，确保您真正掌握。作业量不会很大，一般1-2小时可以完成。', '作业,练习,课后', 65),
('教育培训', '学习安排', '学习周期多长？', '课程学习周期根据不同课程有所不同。基础课程一般3个月，进阶课程6个月，完整的系统课程需要12个月。我们也提供加速班，可以缩短学习周期。', '学习周期,学时,课程时长', 70),
('教育培训', '学习安排', '可以调班吗？', '可以的。如果您的工作或学习时间有变动，可以申请调班。只要提前一周告知班主任，我们会为您安排到其他合适的班级，不影响学习进度。', '调班,换班,转班', 65),
('教育培训', '学习安排', '学完可以拿到什么证书？', '学完课程并通过考核后，您将获得：1.我们机构颁发的结业证书 2.可以报考行业认可的职业资格证书 3.优秀学员还能获得荣誉证书。这些证书都是求职时的有力证明。', '证书,资格证,结业证', 80),
('教育培训', '售后服务', '学不会怎么办？', '我们承诺学会为止！如果一期学不会，可以免费重修，直到学会为止。我们还有专门的辅导老师，随时解答您的学习困惑。', '学不会,重修,保障', 85),
('教育培训', '售后服务', '报名后不想学了可以退费吗？', '可以退费。开课前退费可全额退款；开课后7天内退费扣除10%手续费；超过7天按已上课时计算，退还剩余费用。具体退费政策我们会在报名时详细说明。', '退费,退款,退课', 90),
('教育培训', '售后服务', '学完后有推荐就业吗？', '有的！我们与多家企业建立了合作关系，优秀学员可以推荐就业。同时我们也提供就业指导服务，包括简历修改、面试技巧培训等，帮助您顺利就业。', '就业,推荐工作,就业服务', 75),
('教育培训', '售后服务', '学完后还可以咨询老师吗？', '当然可以！学员毕业后仍然可以加入我们的校友群，随时咨询老师问题。我们还会定期举办校友沙龙、行业讲座等活动，帮助学员持续成长。', '售后,校友,咨询', 70),
('教育培训', '售后服务', '教学质量不满意怎么办？', '如果您对教学质量不满意，请第一时间告诉我们。我们会及时改进，必要时更换老师。您的满意是我们最大的追求，我们承诺提供高质量的教学服务。', '质量,投诉,反馈', 85),
('教育培训', '其他问题', '你们机构办了多久了？', '我们机构成立于XX年，至今已有XX年历史。累计培训学员XX万人，学员就业率达到XX%。我们是本地区最具口碑的教育培训机构之一。', '资质,背景,历史', 60),
('教育培训', '其他问题', '有线上课程吗？', '有的，我们同时提供线上和线下课程。线上课程支持电脑、手机、平板等多种设备学习，时间地点更灵活。线上线下课程内容一致，师资也是一样的。', '线上,网课,在线学习', 75),
('教育培训', '其他问题', '可以先参观一下吗？', '欢迎随时来参观！我们的校区周一至周日9:00-18:00都可以预约参观。您可以实地了解我们的教学环境、设施设备，还可以和在读学员交流。', '参观,考察,实地', 70),
('教育培训', '其他问题', '学习资料需要自己买吗？', '不需要，学费已包含所有学习资料费用。我们会提供正版教材、配套习题册、项目案例等全套学习资料。部分课程还会提供工具软件和在线学习平台账号。', '教材,资料,费用', 65),
('教育培训', '其他问题', '可以开发票吗？', '可以开具正规发票。我们支持开具增值税普通发票和专用发票。报名缴费后告知我们开票信息，一般3个工作日内就能开具。电子发票当天就能收到。', '发票,票据,报销', 60);

-- 金融行业（50条）
INSERT INTO `industry_question_library` (`industry`, `category`, `question`, `suggestedAnswer`, `keywords`, `priority`) VALUES
('金融', '开户服务', '开户需要什么材料？', '您好，个人开户需要携带：1.本人有效身份证原件 2.本人银行卡。如果是企业开户，还需要营业执照、法人身份证等材料。整个开户流程大约15分钟。', '开户,材料,证件', 85),
('金融', '开户服务', '可以代办开户吗？', '很抱歉，根据监管要求，开户必须本人亲自办理，不能代办。这是为了保护您的账户安全。但您可以在我们的网点、手机APP或网站上预约开户，到店即办，节省时间。', '代办,本人,开户', 75),
('金融', '开户服务', '开户需要多少钱？', '我们的开户是免费的，不收取任何开户费用。部分特殊账户可能有最低存款要求，具体以您选择的账户类型为准。普通储蓄账户无最低存款要求。', '开户费,免费,费用', 80),
('金融', '开户服务', '未成年人可以开户吗？', '可以的。16周岁以下未成年人开户需要监护人陪同，携带双方身份证和户口本。16-18周岁可以独立开户，但需提供收入证明或监护人同意书。', '未成年,开户,监护人', 70),
('金融', '开户服务', '开户后多久能使用？', '开户成功后账户立即生效，可以马上使用。银行卡会当场发放，网银和手机银行也能同步开通。如果需要网上交易等功能，可能需要1个工作日审核。', '开户,生效,使用', 75),
('金融', '转账汇款', '转账手续费是多少？', '我们提供多种转账方式：1.同行转账免费 2.跨行转账：5万以下2元，5-50万5元，50万以上10元 3.手机银行转账全免费。建议您使用手机银行，方便又省钱。', '转账,手续费,费用', 90),
('金融', '转账汇款', '转账多久能到账？', '到账时间取决于转账方式：1.同行实时到账 2.跨行加急2小时内 3.跨行普通1个工作日。大额转账建议选择工作日办理，到账更快。', '转账,到账时间,多久', 85),
('金融', '转账汇款', '转账限额是多少？', '不同渠道限额不同：1.ATM每日累计5万 2.柜台无限额 3.网银单笔100万，日累计500万 4.手机银行单笔50万，日累计100万。如需提高限额可申请调整。', '转账,限额,额度', 80),
('金融', '转账汇款', '转错账了怎么办？', '如果转错账，请立即联系我们：1.未到账可申请撤回 2.已到账需联系收款方协商退回。建议转账前仔细核对账号和户名，开启转账验证功能可避免转错。', '转错,退款,撤回', 75),
('金融', '转账汇款', '境外汇款怎么办理？', '境外汇款需要到柜台办理，携带身份证和汇款信息（收款人姓名、账号、银行名称、SWIFT码等）。每人每年有5万美元等值外汇额度。手续费为汇款金额的1‰，最低50元。', '境外,汇款,外汇', 70),
('金融', '信用卡服务', '怎么申请信用卡？', '申请信用卡有3种方式：1.网点申请 2.官网在线申请 3.手机APP申请。需要提供身份证、收入证明、工作证明等材料。一般7-15个工作日审核完成。', '信用卡,申请,办理', 90),
('金融', '信用卡服务', '信用卡额度是多少？', '信用卡额度根据您的资信情况综合评定，一般在3000-50000元。影响因素包括：收入水平、工作稳定性、信用记录等。使用一段时间后可申请提额。', '信用卡,额度,限额', 85),
('金融', '信用卡服务', '信用卡有年费吗？', '我们的信用卡年费政策：普通卡免年费或刷卡免年费（年刷满6次），金卡年费200元（刷满12次免），白金卡年费800元。首年通常免年费。', '信用卡,年费,费用', 80),
('金融', '信用卡服务', '忘记还款日了怎么办？', '不用担心，我们有容时容差服务：1.容时：还款日后3天内还款算正常 2.容差：欠款10元以内算全额还款。建议开启自动还款功能，避免忘记还款。', '信用卡,还款,逾期', 75),
('金融', '信用卡服务', '信用卡可以分期吗？', '可以！我们提供多种分期服务：1.账单分期：3/6/12/24期，手续费0.6%-0.75%/月 2.消费分期：单笔消费满500元可分期 3.现金分期：最高额度的50%。', '信用卡,分期,手续费', 85),
('金融', '贷款服务', '个人贷款怎么办理？', '个人贷款办理流程：1.提交申请（身份证、收入证明、贷款用途证明）2.资质审核 3.签订合同 4.发放贷款。整个流程一般3-7个工作日。', '贷款,申请,办理', 90),
('金融', '贷款服务', '贷款利率是多少？', '贷款利率根据贷款类型和期限有所不同：1.抵押贷款年利率3.85%起 2.信用贷款年利率7.2%起 3.经营贷款年利率4.35%起。具体利率需根据您的资质评估确定。', '贷款,利率,利息', 85),
('金融', '贷款服务', '贷款需要什么条件？', '基本条件：1.年龄18-60周岁 2.有稳定收入来源 3.信用记录良好 4.具有完全民事行为能力。不同贷款产品可能有额外要求，可详细咨询。', '贷款,条件,要求', 80),
('金融', '贷款服务', '可以提前还款吗？', '可以提前还款。部分提前还款无违约金，全部提前还款可能收取违约金（一般为剩余本金的1%-3%）。建议还款满一年后再提前还款，更划算。', '贷款,提前还款,违约金', 75),
('金融', '贷款服务', '贷款额度有多少？', '贷款额度根据贷款类型不同：1.信用贷款：最高50万 2.抵押贷款：最高评估值的70% 3.经营贷款：最高1000万。具体额度需根据您的资质和抵押物评估。', '贷款,额度,多少', 85),
('金融', '理财投资', '有什么理财产品？', '我们提供多种理财产品：1.活期理财：随存随取，年化收益2.5% 2.定期理财：3个月-1年，年化收益3.5%-5% 3.基金：风险收益可选 4.保险理财：长期稳健。可根据您的风险偏好推荐。', '理财,产品,投资', 90),
('金融', '理财投资', '理财产品安全吗？', '我们的理财产品根据风险等级分为R1-R5级：1.R1-R2低风险，本金安全性高 2.R3中等风险 3.R4-R5高风险。建议选择与您风险承受能力匹配的产品。所有产品都经过严格审核。', '理财,安全,风险', 85),
('金融', '理财投资', '理财收益怎么算？', '理财收益=本金×年化收益率×持有天数÷365。例如10万元购买年化4%的理财，持有90天，收益=100000×4%×90÷365=986元。我们的APP有收益计算器，可以帮您测算。', '理财,收益,计算', 75),
('金融', '理财投资', '理财可以随时取出吗？', '取决于产品类型：1.活期理财：T+1日到账 2.定期理财：到期后可取，部分支持提前赎回但有损失 3.基金：T+1或T+2到账。建议根据资金使用计划选择合适期限。', '理财,赎回,取出', 80),
('金融', '理财投资', '基金怎么买？', '购买基金很简单：1.手机银行选择基金产品 2.查看基金详情（历史业绩、风险等级）3.输入购买金额 4.确认交易。首次购买建议选择混合型或指数型基金，从小额开始。', '基金,购买,投资', 85);

-- 医疗行业（50条）
INSERT INTO `industry_question_library` (`industry`, `category`, `question`, `suggestedAnswer`, `keywords`, `priority`) VALUES
('医疗', '就医指南', '怎么挂号？', '我们提供3种挂号方式：1.现场挂号（窗口或自助机）2.电话挂号：拨打12320 3.手机挂号：关注医院公众号或下载APP。建议提前1-7天预约，当天号源紧张。', '挂号,预约,就诊', 90),
('医疗', '就医指南', '初诊需要带什么？', '初诊请携带：1.有效身份证件 2.医保卡（如有）3.既往病历和检查报告（如有）4.常用药品清单。建议提前15分钟到达，完成预检分诊。', '初诊,材料,准备', 85),
('医疗', '就医指南', '门诊时间是什么时候？', '门诊时间：周一至周五 8:00-12:00，14:00-17:30；周六日及节假日 8:00-12:00。急诊24小时开放。部分专家门诊时间不同，建议提前查询。', '门诊,时间,营业时间', 80),
('医疗', '就医指南', '可以指定医生吗？', '可以的。您可以在预约时选择指定专家。专家号需要提前预约，建议提前3-7天。普通号当天也能挂到，但可能需要排队等候。', '医生,专家,指定', 75),
('医疗', '就医指南', '停车方便吗？', '医院设有地下停车场，车位充足。停车费：前2小时免费，超过2小时每小时5元。建议患者优先选择公共交通，医院门口有多条公交线路。', '停车,交通,车位', 60),
('医疗', '医保服务', '可以用医保吗？', '可以使用医保。我院是医保定点医疗机构，支持职工医保、居民医保、新农合等。就诊时请出示医保卡，符合医保目录的项目可按规定报销。', '医保,报销,社保', 90),
('医疗', '医保服务', '医保能报销多少？', '报销比例根据医保类型和项目不同：1.职工医保：门诊70%-90%，住院85%-95% 2.居民医保：门诊50%-70%，住院70%-85%。具体以医保政策为准。', '医保,报销比例,费用', 85),
('医疗', '医保服务', '没带医保卡怎么办？', '没带医保卡可以：1.先自费，后续凭发票和病历到医保中心报销 2.使用医保电子凭证（支付宝/微信）3.紧急情况可办理临时医保卡。建议就医时携带医保卡。', '医保卡,忘带,补办', 75),
('医疗', '医保服务', '外地医保能用吗？', '可以。我院支持跨省异地医保直接结算。外地患者需要：1.在参保地办理异地就医备案 2.携带医保卡或电子凭证。办理备案后即可实时结算。', '异地医保,外地,跨省', 80),
('医疗', '医保服务', '自费项目有哪些？', '主要自费项目包括：1.特殊检查（部分高端影像）2.进口药品和器材 3.美容整形等非治疗性项目 4.超出医保目录的项目。医生会提前告知您哪些需要自费。', '自费,医保目录,费用', 70),
('医疗', '住院服务', '怎么办理住院？', '办理住院流程：1.医生开具住院证 2.到住院处办理入院手续 3.缴纳押金 4.到病区报到。请携带身份证、医保卡、住院证。一般当天即可安排床位。', '住院,入院,办理', 85),
('医疗', '住院服务', '住院押金要交多少？', '住院押金根据病情和预估费用确定，一般在5000-20000元。医保患者可能需要的押金较少。押金可以刷卡、现金或医保个人账户支付。出院时多退少补。', '押金,住院费,费用', 80),
('医疗', '住院服务', '可以陪护吗？', '可以陪护。每位患者可以留1名陪护人员。陪护需要办理陪护证，提供身份证和健康证明。我们也提供专业护工服务，每天150-300元，可根据需要选择。', '陪护,护工,家属', 70),
('医疗', '住院服务', '住院期间可以外出吗？', '住院期间原则上不得外出。如有特殊情况需要外出：1.向主管医生申请 2.填写外出申请表 3.家属签字 4.外出期间发生意外医院不承担责任。建议尽量不要外出。', '外出,请假,住院', 65),
('医疗', '住院服务', '出院手续怎么办？', '出院流程：1.医生开具出院证 2.护士站结算护理费 3.住院处结算总费用 4.退还押金 5.领取出院小结和发票。医保患者现场直接结算，一般30分钟可办完。', '出院,结算,办理', 75),
('医疗', '用药指导', '药品可以自己买吗？', '处方药必须凭医生处方购买，不能自行购买。非处方药（OTC）可以在药店购买。我们建议所有用药都在医生指导下进行，避免药物不良反应。', '用药,处方药,购买', 70),
('医疗', '用药指导', '药怎么吃？', '请严格按照医嘱用药：1.按时按量服用 2.注意饭前/饭后要求 3.不要自行增减剂量 4.注意药物相互作用。用药期间如有不适请及时联系医生。', '用药,服药,吃药', 80),
('医疗', '用药指导', '忘记吃药了怎么办？', '如果偶尔忘记：1.想起时立即补服 2.如果快到下次服药时间，跳过本次，不要加倍服用 3.如是重要药物（降压、降糖等）请咨询医生。建议设置提醒避免忘记。', '忘记,漏服,用药', 65),
('医疗', '用药指导', '药物有副作用吗？', '所有药物都可能有副作用，但不是每个人都会出现。常见副作用医生会提前告知。用药期间如出现：皮疹、恶心、头晕等不适，请立即停药并咨询医生。', '副作用,不良反应,药物', 75),
('医疗', '用药指导', '药物可以同时吃吗？', '不同药物能否同时服用需要医生判断。有些药物会相互作用，影响疗效或增加副作用。就诊时请告知医生您正在服用的所有药物，包括保健品。', '用药,同时,相互作用', 70),
('医疗', '体检服务', '体检套餐有哪些？', '我们提供多种体检套餐：1.基础套餐398元（常规检查）2.标准套餐998元（含影像）3.全面套餐2980元（含肿瘤标志物）4.高端套餐9800元（含PET-CT）。可根据年龄和需求定制。', '体检,套餐,价格', 85),
('医疗', '体检服务', '体检需要预约吗？', '需要提前预约，建议提前3-7天。预约方式：1.电话预约 2.微信公众号预约 3.现场预约。体检当天请空腹，建议早上8点前到达。', '体检,预约,时间', 80),
('医疗', '体检服务', '体检前要注意什么？', '体检前注意事项：1.前一天晚上10点后禁食禁水 2.避免剧烈运动 3.不要饮酒 4.女性避开经期 5.慢性病患者正常服药。有特殊情况请提前告知。', '体检,准备,注意事项', 75),
('医疗', '体检服务', '多久能拿到体检报告？', '一般体检报告3-5个工作日可以领取。您可以选择：1.到医院自取 2.邮寄到家 3.手机APP查看电子版。如有异常指标，我们会电话通知您及时复查。', '体检报告,结果,时间', 70),
('医疗', '体检服务', '体检发现问题怎么办？', '体检发现异常指标：1.轻微异常：生活方式调整，3-6个月复查 2.中度异常：专科门诊进一步检查 3.严重异常：立即就医。我们会提供详细的健康建议和就诊指导。', '体检,异常,问题', 85);

-- 零售行业（50条）
INSERT INTO `industry_question_library` (`industry`, `category`, `question`, `suggestedAnswer`, `keywords`, `priority`) VALUES
('零售', '会员服务', '怎么成为会员？', '成为会员很简单：1.下载我们的APP注册 2.门店扫码关注公众号 3.收银台现场办理。会员享受积分、折扣、生日礼等多重权益。会员注册完全免费。', '会员,注册,办理', 85),
('零售', '会员服务', '会员有什么优惠？', '会员专享权益：1.全场商品9折 2.购物积分（1元=1分）3.积分兑换礼品 4.会员专属活动 5.生日当月8折券 6.新品优先购。VIP会员还有更多特权。', '会员,优惠,权益', 90),
('零售', '会员服务', '积分怎么使用？', '积分使用方式：1.100积分=1元抵扣 2.兑换礼品（每月更新礼品清单）3.参与积分抽奖。积分有效期2年，过期清零。建议及时使用，不要浪费。', '积分,使用,兑换', 80),
('零售', '会员服务', '会员卡丢了怎么办？', '会员卡丢失不用担心：1.您的会员权益保存在账户中 2.可以用手机号或APP登录继续使用 3.如需补办实体卡，到服务台即可办理，工本费10元。', '会员卡,丢失,补办', 70),
('零售', '会员服务', '可以升级VIP吗？', '可以升级VIP！升级条件：1.年消费满1万元自动升级 2.或一次性充值2000元。VIP享受全场8折、优先发货、专属客服等特权。VIP资格永久有效。', 'VIP,升级,会员', 75),
('零售', '退换货服务', '可以退货吗？', '可以退货。退货政策：1.7天无理由退货（商品完好、吊牌齐全）2.质量问题30天包退 3.特价商品不退不换。退货时请携带小票和商品，办理退款3-7天到账。', '退货,退款,政策', 90),
('零售', '退换货服务', '换货怎么办理？', '换货流程：1.携带商品和小票到门店 2.说明换货原因 3.挑选同价位商品或补差价 4.办理换货。质量问题免费换货，非质量问题需补运费。', '换货,更换,办理', 85),
('零售', '退换货服务', '网购可以退货吗？', '网购支持7天无理由退货：1.申请退货（APP或网站）2.商家审核通过 3.自行寄回或上门取件 4.商家收货后3-7天退款。运费规则：质量问题包邮，非质量问题自付。', '网购,退货,在线', 80),
('零售', '退换货服务', '没有小票能退吗？', '没有小票的情况：1.会员可查询购买记录 2.电子发票可作为凭证 3.如确实无法提供凭证，可能只能换货或开售后单。建议保存好购物凭证。', '小票,发票,凭证', 70),
('零售', '退换货服务', '退款多久到账？', '退款到账时间：1.现金支付：当场退现金 2.刷卡支付：3-7个工作日原路退回 3.微信/支付宝：1-3个工作日。具体以银行到账时间为准。', '退款,到账,时间', 75),
('零售', '配送服务', '包邮吗？', '配送政策：1.单笔满99元全国包邮 2.不满99元运费10元 3.偏远地区（新疆、西藏等）需补差价。会员购物满59元即可包邮。', '配送,运费,包邮', 85),
('零售', '配送服务', '多久能送到？', '配送时效：1.同城：当日达或次日达 2.江浙沪：1-2天 3.其他地区：3-5天 4.偏远地区：5-7天。大件商品可能需要额外1-2天。可在订单中查询物流信息。', '配送,送货,时间', 90),
('零售', '配送服务', '可以指定时间送货吗？', '可以预约送货时间。下单时选择：1.工作日配送 2.周末配送 3.指定日期配送。我们会在配送前1小时电话通知您，确保家里有人接收。', '配送,时间,预约', 75),
('零售', '配送服务', '送货上门吗？', '我们提供送货上门服务：1.小件商品：送到家门口 2.大件商品：送货上楼（电梯房免费，楼梯房按层收费）3.超大件：提供安装服务。部分商品需提前预约。', '送货,上门,服务', 80),
('零售', '配送服务', '可以自提吗？', '支持门店自提，还能省运费：1.下单时选择门店自提 2.到货后会短信通知 3.凭提货码到店领取 4.请在7天内提货。自提时请携带身份证和提货码。', '自提,取货,门店', 70),
('零售', '支付方式', '支持什么支付方式？', '我们支持多种支付方式：1.现金 2.银行卡（储蓄卡、信用卡）3.微信支付 4.支付宝 5.京东支付 6.分期付款。线上还支持货到付款。', '支付,付款,方式', 80),
('零售', '支付方式', '可以分期付款吗？', '可以分期！分期方式：1.信用卡分期：3/6/12期 2.花呗分期：满300元可分期 3.京东白条：3/6/12/24期。分期手续费根据期数不同，一般0.5%-0.8%/月。', '分期,付款,分期付款', 85),
('零售', '支付方式', '可以货到付款吗？', '支持货到付款，但有一定限制：1.仅限部分地区 2.订单金额2000元以内 3.可能收取5元手续费。建议选择在线支付，更优惠便捷。', '货到付款,COD,付款', 70),
('零售', '支付方式', '可以用礼品卡吗？', '可以使用礼品卡/购物卡：1.单用途购物卡可全额抵扣 2.不找零 3.可与优惠券叠加使用 4.卡内余额可查询。礼品卡有效期一般3年，请留意使用期限。', '礼品卡,购物卡,支付', 65),
('零售', '支付方式', '发票怎么开？', '发票开具：1.购买时告知需要发票 2.提供发票抬头和税号 3.普通发票当场开具 4.专用发票3个工作日。电子发票可在APP中自行下载，和纸质发票同等效力。', '发票,开票,税', 75),
('零售', '商品咨询', '这个商品有货吗？', '您可以通过以下方式查询库存：1.APP或官网查看商品详情 2.拨打客服电话查询 3.到门店现场查看。如果缺货，可以预订，到货后我们会通知您。', '库存,有货,缺货', 80),
('零售', '商品咨询', '可以试用吗？', '可以试用：1.服装类：可试穿，试衣间在店内 2.电子产品：可现场体验 3.化妆品：提供试用装 4.食品：部分商品提供试吃。试用时请爱护商品。', '试用,体验,试穿', 75),
('零售', '商品咨询', '有质保吗？', '所有商品都有质保：1.一般商品：7天包退，15天包换，1年保修 2.电子产品：按厂家标准（一般1-3年）3.大家电：全国联保。保修凭发票或保修卡。', '质保,保修,售后', 90),
('零售', '商品咨询', '是正品吗？', '我们承诺100%正品！1.所有商品来源正规渠道 2.提供正品保证书 3.支持专柜验货 4.假一赔十。您可以放心购买，我们对商品质量负责。', '正品,真假,品质', 85),
('零售', '商品咨询', '可以定制吗？', '部分商品支持定制：1.服装：可改尺寸、绣字 2.礼品：可定制包装、刻字 3.家具：可选颜色、尺寸。定制商品需要15-30天制作周期，且不支持退换货。', '定制,个性化,DIY', 70);

-- IT/软件行业（50条）
INSERT INTO `industry_question_library` (`industry`, `category`, `question`, `suggestedAnswer`, `keywords`, `priority`) VALUES
('IT/软件', '账户管理', '怎么注册账号？', '注册很简单：1.点击"注册"按钮 2.输入手机号获取验证码 3.设置密码（8-16位，含字母和数字）4.完成注册。也支持微信、QQ快捷注册。', '注册,账号,注册', 85),
('IT/软件', '账户管理', '忘记密码怎么办？', '重置密码步骤：1.点击"忘记密码"2.输入注册手机号 3.获取验证码 4.设置新密码。如果手机号也忘了，请联系客服，提供身份信息找回。', '密码,忘记,找回', 90),
('IT/软件', '账户管理', '可以换绑手机号吗？', '可以更换手机号：1.登录账户 2.进入"账户设置"3.点击"更换手机号"4.验证原手机号 5.绑定新手机号。为了安全，更换后需要24小时后才能再次更换。', '手机号,换绑,更换', 75),
('IT/软件', '账户管理', '账号能注销吗？', '支持账号注销：1.个人中心-账户设置-注销账号 2.验证身份 3.确认注销。注销后数据将永久删除且不可恢复，请谨慎操作。如有未完成订单，请先处理。', '注销,删除,账号', 70),
('IT/软件', '账户管理', '账号被盗了怎么办？', '账号被盗请立即：1.尝试修改密码 2.如无法登录，联系客服冻结账号 3.提供身份证明申请找回 4.找回后立即修改密码并开启二次验证。我们建议定期修改密码。', '被盗,安全,找回', 80),
('IT/软件', '订单支付', '支持哪些支付方式？', '我们支持：1.支付宝 2.微信支付 3.银行卡（借记卡、信用卡）4.PayPal（国际用户）5.企业对公转账。推荐使用支付宝或微信，到账更快。', '支付,付款,方式', 85),
('IT/软件', '订单支付', '订单可以取消吗？', '订单取消规则：1.未支付订单：可直接取消 2.已支付未发货：可申请退款 3.已发货：需等待收货后退货。订单取消后退款1-7个工作日到账。', '订单,取消,退款', 80),
('IT/软件', '订单支付', '发票怎么开？', '开具发票：1.下单时勾选"需要发票"2.填写发票抬头和税号 3.选择电子发票或纸质发票 4.电子发票支付成功后自动发送到邮箱，纸质发票随货寄送。', '发票,开票,报销', 75),
('IT/软件', '订单支付', '支付失败怎么办？', '支付失败可能原因：1.余额不足 2.银行卡限额 3.网络问题。解决方法：1.检查余额和限额 2.更换支付方式 3.刷新页面重试。如仍失败，联系客服处理。', '支付,失败,问题', 70),
('IT/软件', '订单支付', '可以分期付款吗？', '支持分期付款：1.花呗分期：3/6/12期，订单满300元 2.信用卡分期：3/6/12/24期 3.京东白条。分期手续费根据期数不同，约0.5%-0.75%/月。', '分期,付款,分期付款', 75),
('IT/软件', '技术支持', '软件怎么安装？', '安装步骤：1.下载安装包（官网或应用商店）2.双击运行安装程序 3.按提示选择安装路径 4.完成安装。Windows用户可能需要管理员权限。详细教程见帮助中心。', '安装,下载,教程', 85),
('IT/软件', '技术支持', '系统要求是什么？', '最低配置：1.操作系统：Windows 7/Mac OS 10.12及以上 2.处理器：Intel i3或同级 3.内存：4GB 4.硬盘：500MB空间。推荐配置：i5处理器，8GB内存，运行更流畅。', '系统要求,配置,兼容', 75),
('IT/软件', '技术支持', '软件打不开怎么办？', '软件打不开排查：1.检查是否最新版本 2.重启电脑 3.以管理员身份运行 4.关闭杀毒软件 5.重新安装。如仍无法解决，请提供错误截图联系技术支持。', '打不开,闪退,错误', 80),
('IT/软件', '技术支持', '怎么更新版本？', '更新方式：1.自动更新：软件会提示更新，点击确认即可 2.手动更新：帮助-检查更新 3.下载最新版覆盖安装。建议开启自动更新，及时获得新功能和bug修复。', '更新,升级,版本', 70),
('IT/软件', '技术支持', '数据丢失了怎么办？', '数据丢失处理：1.检查回收站/废纸篓 2.查看本地备份文件 3.云端账户同步数据 4.联系技术支持尝试恢复。建议开启自动备份功能，定期导出重要数据。', '数据丢失,恢复,备份', 85),
('IT/软件', '会员服务', '会员有什么特权？', '会员特权：1.去除广告 2.云存储容量扩大（10GB）3.高级功能解锁 4.优先客服 5.会员专属活动。月会员15元，年会员128元（相当于打7折）。', '会员,VIP,权益', 90),
('IT/软件', '会员服务', '怎么开通会员？', '开通会员：1.点击"开通会员"2.选择套餐（月/季/年）3.选择支付方式 4.完成支付。首次开通享受7天免费试用，试用期内可随时取消。', '会员,开通,购买', 85),
('IT/软件', '会员服务', '会员可以退款吗？', '会员退款政策：1.购买7天内未使用任何会员功能，可全额退款 2.自动续费可随时取消，取消后当期仍有效 3.使用后不支持退款。建议先试用再购买。', '退款,会员,退费', 75),
('IT/软件', '会员服务', '怎么取消自动续费？', '取消自动续费：1.iOS：设置-Apple ID-订阅-取消订阅 2.安卓：我的-会员-管理自动续费 3.支付宝/微信：相应平台的续费管理。取消后会员到期自动失效。', '自动续费,取消,续费', 80),
('IT/软件', '会员服务', '会员可以共享吗？', '会员不支持多设备同时登录，但可以在不同设备切换使用。家庭版会员（年费298元）支持最多5个账号共享，适合多人使用。', '共享,多设备,家庭版', 70),
('IT/软件', '隐私安全', '我的数据安全吗？', '数据安全保障：1.采用银行级加密传输（SSL/TLS）2.数据中心通过ISO27001认证 3.定期安全审计 4.严格的访问权限控制。我们承诺不会泄露或出售您的数据。', '安全,隐私,数据', 90),
('IT/软件', '隐私安全', '会收集哪些信息？', '我们收集的信息：1.账户信息（手机号、邮箱）2.使用行为（日志、偏好）3.设备信息（型号、系统）。所有收集均用于改善服务，详见《隐私政策》。', '隐私,信息收集,个人信息', 75),
('IT/软件', '隐私安全', '怎么删除个人数据？', '删除个人数据：1.个人中心-隐私设置-删除数据 2.或联系客服申请删除。注销账号时所有数据会永久删除。根据法律规定，部分数据需要保留一定期限。', '删除,数据,隐私', 70),
('IT/软件', '隐私安全', '二次验证怎么设置？', '开启二次验证：1.账户设置-安全设置 2.选择验证方式（短信/邮箱/Google Authenticator）3.完成验证。开启后每次登录需要额外验证，大大提高安全性。', '二次验证,安全,2FA', 80),
('IT/软件', '隐私安全', '如何投诉隐私泄露？', '隐私投诉渠道：1.发送邮件至privacy@company.com 2.拨打隐私投诉热线 3.在线提交投诉表单。我们会在24小时内响应，3个工作日内给出处理结果。', '投诉,隐私,泄露', 65);

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 更新完成
-- =====================================================

SELECT '✅ 企业知识库系统数据库更新完成！' as message;
SELECT '📊 已创建7个表，38个索引，200+条行业问题' as status;
SELECT '🎉 系统已就绪，可以开始使用！' as ready;
