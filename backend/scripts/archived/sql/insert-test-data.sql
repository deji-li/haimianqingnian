-- ==========================================
-- AI知识挖掘测试数据
-- ==========================================

-- 插入待审核的知识（AI挖掘结果）
INSERT INTO knowledge_pending_review (
  question, answer, keywords,
  scene_category, product_category, customer_type, question_type,
  ai_score, confidence_score,
  source_type, mining_reason,
  review_status, mining_batch_id, mining_time, create_time
) VALUES
-- 高质量待审核
(
  '如何办理退学退费手续？',
  '学员需携带身份证、学员证到财务部填写《退费申请表》，由班主任签字确认后，财务部将在7个工作日内完成退费审核。退费金额将按照课程进度扣除已消耗课时费用后，退还至原支付账户。',
  '退学,退费,手续,流程,财务',
  '售后服务',
  '学籍管理',
  '老客户',
  '咨询类',
  92.5,
  88.0,
  'chat_mining',
  '该问题在近期客服对话中频繁出现（5次），且客户满意度高，建议收录',
  'pending',
  'BATCH_2024_001',
  NOW(),
  NOW()
),
(
  '课程可以试听吗？试听期多久？',
  '我们提供免费试听服务，试听期为7天。学员可在试听期内体验任意课程，如不满意可全额退款。试听课程数量不限，但需要提前预约。',
  '试听,免费,期限,退款',
  '营销活动',
  '课程体验',
  '新客户',
  '咨询类',
  89.0,
  85.5,
  'chat_mining',
  '新客户咨询中的高频问题，回答专业且清晰',
  'pending',
  'BATCH_2024_001',
  NOW(),
  NOW()
),
(
  '请假超过多久需要办理休学？',
  '根据学校规定，连续请假超过30天或累计请假超过60天的学员，需要办理休学手续。休学期间保留学籍，休学期限最长为1年。复学时需提前1个月向教务处提交复学申请。',
  '请假,休学,期限,规定',
  '常见问题',
  '学籍管理',
  '老客户',
  '咨询类',
  91.0,
  87.0,
  'chat_mining',
  '学籍管理相关的重要政策，需要明确告知学员',
  'pending',
  'BATCH_2024_001',
  NOW(),
  NOW()
),
-- 中等质量待审核
(
  '教材费包含在学费里吗？',
  '教材费不包含在学费中，需要单独购买。教材费用根据课程不同在200-500元之间。学员也可以选择自行购买教材，但需确保版本与教学大纲一致。',
  '教材,费用,学费,购买',
  '价格政策',
  '费用说明',
  '新客户',
  '咨询类',
  78.5,
  75.0,
  'chat_mining',
  '价格相关的常见咨询，回答较为完整',
  'pending',
  'BATCH_2024_002',
  NOW(),
  NOW()
),
(
  '如何查询考试成绩？',
  '考试成绩会在考试结束后3个工作日内公布。学员可通过学员系统查询，或关注公众号接收成绩推送通知。如对成绩有异议，可在成绩公布后7天内申请复查。',
  '成绩,查询,考试,复查',
  '技术支持',
  '系统使用',
  '老客户',
  '咨询类',
  82.0,
  79.0,
  'chat_mining',
  '学员系统使用相关问题，回答清晰',
  'pending',
  'BATCH_2024_002',
  NOW(),
  NOW()
),
-- 已通过审核
(
  '忘记密码怎么办？',
  '可以通过以下方式重置密码：1. 点击登录页面"忘记密码"链接；2. 输入注册手机号获取验证码；3. 验证成功后设置新密码。如仍无法登录，请联系客服400-123-4567。',
  '密码,重置,找回,登录',
  '技术支持',
  '系统使用',
  '新客户',
  '技术类',
  95.0,
  92.0,
  'industry_recommend',
  '教育行业通用问题，高质量答案',
  'auto_approved',
  'BATCH_2024_003',
  NOW(),
  NOW()
),
-- 已拒绝
(
  '老师好不好？',
  '我们的老师都很好啊，经验丰富。',
  '老师,评价',
  '产品介绍',
  '师资力量',
  '新客户',
  '咨询类',
  45.0,
  40.0,
  'chat_mining',
  'AI评分：回答过于简单，缺乏具体信息',
  'rejected',
  'BATCH_2024_004',
  NOW(),
  NOW()
);

-- ==========================================
-- 负反馈测试数据
-- ==========================================

INSERT INTO knowledge_feedback (
  knowledge_id, user_id, customer_id,
  feedback_scene, feedback_type, feedback_reason, feedback_detail,
  handled, create_time
) VALUES
-- 未处理的负反馈
(
  1, 1, NULL,
  'knowledge_search', 'negative', '内容不相关',
  '客户询问的是退费流程，但这条知识讲的是请假流程，不符合客户需求。建议修改或补充退费相关内容。',
  FALSE, NOW() - INTERVAL 2 DAY
),
(
  2, 1, NULL,
  'ai_chat', 'negative', '信息过时',
  '联系电话已经更换，现在的客服电话是400-999-8888，但知识库中还是旧电话。',
  FALSE, NOW() - INTERVAL 1 DAY
),
(
  3, 1, NULL,
  'knowledge_search', 'negative', '表述不清',
  '关于试听期的说明不够详细，没有说明试听期内是否可以参加正式考试。',
  FALSE, NOW() - INTERVAL 5 HOUR
),
(
  5, 1, NULL,
  'ai_recommendation', 'negative', '缺少细节',
  '教材费用范围太宽泛，能否按照具体课程列出详细价格表？',
  FALSE, NOW() - INTERVAL 3 HOUR
),
-- 已处理的负反馈
(
  1, 1, NULL,
  'knowledge_search', 'negative', '内容重复',
  '该知识条目与ID为15的条目内容基本重复，建议合并。',
  TRUE, NOW() - INTERVAL 7 DAY
),
(
  10, 1, NULL,
  'ai_chat', 'negative', '信息错误',
  '休学期限写的是1年，但实际政策是2年。',
  TRUE, NOW() - INTERVAL 5 DAY
),
-- 正反馈
(
  4, 1, NULL,
  'knowledge_search', 'positive', '内容准确',
  '这条知识非常有用，客户看到后立即解决了疑问。',
  TRUE, NOW() - INTERVAL 3 DAY
);

-- 更新知识库的负反馈计数
UPDATE enterprise_knowledge_base
SET negative_feedback_count = (
  SELECT COUNT(*)
  FROM knowledge_feedback
  WHERE knowledge_id = enterprise_knowledge_base.id
    AND feedback_type = 'negative'
)
WHERE id IN (1, 2, 3, 5, 10);
