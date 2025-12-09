-- AI培训陪练功能增强 - 数据库迁移脚本
-- 创建日期: 2025-11-24
-- 说明: 添加训练剧本表、训练评估表，并扩展现有训练记录表

USE education_crm;

-- 1. 扩展现有的训练记录表（添加新字段）
ALTER TABLE ai_training_records
ADD COLUMN script_id INT NULL COMMENT '关联的剧本ID' AFTER training_type,
ADD COLUMN difficulty ENUM('简单', '普通', '困难') DEFAULT '普通' COMMENT '难度等级' AFTER scenario,
ADD COLUMN customer_personality ENUM('理性型', '情感型', '挑剔型', '犹豫型') DEFAULT '理性型' COMMENT '客户性格' AFTER difficulty,
ADD COLUMN training_goal TEXT NULL COMMENT '训练目标' AFTER customer_role,
ADD COLUMN max_rounds INT DEFAULT 10 COMMENT '最大轮次' AFTER training_goal,
ADD COLUMN demand_mining_score DECIMAL(3,1) NULL COMMENT '需求挖掘评分' AFTER communication_score,
ADD COLUMN closing_ability_score DECIMAL(3,1) NULL COMMENT '促成能力评分' AFTER objection_handling_score,
ADD COLUMN script_standard_score DECIMAL(3,1) NULL COMMENT '话术标准度评分' AFTER closing_ability_score;

