import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AiConfigService } from '../../../modules/ai-config/ai-config.service';
import { AiApiKeyService } from '../../../modules/ai-config/ai-api-key.service';

/**
 * AI分析结果接口（20+维度）
 */
export interface AiAnalysisResult {
  // 核心评估
  qualityLevel: 'A' | 'B' | 'C' | 'D';
  riskLevel: '无风险' | '低' | '中' | '高';
  intentionScore: number; // 0-100
  communicationSummary: string;

  // 客户画像 (10个维度)
  customerProfile: {
    parentRole: string; // 家长身份：妈妈/爸爸/爷爷奶奶
    studentGrade: string; // 学生年级
    studentAge: number; // 学生年龄
    familyEconomicLevel: string; // 家庭经济水平：高/中/低
    educationAttitude: string; // 教育重视程度：很重视/一般/不太重视
    decisionMakerRole: string; // 决策者角色：单独决策/共同决策/需配偶同意
    communicationStyle: string; // 沟通风格：直接/委婉/理性/感性
    timeAvailability: string; // 时间充裕度：充足/一般/紧张
    location: string; // 所在地区/城市
    wechatActivity: string; // 微信活跃度：高/中/低
  };

  // 需求分析 (5个维度)
  customerNeeds: string[]; // 明确需求列表
  customerPainPoints: string[]; // 客户痛点
  customerInterests: string[]; // 感兴趣的点
  customerObjections: string[]; // 客户异议/顾虑
  competitorMentioned: string[]; // 提到的竞品

  // 情绪与态度
  customerMindset: string; // 客户心态：积极/观望/抗拒/犹豫
  emotionalTone: string; // 情绪基调：友好/中立/不耐烦/负面
  trustLevel: string; // 信任程度：高/中/低

  // 商机评估 (5个维度)
  estimatedValue: number; // 预估成交金额
  estimatedCycle: string; // 预估成交周期：短期（1周内）/中期（1-4周）/长期（1个月+）
  dealOpportunity: string; // 成交机会：高/中/低
  urgency: string; // 紧迫性：高/中/低
  competitiveness: string; // 竞争激烈程度：高/中/低

  // 销售策略建议
  nextSteps: string[]; // 下一步行动建议
  salesStrategy: string; // 销售策略
  recommendedScripts: {
    opening?: string; // 开场白话术
    valueProposition?: string; // 价值主张话术
    objectionHandling?: string; // 应对异议话术
    closing?: string; // 促成话术
  };

  // 风险预警
  riskFactors: string[]; // 风险因素
  riskReason: string; // 风险原因说明
}

/**
 * DeepSeek分析服务
 * 负责对聊天记录进行20+维度的深度AI分析
 */
@Injectable()
export class DeepseekAnalysisService {
  private readonly logger = new Logger(DeepseekAnalysisService.name);

