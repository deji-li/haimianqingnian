-- ========================================
-- AI话术助手场景和技巧初始化数据
-- ========================================

-- ==================== 帮你谈单 / 帮你回复 ====================
-- 这两个功能使用相同的9个场景和82个技巧

-- 场景1：产品介绍
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '产品介绍', '产品介绍', '向客户介绍产品特点、功能和优势', 1);
SET @scenario_deal_1 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '产品介绍', '产品介绍', '回答客户关于产品的问题', 1);
SET @scenario_reply_1 = LAST_INSERT_ID();

-- 产品介绍技巧（9个）
INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_1, '特点强调', '突出产品独特卖点的话术', '特点,卖点,优势,独特', 1),
(@scenario_deal_1, '价值传递', '传递产品价值和客户收益的话术', '价值,收益,效果,好处', 2),
(@scenario_deal_1, '场景化描述', '以具体场景增强产品吸引力的话术', '场景,应用,实际,使用', 3),
(@scenario_deal_1, '对比说明', '对比竞品凸显优势的话术', '对比,竞品,优于,超越', 4),
(@scenario_deal_1, '客户案例', '分享成功案例增强可信度的话术', '案例,成功,客户,效果', 5),
(@scenario_deal_1, '功能展示', '详细展示核心功能的话术', '功能,特性,能力,可以', 6),
(@scenario_deal_1, '引发兴趣', '激发客户进一步了解产品兴趣的话术', '兴趣,好奇,了解,关注', 7),
(@scenario_deal_1, '互动提问', '通过提问引导客户思考的话术', '提问,询问,需求,痛点', 8),
(@scenario_deal_1, '专业解答', '以专业角度回答产品相关问题的话术', '专业,解答,说明,详细', 9);

-- 复制给 reply_assist
INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_1, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_1;