-- 2. 创建训练剧本表
CREATE TABLE IF NOT EXISTS training_scripts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL COMMENT '剧本标题',
  scenario VARCHAR(100) NOT NULL COMMENT '场景（首次接触、需求挖掘、价格谈判等）',
  difficulty ENUM('简单', '普通', '困难') DEFAULT '普通' COMMENT '难度等级',
  source_type ENUM('AI生成', '手动创建', '聊天记录') DEFAULT 'AI生成' COMMENT '来源类型',
  source_chat_id INT NULL COMMENT '来源聊天记录ID',
  customer_background TEXT NOT NULL COMMENT '客户背景信息',
  training_goal TEXT NOT NULL COMMENT '训练目标',
  key_objections JSON NULL COMMENT '关键异议点',
  standard_scripts JSON NULL COMMENT '标准话术（按场景分类）',
  dialogue_flow JSON NULL COMMENT '对话流程模板',
  max_rounds INT DEFAULT 10 COMMENT '建议轮次',
  objection_count INT DEFAULT 0 COMMENT '异议数量（用于自动判定难度）',
  status ENUM('草稿', '已发布', '已下架') DEFAULT '草稿' COMMENT '状态',
  creator_id INT NULL COMMENT '创建人ID',
  creator_type VARCHAR(50) DEFAULT '系统' COMMENT '创建人类型（管理员/主管/系统）',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  avg_score DECIMAL(3,1) NULL COMMENT '平均得分',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_scenario (scenario),
  INDEX idx_difficulty (difficulty),
  INDEX idx_status (status),
  INDEX idx_source_chat_id (source_chat_id),
  INDEX idx_creator_id (creator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='训练剧本表';

-- 3. 创建训练评估详情表
CREATE TABLE IF NOT EXISTS training_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  training_id INT NOT NULL COMMENT '关联的训练记录ID',
  dimension VARCHAR(50) NOT NULL COMMENT '评估维度（沟通技巧、需求挖掘等）',
  score DECIMAL(3,1) NOT NULL COMMENT '该维度得分',
  comment TEXT NULL COMMENT '评价内容',
  good_examples JSON NULL COMMENT '优秀话术示例',
  bad_examples JSON NULL COMMENT '待改进话术示例',
  suggestions JSON NULL COMMENT '改进建议',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_training_id (training_id),
  INDEX idx_dimension (dimension),
  FOREIGN KEY (training_id) REFERENCES ai_training_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='训练评估详情表';

-- 4. 创建初始测试剧本数据
INSERT INTO training_scripts (
  title, scenario, difficulty, source_type, customer_background, training_goal,
  key_objections, standard_scripts, dialogue_flow, max_rounds, objection_count, status, creator_type
) VALUES
-- 剧本1: 首次接触 - 简单
(
  '首次接触客户 - 初中数学辅导',
  '首次接触',
  '简单',
  '手动创建',
  '家长李女士，孩子初二，数学成绩中下游（80-90分），希望提升到110分以上。家庭月收入2-3万，重视教育投资。',
  '3轮对话内完成需求了解，成功预约试听课或留下联系方式。',
  JSON_ARRAY('价格较贵', '时间安排'),
  JSON_OBJECT(
    '开场白', JSON_ARRAY('您好！我是XX教育的课程顾问，看到您咨询我们的初中数学辅导课程，请问孩子现在读初几呢？'),
    '需求挖掘', JSON_ARRAY('孩子目前数学成绩大概在什么水平？', '平时学习数学主要遇到哪些困难？'),
    '价值呈现', JSON_ARRAY('我们的1对1辅导能够针对孩子的薄弱环节，制定个性化学习方案', '我们有专业的教研团队，老师都是5年以上教学经验')
  ),
  JSON_ARRAY(
    JSON_OBJECT('round', 1, 'topic', '开场+需求了解', 'keywords', JSON_ARRAY('年级', '成绩', '困难')),
    JSON_OBJECT('round', 2, 'topic', '价值介绍+解决异议', 'keywords', JSON_ARRAY('方案', '效果', '师资')),
    JSON_OBJECT('round', 3, 'topic', '促成试听', 'keywords', JSON_ARRAY('试听', '预约', '优惠'))
  ),
  8,
  2,
  '已发布',
  '系统'
),

-- 剧本2: 价格谈判 - 普通
(
  '价格谈判 - 面对价格敏感客户',
  '价格谈判',
  '普通',
  '手动创建',
  '家长王先生，孩子高一，对课程感兴趣但对价格有顾虑，认为比其他机构贵20%。经济条件一般，希望获得更多优惠。',
  '5轮对话内化解价格异议，强调价值，成功促成签约或锁定意向。',
  JSON_ARRAY('比竞品贵', '没有优惠', '效果不确定'),
  JSON_OBJECT(
    '价格异议应对', JSON_ARRAY('我理解您的顾虑。我们的价格虽然稍高，但我们提供的价值是...', '与其他机构相比，我们的优势在于...'),
    '价值强化', JSON_ARRAY('我们有提分承诺，如果达不到承诺分数会按比例退费', '我们的教研团队每周都会针对孩子情况调整教学方案'),
    '促成技巧', JSON_ARRAY('目前我们有首单立减300元的活动', '现在报名半年课程可以享受9折优惠')
  ),
  JSON_ARRAY(
    JSON_OBJECT('round', 1, 'topic', '价格异议提出', 'keywords', JSON_ARRAY('贵', '价格', '竞品')),
    JSON_OBJECT('round', 2, 'topic', '价值呈现', 'keywords', JSON_ARRAY('效果', '师资', '服务')),
    JSON_OBJECT('round', 3, 'topic', '对比分析', 'keywords', JSON_ARRAY('优势', '区别', '保障')),
    JSON_OBJECT('round', 4, 'topic', '优惠介绍', 'keywords', JSON_ARRAY('活动', '折扣', '赠送')),
    JSON_OBJECT('round', 5, 'topic', '促成签约', 'keywords', JSON_ARRAY('报名', '确认', '支付'))
  ),
  10,
  3,
  '已发布',
  '系统'
),

-- 剧本3: 处理异议 - 困难
(
  '处理多重异议 - 挑剔型家长',
  '处理异议',
  '困难',
  '手动创建',
  '家长张女士，孩子初三面临中考，对多家机构进行对比。提出多个疑问：师资、效果、时间安排、退费政策等。性格谨慎，需要大量信息才能决策。',
  '7轮对话内逐一化解所有异议，建立信任，促成签约或至少锁定试听。',
  JSON_ARRAY('师资不确定', '效果无保障', '时间冲突', '退费条款', '与竞品对比', '口碑验证'),
  JSON_OBJECT(
    '师资异议', JSON_ARRAY('我们的老师都经过严格筛选，通过率不到5%', '可以先试听，如果不满意老师可以更换'),
    '效果异议', JSON_ARRAY('我们签订提分协议，承诺至少提升20分', '已有200+学员成功从中下游提升到优秀'),
    '时间异议', JSON_ARRAY('我们提供灵活的排课时间，可以根据孩子的作息调整', '也提供周末集中辅导方案'),
    '退费异议', JSON_ARRAY('我们承诺不满意随时退费，按课时计算', '已上课时扣除，剩余课时全额退款'),
    '竞品对比', JSON_ARRAY('我们的核心优势是...', '与XX机构相比，我们更注重...')
  ),
  JSON_ARRAY(
    JSON_OBJECT('round', 1, 'topic', '师资质疑', 'keywords', JSON_ARRAY('老师', '经验', '资质')),
    JSON_OBJECT('round', 2, 'topic', '效果质疑', 'keywords', JSON_ARRAY('保证', '承诺', '案例')),
    JSON_OBJECT('round', 3, 'topic', '时间安排', 'keywords', JSON_ARRAY('时间', '课表', '灵活')),
    JSON_OBJECT('round', 4, 'topic', '退费政策', 'keywords', JSON_ARRAY('退费', '保障', '条款')),
    JSON_OBJECT('round', 5, 'topic', '竞品对比', 'keywords', JSON_ARRAY('对比', '优势', '区别')),
    JSON_OBJECT('round', 6, 'topic', '口碑验证', 'keywords', JSON_ARRAY('评价', '口碑', '案例')),
    JSON_OBJECT('round', 7, 'topic', '试听促成', 'keywords', JSON_ARRAY('试听', '体验', '确认'))
  ),
  12,
  6,
  '已发布',
  '系统'
);

-- 5. 创建索引优化查询性能
CREATE INDEX idx_script_scenario_difficulty ON training_scripts(scenario, difficulty, status);
CREATE INDEX idx_training_script_user ON ai_training_records(script_id, user_id, create_time);

-- 验证表创建
SELECT
  '数据库表创建完成' AS status,
  (SELECT COUNT(*) FROM training_scripts) AS scripts_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_training_records' AND table_schema = 'education_crm') AS training_fields_count;
