-- AI培训陪练系统数据库表创建脚本（仅表结构）

-- 1. 客户角色人设表
CREATE TABLE IF NOT EXISTS customer_personas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '角色名称',
  personality_type ENUM('hesitant', 'comparative', 'impatient', 'professional', 'price_sensitive') NOT NULL COMMENT '性格类���',
  characteristics JSON COMMENT '角色特征描述',
  communication_style ENUM('formal', 'casual', 'technical', 'direct') NOT NULL COMMENT '沟通风格',
  decision_making_style ENUM('analytical', 'emotional', 'collaborative', 'authoritative') NOT NULL COMMENT '决策风格',
  typical_objections JSON COMMENT '典型异议列表',
  response_patterns JSON COMMENT '回应模式配置',
  difficulty_settings JSON COMMENT '难度参数设置',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_personality_type (personality_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户角色人设表';

-- 2. 培训剧本表
CREATE TABLE IF NOT EXISTS training_scripts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '剧本标题',
  description TEXT COMMENT '剧本描述',
  scenario_type ENUM('first_contact', 'price_negotiation', 'objection_handling', 'relationship_building', 'closing_deal') NOT NULL COMMENT '场景类型',
  customer_persona_id INT NOT NULL COMMENT '客户角色ID',
  source_type ENUM('chat_analysis', 'knowledge_base', 'manual', 'ai_generated') NOT NULL COMMENT '来源类型',
  source_data JSON COMMENT '源数据（聊天记录/知识库ID等）',
  script_content JSON NOT NULL COMMENT '剧本内容（对话流程）',
  training_goals JSON COMMENT '培训目标配置',
  difficulty_level TINYINT DEFAULT 3 COMMENT '难度等级1-5',
  estimated_duration INT DEFAULT 15 COMMENT '预计时长（分钟）',
  max_rounds INT DEFAULT 5 COMMENT '最大对话轮次',
  success_criteria JSON COMMENT '成功标���',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  success_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '成功率',
  created_by INT COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_scenario_type (scenario_type),
  INDEX idx_customer_persona (customer_persona_id),
  INDEX idx_source_type (source_type),
  INDEX idx_difficulty_level (difficulty_level),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训剧本表';

-- 3. 培训会话表
CREATE TABLE IF NOT EXISTS training_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  script_id INT NOT NULL COMMENT '剧本ID',
  customer_persona_id INT NOT NULL COMMENT '客户角色ID',
  session_name VARCHAR(200) COMMENT '会话名称',
  session_status ENUM('preparing', 'active', 'paused', 'completed', 'abandoned') NOT NULL DEFAULT 'preparing' COMMENT '会话状态',
  training_goals JSON COMMENT '会话目标',
  max_rounds INT DEFAULT 5 COMMENT '最大对话轮次',
  current_round INT DEFAULT 0 COMMENT '当前轮次',
  conversation_history JSON COMMENT '对话历史',
  session_metrics JSON COMMENT '会话指标（时长、回复速度等）',
  final_score DECIMAL(5,2) COMMENT '最终评分',
  goal_achievement_rate DECIMAL(5,2) COMMENT '目标达成率',
  completion_status ENUM('success', 'failure', 'partial') COMMENT '完成状态',
  started_at TIMESTAMP NULL COMMENT '开始时间',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后活动时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_session_status (session_status),
  INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训会话表';

-- 4. 培训评估表
CREATE TABLE IF NOT EXISTS training_evaluations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL COMMENT '会话ID',
  evaluator_type ENUM('system', 'self', 'peer', 'manager') NOT NULL COMMENT '评估者类型',
  evaluator_id INT COMMENT '评估者ID',
  overall_score DECIMAL(5,2) NOT NULL COMMENT '总体评分',
  goal_achievement_score DECIMAL(5,2) COMMENT '目标达成度评分',
  professionalism_score DECIMAL(5,2) COMMENT '专业性评分',
  efficiency_score DECIMAL(5,2) COMMENT '效率评分',
  adaptability_score DECIMAL(5,2) COMMENT '应变能力评分',
  customer_satisfaction_score DECIMAL(5,2) COMMENT '客户满意度评分',
  detailed_metrics JSON COMMENT '详细评估指标',
  strengths JSON COMMENT '优势分析',
  improvements JSON COMMENT '改进建议',
  recommendations JSON COMMENT '推荐行动',
  evaluation_notes TEXT COMMENT '评估备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_session_id (session_id),
  INDEX idx_evaluator_type (evaluator_type),
  INDEX idx_overall_score (overall_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训评估表';

-- 5. 培训反馈表
CREATE TABLE IF NOT EXISTS training_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL COMMENT '会话ID',
  user_id INT NOT NULL COMMENT '用户ID',
  feedback_type ENUM('script_quality', 'difficulty', 'realism', 'helpfulness', 'technical_issue') NOT NULL COMMENT '反馈类型',
  rating TINYINT COMMENT '评分1-5',
  feedback_text TEXT COMMENT '反馈内容',
  improvement_suggestions TEXT COMMENT '改进建议',
  is_resolved BOOLEAN DEFAULT FALSE COMMENT '是否已解决',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  resolved_at TIMESTAMP NULL COMMENT '解决时间',
  INDEX idx_session_id (session_id),
  INDEX idx_user_id (user_id),
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_is_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训反馈表';

-- 6. 用户培训统计表
CREATE TABLE IF NOT EXISTS user_training_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  total_sessions INT DEFAULT 0 COMMENT '总会话数',
  completed_sessions INT DEFAULT 0 COMMENT '已完成会话数',
  total_training_time INT DEFAULT 0 COMMENT '总培训时长（分钟）',
  average_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '平均评分',
  goal_achievement_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '目标达成率',
  current_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner' COMMENT '当前水平',
  improvement_areas JSON COMMENT '待改进领域',
  achievement_unlocked JSON COMMENT '已解锁成就',
  last_training_date TIMESTAMP NULL COMMENT '最后培训日期',
  training_streak INT DEFAULT 0 COMMENT '连续培训天数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_user_id (user_id),
  INDEX idx_current_level (current_level),
  INDEX idx_last_training_date (last_training_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户培训统计表';

-- 7. 培训系统配置表
CREATE TABLE IF NOT EXISTS training_system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  config_value JSON NOT NULL COMMENT '配置值',
  description TEXT COMMENT '配置描述',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训系统配置表';

-- 注意：外键约束和复合索引将在表创建完成后单独添加

SELECT '培训陪练系统数据库表创建完成！' as status;