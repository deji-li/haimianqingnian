-- 初始化企业微信AI触发规则
-- 用于自动触发AI分析和质检

DELETE FROM wework_ai_trigger_rules;

-- 关键词触发规则
INSERT INTO wework_ai_trigger_rules (
  rule_name, description, trigger_type, trigger_conditions, action_config, action_type, priority, is_active
) VALUES
('价格咨询分析', '当客户咨询价格时触发深度AI分析', 'keyword',
 JSON_OBJECT('keywords', JSON_ARRAY('价格', '费用', '学费', '收费', '多少钱', '贵不贵')),
 JSON_OBJECT('messageCount', 20),
 'ai_analysis', 90, 1),

('课程咨询分析', '当客户咨询课程时触发深度AI分析', 'keyword',
 JSON_OBJECT('keywords', JSON_ARRAY('课程', '学习', '培训', '辅导', '上课', '老师')),
 JSON_OBJECT('messageCount', 15),
 'ai_analysis', 85, 1),

('异议处理分析', '当客户表达异议时触发AI分析', 'keyword',
 JSON_OBJECT('keywords', JSON_ARRAY('太贵了', '考虑一下', '再看看', '不需要', '已经报名了')),
 JSON_OBJECT('messageCount', 10),
 'ai_analysis', 88, 1),

('高意向客户识别', '当客户表达强烈兴趣时触发', 'keyword',
 JSON_OBJECT('keywords', JSON_ARRAY('马上报名', '今天报名', '怎么报名', '什么时候开课')),
 JSON_OBJECT('messageCount', 5),
 'ai_analysis', 95, 1),

-- 消息类型触发规则
('图片消息分析', '收到图片消息时触发OCR和AI分析', 'message_type',
 JSON_OBJECT('messageTypes', JSON_ARRAY('image')),
 JSON_OBJECT('messageCount', 1),
 'ai_analysis', 70, 1),

('语音消息分析', '收到语音消息时触发转写和AI分析', 'message_type',
 JSON_OBJECT('messageTypes', JSON_ARRAY('voice')),
 JSON_OBJECT('messageCount', 1),
 'ai_analysis', 70, 1),

('文件消息分析', '收到文件消息时触发文本提取和AI分析', 'message_type',
 JSON_OBJECT('messageTypes', JSON_ARRAY('file', 'doc')),
 JSON_OBJECT('messageCount', 1),
 'ai_analysis', 60, 1),

-- 时间间隔触发规则
('定期分析', '每24小时自动分析客户的最新聊天记录', 'time_interval',
 JSON_OBJECT('intervalHours', 24, 'messageCount', 50),
 JSON_OBJECT('messageCount', 50),
 'ai_analysis', 50, 1);

-- 验证插入结果
SELECT '✅ 企业微信AI触发规则初始化完成' AS status;
SELECT rule_name, trigger_type, action_type, priority, is_active
FROM wework_ai_trigger_rules
ORDER BY priority DESC;