  // 缓存API密钥配置，避免每次都查数据库
  private cachedConfig: {
    apiKey: string;
    apiUrl: string;
    modelName: string;
    lastUpdate: number;
  } | null = null;
  private readonly cacheTimeout = 60000; // 缓存1分钟

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AiConfigService))
    private readonly aiConfigService: AiConfigService,
    @Inject(forwardRef(() => AiApiKeyService))
    private readonly aiApiKeyService: AiApiKeyService,
  ) {}

  /**
   * 获取DeepSeek API配置（优先从数据库，fallback到.env）
   */
  private async getApiConfig(): Promise<{ apiKey: string; apiUrl: string; modelName: string }> {
    // 检查缓存是否有效
    if (this.cachedConfig && Date.now() - this.cachedConfig.lastUpdate < this.cacheTimeout) {
      return this.cachedConfig;
    }

    try {
      // 优先从数据库读取
      const dbConfig = await this.aiApiKeyService.findByProvider('deepseek');

      if (dbConfig && dbConfig.apiKey && dbConfig.apiUrl) {
        this.logger.log('使用数据库中的DeepSeek API配置');
        this.cachedConfig = {
          apiKey: dbConfig.apiKey,
          apiUrl: dbConfig.apiUrl,
          modelName: dbConfig.modelName || 'deepseek-chat',
          lastUpdate: Date.now(),
        };
        return this.cachedConfig;
      }
    } catch (error) {
      this.logger.warn(`从数据库读取DeepSeek配置失败，fallback到环境变量: ${error.message}`);
    }

    // Fallback到环境变量
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    const apiUrl = this.configService.get<string>('DEEPSEEK_API_URL', '');
    const modelName = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');

    if (!apiKey || apiKey.includes('your_')) {
      throw new Error('DeepSeek API密钥未配置，请在系统设置中配置');
    }

    this.logger.log('使用环境变量中的DeepSeek API配置');
    this.cachedConfig = { apiKey, apiUrl, modelName, lastUpdate: Date.now() };
    return this.cachedConfig;
  }

  /**
   * 分析聊天记录（20+维度）
   * @param chatText OCR识别后的聊天文本
   * @param customerInfo 客户基本信息（可选）
   * @returns AI分析结果
   */
  async analyzeChat(
    chatText: string,
    customerInfo?: any,
  ): Promise<AiAnalysisResult> {
    try {
      this.logger.log(`开始AI分析，文本长度: ${chatText.length}`);

      // 获取API密钥配置
      const apiConfig = await this.getApiConfig();

      const scenarioKey = 'chat_deep_analysis';
      const systemPrompt = await this.getSystemPrompt(scenarioKey);
      const userPrompt = await this.buildAnalysisPrompt(scenarioKey, chatText, customerInfo);

      // 获取配置的模型参数
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');
      const temperature = promptConfig?.temperature ?? this.configService.get<number>('AI_TEMPERATURE', 0.3);
      const maxTokens = promptConfig?.maxTokens ?? this.configService.get<number>('AI_MAX_TOKENS', 4000);

      // 创建HTTP客户端（使用最新的API密钥）
      const httpClient = axios.create({
        timeout: this.configService.get<number>('AI_TIMEOUT', 30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
      });

      const response = await httpClient.post(apiConfig.apiUrl, {
        model: promptConfig?.modelName || apiConfig.modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const aiResponse = response.data.choices[0].message.content;
      this.logger.log('AI分析完成，开始解析结果');

      // 解析JSON结果
      const analysisResult = this.parseAnalysisResult(aiResponse);

      this.logger.log(`AI分析成功: 质量等级=${analysisResult.qualityLevel}, 风险=${analysisResult.riskLevel}`);

      return analysisResult;

    } catch (error) {
      this.logger.error(`AI分析失败: ${error.message}`, error.stack);
      throw new Error(`AI分析失败: ${error.message}`);
    }
  }

  /**
   * 系统提示词（从数据库获取或使用默认）
   */
  private async getSystemPrompt(scenarioKey: string): Promise<string> {
    try {
      const config = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');
      if (config && config.systemPrompt) {
        return config.systemPrompt;
      }
    } catch (error) {
      this.logger.warn(`获取系统提示词失败，使用默认配置: ${error.message}`);
    }

    // 默认系统提示词
    return `你是一个专业的教育培训行业销售分析专家，擅长分析微信聊天记录并提供深度洞察。

你的任务是：
1. 深入分析销售与客户的微信聊天记录
2. 从20+个维度全面评估客户情况
3. 识别客户需求、痛点、异议和风险
4. 评估商机价值和成交可能性
5. 提供具体可执行的销售策略和话术建议

分析要求：
- 客观准确，基于事实证据
- 洞察深入，发现隐藏信息
- 建议具体，可直接执行
- 输出格式为严格的JSON，方便系统解析`;
  }

  /**
   * 构建分析提示词（从数据库获取或使用默认）
   */
  private async buildAnalysisPrompt(scenarioKey: string, chatText: string, customerInfo?: any): Promise<string> {
    try {
      const config = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');
      if (config && config.promptContent) {
        // 使用数据库配置的提示词模板，替换变量
        let prompt = config.promptContent;
        prompt = prompt.replace(/\{\{chatText\}\}/g, chatText);
        prompt = prompt.replace(/\{\{customerName\}\}/g, customerInfo?.wechatNickname || '未知');
        prompt = prompt.replace(/\{\{customerPhone\}\}/g, customerInfo?.phone || '未知');
        prompt = prompt.replace(/\{\{customerIntent\}\}/g, customerInfo?.customerIntent || '未知');
        return prompt;
      }
    } catch (error) {
      this.logger.warn(`获取用户提示词失败，使用默认配置: ${error.message}`);
    }

    // 默认提示词
    let prompt = `请深度分析以下微信聊天记录，并按照JSON格式输出分析结果。\n\n`;

    if (customerInfo) {
      prompt += `【客户基本信息】\n`;
      prompt += `微信昵称: ${customerInfo.wechatNickname || '未知'}\n`;
      prompt += `手机号: ${customerInfo.phone || '未知'}\n`;
      prompt += `当前意向等级: ${customerInfo.customerIntent || '未知'}\n\n`;
    }

    prompt += `【聊天记录】\n${chatText}\n\n`;

    prompt += `【分析要求】\n`;
    prompt += `请严格按照以下JSON格式输出分析结果（不要添加任何markdown格式符号）：\n\n`;
    prompt += this.getJsonTemplate();

    return prompt;
  }

  /**
   * JSON输出模板
   */
  private getJsonTemplate(): string {
    return `{
  "qualityLevel": "A/B/C/D（A=高价值，B=中等价值，C=一般，D=低价值）",
  "riskLevel": "无风险/低/中/高",
  "intentionScore": 85,
  "communicationSummary": "简要概括本次沟通的核心内容（100字以内）",

  "customerProfile": {
    "parentRole": "家长身份",
    "studentGrade": "学生年级",
    "studentAge": 10,
    "familyEconomicLevel": "高/中/低",
    "educationAttitude": "很重视/一般/不太重视",
    "decisionMakerRole": "单独决策/共同决策/需配偶同意",
    "communicationStyle": "直接/委婉/理性/感性",
    "timeAvailability": "充足/一般/紧张",
    "location": "所在城市",
    "wechatActivity": "高/中/低"
  },

  "customerNeeds": ["需求1", "需求2"],
  "customerPainPoints": ["痛点1", "痛点2"],
  "customerInterests": ["兴趣点1", "兴趣点2"],
  "customerObjections": ["顾虑1", "顾虑2"],
  "competitorMentioned": ["竞品1"],

  "customerMindset": "积极/观望/抗拒/犹豫",
  "emotionalTone": "友好/中立/不耐烦/负面",
  "trustLevel": "高/中/低",

  "estimatedValue": 5000,
  "estimatedCycle": "短期（1周内）/中期（1-4周）/长期（1个月+）",
  "dealOpportunity": "高/中/低",
  "urgency": "高/中/低",
  "competitiveness": "高/中/低",

  "nextSteps": ["建议行动1", "建议行动2"],
  "salesStrategy": "整体销售策略说明",
  "recommendedScripts": {
    "opening": "开场白话术",
    "valueProposition": "价值主张话术",
    "objectionHandling": "应对异议话术",
    "closing": "促成话术"
  },

  "riskFactors": ["风险因素1"],
  "riskReason": "风险原因详细说明"
}`;
  }

  /**
   * 解析AI返回的JSON结果
   */
  private parseAnalysisResult(aiResponse: string): AiAnalysisResult {
    try {
      // 清理可能的markdown格式标记
      let jsonString = aiResponse.trim();
      jsonString = jsonString.replace(/^```json\s*/i, '');
      jsonString = jsonString.replace(/^```\s*/, '');
      jsonString = jsonString.replace(/\s*```$/,'');
      jsonString = jsonString.trim();

      const result = JSON.parse(jsonString);

      // 验证必要字段
      if (!result.qualityLevel || !result.riskLevel) {
        throw new Error('AI返回结果缺少必要字段');
      }

      return result as AiAnalysisResult;

    } catch (error) {
      this.logger.error(`解析AI结果失败: ${error.message}`);
      this.logger.debug(`原始AI响应: ${aiResponse}`);
      throw new Error(`解析AI分析结果失败: ${error.message}`);
    }
  }

  /**
   * 生成客户复苏话术
   */
  async generateRecoveryScript(customerData: any): Promise<string> {
    try {
      // 获取API密钥配置
      const apiConfig = await this.getApiConfig();

      const scenarioKey = 'customer_recovery_script';
      const systemPrompt = await this.getSystemPrompt(scenarioKey);

      // 尝试从数据库获取提示词配置
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');
      let userPrompt = '';

      if (promptConfig && promptConfig.promptContent) {
        // 使用数据库配置，替换变量
        userPrompt = promptConfig.promptContent
          .replace(/\{\{customerName\}\}/g, customerData.realName || customerData.wechatNickname)
          .replace(/\{\{lastContactTime\}\}/g, customerData.lastContactTime)
          .replace(/\{\{needs\}\}/g, customerData.needs || '未知')
          .replace(/\{\{objections\}\}/g, customerData.objections || '无');
      } else {
        // 使用默认提示词
        userPrompt = `请为以下沉睡客户生成一条复苏话术：

客户信息：
- 姓名：${customerData.realName || customerData.wechatNickname}
- 上次沟通时间：${customerData.lastContactTime}
- 客户需求：${customerData.needs || '未知'}
- 之前顾虑：${customerData.objections || '无'}

要求：
1. 话术自然、不生硬
2. 提供新的价值点或福利
3. 给客户一个回复的理由
4. 100字以内

请直接输出话术内容，不要其他说明。`;
      }

      // 创建HTTP客户端（使用最新的API密钥）
      const httpClient = axios.create({
        timeout: this.configService.get<number>('AI_TIMEOUT', 30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
      });

      const response = await httpClient.post(apiConfig.apiUrl, {
        model: promptConfig?.modelName || apiConfig.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: promptConfig?.temperature ?? 0.7,
        max_tokens: promptConfig?.maxTokens ?? 500,
      });

      return response.data.choices[0].message.content.trim();

    } catch (error) {
      this.logger.error(`生成复苏话术失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 测试DeepSeek连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 获取API密钥配置
      const apiConfig = await this.getApiConfig();

      // 创建HTTP客户端
      const httpClient = axios.create({
        timeout: this.configService.get<number>('AI_TIMEOUT', 30000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
      });

      const response = await httpClient.post(apiConfig.apiUrl, {
        model: apiConfig.modelName,
        messages: [
          { role: 'system', content: '你是一个助手' },
          { role: 'user', content: 'Hello' },
        ],
        max_tokens: 10,
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`DeepSeek连接测试失败: ${error.message}`);
      return false;
    }
  }
}