-- 场景2：破除犹豫
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '破除犹豫', '异议处理', '打消客户犹豫心理，推动决策', 2);
SET @scenario_deal_2 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '破除犹豫', '异议处理', '回应客户的犹豫和顾虑', 2);
SET @scenario_reply_2 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_2, '疑虑分析', '理解客户疑虑帮其梳理的话术', '疑虑,担心,顾虑,困惑', 1),
(@scenario_deal_2, '权威背书', '提供权威支持增强信任的话术', '权威,认证,资质,保障', 2),
(@scenario_deal_2, '限时优惠', '利用稀缺性促成决策的话术', '优惠,限时,活动,机会', 3),
(@scenario_deal_2, '风险承诺', '承诺降低决策风险的话术', '风险,保障,承诺,保证', 4),
(@scenario_deal_2, '同理共鸣', '理解并共鸣客户情绪的话术', '理解,同理,正常,常见', 5),
(@scenario_deal_2, '对比损失', '对比不选择的损失成本的话术', '损失,错过,成本,代价', 6),
(@scenario_deal_2, '拆解顾虑', '逐一拆解客户顾虑的话术', '拆解,逐个,分析,解决', 7),
(@scenario_deal_2, '引导决策', '引导客户迈出决策步骤的话术', '决策,行动,开始,尝试', 8),
(@scenario_deal_2, '成功对比', '分享他人决策成功案例的话术', '成功,案例,客户,效果', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_2, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_2;

-- 场景3：建立信任
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '建立信任', '首次沟通', '与客户建立信任关系', 3);
SET @scenario_deal_3 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '建立信任', '首次沟通', '回应客户建立信任的话术', 3);
SET @scenario_reply_3 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_3, '真诚态度', '展现真诚专业态度的话术', '真诚,专业,用心,负责', 1),
(@scenario_deal_3, '资质展示', '展示企业资质和实力的话术', '资质,实力,荣誉,认证', 2),
(@scenario_deal_3, '透明沟通', '保持透明坦诚沟通的话术', '透明,坦诚,真实,清楚', 3),
(@scenario_deal_3, '客户口碑', '分享客户好评建立信任的话术', '口碑,好评,满意,推荐', 4),
(@scenario_deal_3, '倾听理解', '认真倾听客户需求的话术', '倾听,理解,关注,重视', 5),
(@scenario_deal_3, '专业形象', '塑造专业可靠形象的话术', '专业,可靠,经验,擅长', 6),
(@scenario_deal_3, '承诺兑现', '做出可兑现承诺的话术', '承诺,保证,一定,确保', 7),
(@scenario_deal_3, '共情建立', '与客户建立情感共鸣的话术', '共鸣,理解,感同身受,关心', 8),
(@scenario_deal_3, '长期价值', '强调长期合作价值的话术', '长期,持续,合作,共赢', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_3, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_3;

-- 场景4：需求挖掘
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '需求挖掘', '需求分析', '深入挖掘客户真实需求', 4);
SET @scenario_deal_4 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '需求挖掘', '需求分析', '回应客户需求挖掘的话术', 4);
SET @scenario_reply_4 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_4, '开放式提问', '用开放问题引导客户表达的话术', '开放,提问,了解,分享', 1),
(@scenario_deal_4, '痛点探寻', '挖掘客户核心痛点的话术', '痛点,问题,困扰,难题', 2),
(@scenario_deal_4, '场景还原', '引导客户描述具体场景的话术', '场景,具体,情况,实际', 3),
(@scenario_deal_4, '深层挖掘', '追问深层需求的话术', '深层,根本,本质,真正', 4),
(@scenario_deal_4, '需求确认', '确认理解客户需求的话术', '确认,理解,对吗,是否', 5),
(@scenario_deal_4, '优先排序', '帮助客户梳理需求优先级的话术', '优先,重要,关键,首要', 6),
(@scenario_deal_4, '潜在需求', '引导客户发现潜在需求的话术', '潜在,未来,可能,还有', 7),
(@scenario_deal_4, '需求总结', '总结归纳客户需求的话术', '总结,归纳,整理,概括', 8),
(@scenario_deal_4, '需求关联', '关联产品与客户需求的话术', '关联,匹配,符合,满足', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_4, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_4;

-- 场景5：塑造价值
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '塑造价值', '价值展示', '塑造产品价值感知', 5);
SET @scenario_deal_5 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '塑造价值', '价值展示', '回应价值相关问题', 5);
SET @scenario_reply_5 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_5, 'ROI量化', '量化投资回报率的话术', 'ROI,回报,收益,效益', 1),
(@scenario_deal_5, '成本对比', '对比使用成本与价值的话术', '成本,对比,节省,划算', 2),
(@scenario_deal_5, '效果承诺', '承诺具体效果的话术', '效果,结果,达到,实现', 3),
(@scenario_deal_5, '独特优势', '强调独特竞争优势的话术', '独特,唯一,领先,优势', 4),
(@scenario_deal_5, '长期收益', '强调长期收益的话术', '长期,持续,累积,增长', 5),
(@scenario_deal_5, '附加价值', '展示额外附加价值的话术', '附加,额外,赠送,服务', 6),
(@scenario_deal_5, '价值锚点', '设置价值对比锚点的话术', '锚点,对比,参照,相比', 7),
(@scenario_deal_5, '客户证言', '用客户证言展示价值的话术', '证言,反馈,评价,认可', 8),
(@scenario_deal_5, '综合价值', '综合展示多维价值的话术', '综合,全面,多方面,整体', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_5, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_5;

-- 场景6：异议处理
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '异议处理', '异议处理', '处理客户异议和反对意见', 6);
SET @scenario_deal_6 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '异议处理', '异议处理', '回应客户的异议', 6);
SET @scenario_reply_6 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_6, '认同技巧', '先认同再引导的话术', '认同,理解,确实,您说得对', 1),
(@scenario_deal_6, '反转异议', '将异议转化为优势的话术', '反转,其实,恰恰,正因为', 2),
(@scenario_deal_6, '证据支持', '用事实证据回应异议的话术', '证据,事实,数据,案例', 3),
(@scenario_deal_6, '分解异议', '拆解异议逐个击破的话术', '拆解,具体,哪方面,比如', 4),
(@scenario_deal_6, '对比说明', '对比竞品化解异议的话术', '对比,相比,其他,市场', 5),
(@scenario_deal_6, '转移焦点', '转移到正面焦点的话术', '转移,关注,其实,更重要', 6),
(@scenario_deal_6, '延迟处理', '暂缓异议继续推进的话术', '暂且,先,我们,稍后', 7),
(@scenario_deal_6, '共鸣化解', '情感共鸣化解异议的话术', '共鸣,感受,理解,正常', 8),
(@scenario_deal_6, '价值重申', '重申价值淡化异议的话术', '价值,收益,关键,核心', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_6, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_6;

-- 场景7：价格谈判
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '价格谈判', '价格咨询', '处理价格相关谈判', 7);
SET @scenario_deal_7 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '价格谈判', '价格咨询', '回应价格相关问题', 7);
SET @scenario_reply_7 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_7, '价值先行', '先强调价值再谈价格的话术', '价值,先,然后,值得', 1),
(@scenario_deal_7, '分解报价', '分解价格构成的话术', '分解,包含,包括,组成', 2),
(@scenario_deal_7, '套餐优惠', '推荐优惠套餐的话术', '套餐,组合,优惠,划算', 3),
(@scenario_deal_7, '对比合理', '对比说明价格合理性的话术', '对比,市场,合理,公道', 4),
(@scenario_deal_7, '让步技巧', '有条件让步的话术', '让步,如果,那么,可以', 5),
(@scenario_deal_7, '锚定价格', '设置价格锚点的话术', '锚定,原价,现价,优惠', 6),
(@scenario_deal_7, '长期优惠', '强调长期合作优惠的话术', '长期,持续,优惠,折扣', 7),
(@scenario_deal_7, '转移焦点', '从价格转移到价值的话术', '转移,其实,关键,重要', 8),
(@scenario_deal_7, '付款方案', '提供灵活付款方案的话术', '付款,分期,方案,灵活', 9),
(@scenario_deal_7, '增值服务', '用增值服务弥补价格的话术', '增值,服务,赠送,额外', 10);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_7, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_7;

