-- ========================================
-- AI老板助手 - AI提示词配置
-- ========================================

USE education_crm;

-- 插入AI老板综合分析提示词
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `system_prompt`,
  `prompt_content`,
  `variables`,
  `variable_description`,
  `temperature`,
  `max_tokens`,
  `model_provider`
) VALUES (
  'ai_boss_comprehensive_analysis',
  'AI老板综合分析',
  'AI老板助手',
  '你是一个专业的教育培训行业CRM数据分析专家和管理顾问。你擅长从老板/管理层视角分析销售团队的工作质量、客户洞察和业务风险。

你的分析维度包括：
1. **客户洞察**：深入挖掘客户的痛点、需求、兴趣、异议、问题、竞品提及、退费原因、关注焦点、建议
2. **员工质检**：评估员工的服务质量，包括SOP执行情况、违规行为检测、执行力表现
3. **风险预警**：识别业务风险，包括高意向客户未跟进、客户不满、潜在退课/退费风险

你必须客观、专业，基于聊天记录的实际内容进行分析，不得主观臆断。',

  '请对以下销售与客户的微信聊天记录进行全面分析，从客户洞察、员工质检、风险预警三个维度输出结构化的JSON结果。

【聊天记录】
{{chatText}}

【员工信息】
员工ID: {{userId}}
员工角色: {{userRole}}

【客户信息】
客户ID: {{customerId}}
客户意向度: {{customerIntent}}
生命周期阶段: {{lifecycleStage}}

【SOP规则】（需要检查的标准流程）
{{sopRules}}

【违规规则】（需要检查的违规行为）
{{violationRules}}

---

【输出要求】
请严格按照以下JSON格式输出分析结果（不要添加markdown代码块符号，直接输出JSON）：

{
  "customerInsights": {
    "painPoints": [
      {"content": "痛点描述", "keywords": ["关键词1", "关键词2"], "mentionCount": 1}
    ],
    "needs": [
      {"content": "需求描述", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "interests": [
      {"content": "兴趣点描述", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "objections": [
      {"content": "客户异议内容", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "questions": [
      {"content": "客户提出的问题", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "competitors": [
      {"content": "提及的竞品名称或对比内容", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "refundReasons": [
      {"content": "退费原因（如果提及）", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "focusPoints": [
      {"content": "客户重点关注的方面", "keywords": ["关键词"], "mentionCount": 1}
    ],
    "suggestions": [
      {"content": "客户提出的建议", "keywords": ["关键词"], "mentionCount": 1}
    ]
  },

  "qualityCheck": {
    "sopCompliance": {
      "items": [
        {"ruleName": "礼貌问候", "completed": true, "keywords": ["您好"], "content": "匹配到的聊天内容"}
      ],
      "completedCount": 5,
      "totalCount": 7,
      "score": 71
    },
    "violations": [
      {"type": "过度承诺", "content": "违规语句", "keywords": ["保证", "一定"], "severity": "高"}
    ],
    "performance": {
      "messageCount": 15,
      "responseSpeed": "正常",
      "highIntentCustomer": true,
      "serviceAttitude": "良好"
    }
  },

  "riskAlerts": [
    {
      "riskType": "高意向问询未处理",
      "riskLevel": "高",
      "riskScore": 85,
      "riskReason": "客户明确表示高意向，但员工超过2小时未回复",
      "recommendedActions": ["立即联系客户", "确认客户需求", "提供解决方案"]
    }
  ]
}

【分析说明】
1. **客户洞察**：从聊天内容中提取所有相关信息，每种类型可以有多条，keywords用于高亮显示
2. **SOP质检**：根据提供的SOP规则检查，判断每条规则是否完成，计算得分
3. **违规检测**：根据提供的违规规则检查，识别所有违规行为
4. **风险预警**：综合分析识别风险，重点关注：
   - 高意向问询未处理：客户意向高但长时间未跟进
   - 不满风险：客户表达不满、投诉
   - 潜在退课风险：已付费客户询问退课或表示不满
   - 潜在退费风险：客户明确提出退费

请基于实际聊天内容进行分析，如果某些维度没有相关内容，对应数组可为空。',

  '["chatText", "userId", "userRole", "customerId", "customerIntent", "lifecycleStage", "sopRules", "violationRules"]',

  '【变量说明】
chatText: 聊天记录文本
userId: 员工ID
userRole: 员工角色
customerId: 客户ID
customerIntent: 客户意向度
lifecycleStage: 生命周期阶段
sopRules: SOP规则JSON字符串
violationRules: 违规规则JSON字符串',

  0.7,
  3000,
  'deepseek'
);

SELECT '✅ AI老板综合分析提示词配置成功！' AS message;
SELECT scenario_key, scenario_name FROM ai_prompt_configs WHERE scenario_key = 'ai_boss_comprehensive_analysis';