-- 场景8：促成交易
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '促成交易', '成交促进', '推动成交的关键时刻', 8);
SET @scenario_deal_8 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '促成交易', '成交促进', '回应成交相关问题', 8);
SET @scenario_reply_8 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_8, '假设成交', '假设已成交引导下一步的话术', '假设,当,之后,接下来', 1),
(@scenario_deal_8, '紧迫感营造', '营造紧迫感的话术', '紧迫,限时,名额,抓紧', 2),
(@scenario_deal_8, '二选一法', '让客户在两个选项中选择的话术', '选择,还是,哪个,倾向', 3),
(@scenario_deal_8, '小步成交', '降低决策门槛的话术', '小步,先,试试,开始', 4),
(@scenario_deal_8, '总结优势', '总结核心优势推动成交的话术', '总结,优势,核心,关键', 5),
(@scenario_deal_8, '消除顾虑', '最后消除顾虑的话术', '顾虑,放心,保障,承诺', 6),
(@scenario_deal_8, '行动引导', '明确引导成交行动的话术', '行动,签约,办理,合作', 7),
(@scenario_deal_8, '感谢期待', '表达感谢和期待的话术', '感谢,期待,合作,共赢', 8),
(@scenario_deal_8, '后续服务', '承诺后续服务的话术', '后续,服务,支持,跟进', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_8, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_8;

-- 场景9：应对拒绝
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('deal_assist', '应对拒绝', '异议处理', '应对客户拒绝和反对', 9);
SET @scenario_deal_9 = LAST_INSERT_ID();

INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('reply_assist', '应对拒绝', '异议处理', '回应客户的拒绝', 9);
SET @scenario_reply_9 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_deal_9, '理解接纳', '理解接纳客户拒绝的话术', '理解,接纳,尊重,没关系', 1),
(@scenario_deal_9, '挖掘原因', '探寻拒绝真实原因的话术', '原因,为什么,具体,哪方面', 2),
(@scenario_deal_9, '保持联系', '维持后续联系机会的话术', '联系,保持,以后,随时', 3),
(@scenario_deal_9, '降低要求', '降低合作门槛的话术', '降低,简单,试试,体验', 4),
(@scenario_deal_9, '转介绍', '寻求转介绍机会的话术', '转介绍,推荐,朋友,认识', 5),
(@scenario_deal_9, '时机把握', '把握未来时机的话术', '时机,将来,未来,合适', 6),
(@scenario_deal_9, '价值重申', '再次重申核心价值的话术', '重申,价值,其实,确实', 7),
(@scenario_deal_9, '礼貌告别', '礼貌专业告别的话术', '告别,感谢,祝福,再见', 8),
(@scenario_deal_9, '留下印象', '留下良好专业印象的话术', '印象,记住,需要,随时', 9);

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`)
SELECT @scenario_reply_9, `technique_name`, `technique_desc`, `keywords`, `sort_order`
FROM `ai_script_technique` WHERE `scenario_id` = @scenario_deal_9;

-- ==================== 开场白 ====================

-- 场景1：祝福问候
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '祝福问候', '首次沟通', '祝福和问候类开场白', 1);

SET @scenario_opening_1 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_1, '工作祝福', '个性化祝贺客户职业成就的话术', '工作,职业,成就,祝贺', 1),
(@scenario_opening_1, '健康祝愿', '传递健康祝愿，加深客户情感联系的话术', '健康,祝愿,身体,平安', 2),
(@scenario_opening_1, '家庭幸福', '传递家庭幸福祝愿的话术', '家庭,幸福,美满,温馨', 3),
(@scenario_opening_1, '事业进步', '恭祝职业成就祝愿未来发展的话术', '事业,进步,发展,成功', 4),
(@scenario_opening_1, '心情愉快', '传递积极内容营造愉快氛围的话术', '心情,愉快,开心,快乐', 5),
(@scenario_opening_1, '合作顺利', '满意当前合作期待未来共赢的话术', '合作,顺利,共赢,愉快', 6),
(@scenario_opening_1, '梦想成真', '赞许客户成就祝福梦想实现的话术', '梦想,成真,实现,目标', 7),
(@scenario_opening_1, '节日问候', '节日问候加深客户情感联系的话术', '节日,问候,祝福,快乐', 8);

-- 场景2：自我介绍
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '自我介绍', '首次沟通', '专业的自我介绍开场白', 2);

SET @scenario_opening_2 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_2, '自信大方', '自信大方展现魅力的自我介绍话术', '自信,大方,魅力,专业', 1),
(@scenario_opening_2, '简洁明了', '简洁快速传递关键信息的自我介绍话术', '简洁,明了,清晰,快速', 2),
(@scenario_opening_2, '突出重点', '突出核心优势的自我介绍话术', '重点,核心,优势,擅长', 3),
(@scenario_opening_2, '礼貌热情', '友好态度营造积极沟通氛围的自我介绍', '礼貌,热情,友好,态度', 4),
(@scenario_opening_2, '建立信任', '利用专业背景和成功案例快速建立信任的自我介绍', '信任,专业,背景,案例', 5),
(@scenario_opening_2, '建立共鸣', '利用共同背景与客户建立信任的自我介绍', '共鸣,共同,背景,联系', 6),
(@scenario_opening_2, '积极引导', '树立专业形象并引导客户关注核心价值的自我介绍', '引导,价值,关注,重要', 7),
(@scenario_opening_2, '关注需求', '聚焦客户需求展现专业性的自我介绍', '需求,聚焦,专注,帮助', 8);

-- 场景3：需求探询
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '需求探询', '需求分析', '探询客户需求的开场白', 3);

SET @scenario_opening_3 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_3, '倾听为先', '强调倾听客户需求的话术', '倾听,需求,了解,关注', 1),
(@scenario_opening_3, '开门见山', '直接询问需求的话术', '开门见山,直接,需求,想要', 2),
(@scenario_opening_3, '关注痛点', '关注客户痛点的话术', '痛点,问题,困扰,挑战', 3),
(@scenario_opening_3, '问题引导', '通过问题引导的话术', '提问,引导,了解,探讨', 4),
(@scenario_opening_3, '关联业务', '关联客户业务场景的话术', '业务,场景,实际,工作', 5),
(@scenario_opening_3, '场景模拟', '模拟具体场景的话术', '场景,模拟,假设,比如', 6);

-- 场景4：消除顾虑
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '消除顾虑', '异议处理', '消除客户顾虑的开场白', 4);

SET @scenario_opening_4 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_4, '理解认同', '理解认同客户顾虑的话术', '理解,认同,正常,常见', 1),
(@scenario_opening_4, '提供保障', '提供保障消除顾虑的话术', '保障,保证,承诺,放心', 2),
(@scenario_opening_4, '案例分享', '分享成功案例的话术', '案例,成功,客户,效果', 3),
(@scenario_opening_4, '专业解答', '专业解答疑虑的话术', '专业,解答,说明,详细', 4),
(@scenario_opening_4, '强调优势', '强调产品优势的话术', '优势,特点,领先,独特', 5),
(@scenario_opening_4, '制定方案', '针对性制定方案的话术', '方案,针对,定制,个性化', 6),
(@scenario_opening_4, '建立信任', '快速建立信任的话术', '信任,可靠,专业,资质', 7),
(@scenario_opening_4, '邀请体验', '邀请体验消除顾虑的话术', '体验,试用,感受,了解', 8);

-- 场景5：互动提问
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '互动提问', '需求分析', '互动提问类开场白', 5);

SET @scenario_opening_5 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_5, '开放式提问', '促进客户分享观点和需求的问题', '开放,提问,分享,观点', 1),
(@scenario_opening_5, '引导性提问', '引导客户揭示需求与痛点的问题', '引导,需求,痛点,发现', 2),
(@scenario_opening_5, '关注痛点提问', '挖掘和确认客户痛点的问题', '痛点,确认,挖掘,问题', 3),
(@scenario_opening_5, '需求优先级提问', '帮助客户确定并排序关键需求的问题', '优先级,排序,重要,关键', 4),
(@scenario_opening_5, '预算相关提问', '探讨预算的问题', '预算,投资,费用,成本', 5),
(@scenario_opening_5, '反馈性提问', '征询反馈确认客户接受度的问题', '反馈,接受,认可,满意', 6),
(@scenario_opening_5, '合作意向提问', '探询合作意向的问题', '合作,意向,兴趣,考虑', 7),
(@scenario_opening_5, '后续跟进提问', '确认下次跟进时间的问题', '跟进,下次,时间,联系', 8);

-- 场景6：传达价值
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '传达价值', '价值展示', '传达产品价值的开场白', 6);

SET @scenario_opening_6 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_6, '突出优势', '展示产品优势凸显价值的话术', '优势,特点,价值,卖点', 1),
(@scenario_opening_6, '解决痛点', '利用案例阐述产品解决痛点凸显价值的话术', '痛点,解决,案例,效果', 2),
(@scenario_opening_6, '案例佐证', '分享案例展示产品应用效果的话术', '案例,效果,证明,实际', 3),
(@scenario_opening_6, '对比说明', '对比竞品凸显产品独特价值与客户额外利益的话术', '对比,竞品,独特,利益', 4),
(@scenario_opening_6, '数据支持', '以数据展示产品效益强调实际收益的话术', '数据,效益,收益,提升', 5),
(@scenario_opening_6, '客户收益', '以实例和数据展示产品助提效率、降成本、增竞争力的话术', '收益,效率,成本,竞争力', 6),
(@scenario_opening_6, '个性化定制', '展示产品定制价值吸引客户深入合作的话术', '定制,个性化,专属,针对', 7),
(@scenario_opening_6, '专业保障', '阐述产品性能与服务优势保障稳定体验与持续价值的话术', '专业,保障,服务,稳定', 8),
(@scenario_opening_6, '长期价值', '强调产品耐用性和成本效益提升客户长期投资认知的话术', '长期,耐用,成本效益,投资', 9);

-- 场景7：挖掘兴趣
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '挖掘兴趣', '需求分析', '挖掘客户兴趣的开场白', 7);

SET @scenario_opening_7 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_7, '设问引发好奇', '用设问激发客户好奇心的话术', '设问,好奇,想知道,是否', 1),
(@scenario_opening_7, '关注热点', '结合热点话题引发兴趣的话术', '热点,话题,趋势,关注', 2),
(@scenario_opening_7, '分享趣闻', '分享相关趣闻的话术', '趣闻,有趣,案例,故事', 3),
(@scenario_opening_7, '提问引导', '通过提问引导兴趣的话术', '提问,引导,感兴趣,关心', 4),
(@scenario_opening_7, '个性化推荐', '个性化推荐引发兴趣的话术', '个性化,推荐,适合,匹配', 5),
(@scenario_opening_7, '展示创新', '展示创新点引发兴趣的话术', '创新,新颖,独特,领先', 6),
(@scenario_opening_7, '提供试用', '邀请试用体验的话术', '试用,体验,感受,尝试', 7),
(@scenario_opening_7, '建立共鸣', '建立兴趣共鸣的话术', '共鸣,共同,相似,理解', 8);

-- 场景8：分享趋势
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '分享趋势', '价值展示', '分享行业趋势的开场白', 8);

SET @scenario_opening_8 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_8, '数据支撑', '用数据支撑趋势观点的话术', '数据,支撑,统计,显示', 1),
(@scenario_opening_8, '行业分析', '分析行业趋势的话术', '行业,分析,趋势,发展', 2),
(@scenario_opening_8, '政策解读', '解读相关政策趋势的话术', '政策,解读,方向,导向', 3),
(@scenario_opening_8, '技术引领', '介绍技术趋势的话术', '技术,引领,创新,未来', 4),
(@scenario_opening_8, '案例说明', '用案例说明趋势的话术', '案例,说明,实际,证明', 5),
(@scenario_opening_8, '对比分析', '对比分析趋势变化的话术', '对比,变化,以前,现在', 6),
(@scenario_opening_8, '未来展望', '展望未来趋势的话术', '未来,展望,预测,将会', 7),
(@scenario_opening_8, '客户关联', '关联趋势与客户业务的话术', '关联,业务,影响,机会', 8);

-- 场景9：引导深入
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '引导深入', '需求分析', '引导客户深入交流的开场白', 9);

SET @scenario_opening_9 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_9, '关联需求', '引导客户探索核心需求与潜在问题的话术', '需求,探索,核心,潜在', 1),
(@scenario_opening_9, '提出问题', '启发客户思考深入挖掘需求的问题话术', '问题,思考,深入,挖掘', 2),
(@scenario_opening_9, '分享见解', '以专业视角分享见解建立紧密沟通的话术', '见解,专业,视角,分享', 3),
(@scenario_opening_9, '案例引导', '以成功案例激发客户兴趣的话术', '案例,成功,激发,兴趣', 4),
(@scenario_opening_9, '关注痛点', '挖掘痛点深入探讨客户关心问题的话术', '痛点,探讨,关心,深入', 5),
(@scenario_opening_9, '邀请反馈', '引导客户分享精准挖掘需求的话术', '反馈,分享,挖掘,精准', 6),
(@scenario_opening_9, '提出建议', '提供针对性建议引导客户探讨需求的话术', '建议,针对性,探讨,方案', 7),
(@scenario_opening_9, '建立共识', '解决方案达成共识的话术', '共识,达成,一致,认同', 8),
(@scenario_opening_9, '约定时间', '约定深入交流时间的跟进话术', '约定,时间,深入,交流', 9);

-- 场景10：情感链接
INSERT INTO `ai_script_scenario` (`function_type`, `scenario_name`, `scene_category`, `scenario_desc`, `sort_order`) VALUES
('opening_lines', '情感链接', '首次沟通', '建立情感链接的开场白', 10);

SET @scenario_opening_10 = LAST_INSERT_ID();

INSERT INTO `ai_script_technique` (`scenario_id`, `technique_name`, `technique_desc`, `keywords`, `sort_order`) VALUES
(@scenario_opening_10, '共情理解', '共情理解增强客户情感纽带的话术', '共情,理解,感受,体会', 1),
(@scenario_opening_10, '真诚关心', '展现真诚关心建立情感纽带的话术', '真诚,关心,在意,重视', 2),
(@scenario_opening_10, '赞美认可', '认可客户成就增强情感链接的话术', '赞美,认可,成就,优秀', 3),
(@scenario_opening_10, '兴趣共鸣', '挖掘共同兴趣分享经验深化情感链接的话术', '兴趣,共同,分享,经验', 4),
(@scenario_opening_10, '经历分享', '分享经历建立情感链接的话术', '经历,分享,故事,经验', 5),
(@scenario_opening_10, '情感投入', '真诚关怀建立情感链接的话术', '情感,关怀,用心,真心', 6),
(@scenario_opening_10, '关注需求', '挖掘客户需求展现专业关注的话术', '需求,关注,专注,重视', 7),
(@scenario_opening_10, '信任建立', '建立情感共鸣增强客户信任的话术', '信任,共鸣,可靠,依赖', 8),
(@scenario_opening_10, '支持承诺', '承诺助力客户目标展现长期的话术', '支持,承诺,助力,帮助', 9);


