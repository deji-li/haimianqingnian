import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './entities/index';
import { DeepseekAnalysisService, AiAnalysisResult } from '../../common/services/ai/deepseek-analysis.service';
import { Customer } from '../customer/entities/customer.entity';
import { AiConfigService } from '../ai-config/ai-config.service';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { AiKnowledgeBase } from '../ai-knowledge/entities/ai-knowledge-base.entity';
import { AiMarketingContent } from '../ai-marketing/entities/ai-marketing-content.entity';
import { User } from '../user/entities/user.entity';
import { KnowledgeIntegrationService } from '../enterprise-knowledge/knowledge-integration.service';

@Injectable()
export class AiToolsService {
  private readonly logger = new Logger(AiToolsService.name);

  constructor(
    @InjectRepository(AiScript)
    private readonly scriptRepository: Repository<AiScript>,
    @InjectRepository(AiRiskAlert)
    private readonly riskAlertRepository: Repository<AiRiskAlert>,
    @InjectRepository(AiTrainingRecord)
    private readonly trainingRepository: Repository<AiTrainingRecord>,
    @InjectRepository(AiReport)
    private readonly reportRepository: Repository<AiReport>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(AiChatRecord)
    private readonly chatRecordRepository: Repository<AiChatRecord>,
    @InjectRepository(AiKnowledgeBase)
    private readonly knowledgeRepository: Repository<AiKnowledgeBase>,
    @InjectRepository(AiMarketingContent)
    private readonly marketingContentRepository: Repository<AiMarketingContent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly deepseekService: DeepseekAnalysisService,
    private readonly aiConfigService: AiConfigService,
    private readonly knowledgeIntegrationService: KnowledgeIntegrationService,
  ) {}

  /**
   * 基于客户画像生成推荐话术
   */
  async generateScript(customerId: number, scriptType: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error('客户不存在');
      }

      // 使用DeepseekAnalysisService的通用方法生成话术
      const scriptContent = await this.deepseekService.generateSalesScript(customer, scriptType);

      // 保存话术
      const script = this.scriptRepository.create({
        scriptType,
        scenario: `客户ID_${customerId}`,
        customerProfile: `${customer.customerIntent || '未知'}意向`,
        scriptTitle: `${scriptType} - ${customer.wechatNickname || customer.realName || '客户'}`,
        scriptContent,
        source: 'AI生成',
        isActive: 1,
      });

      return this.scriptRepository.save(script);
    } catch (error) {
      this.logger.error(`生成话术失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 基于AI分析结果创建风险预警
   */
  async createRiskAlert(customerId: number, analysisResult: AiAnalysisResult, chatRecordId: number) {
    try {
      // 只有中高风险才创建预警
      if (analysisResult.riskLevel === '无风险' || analysisResult.riskLevel === '低') {
        return null;
      }

      // 查找客户的销售
      const customer = await this.customerRepository.findOne({
        where: { id: customerId },
      });

      const alert = this.riskAlertRepository.create({
        customerId,
        riskType: '流失风险',
        riskLevel: analysisResult.riskLevel,
        riskScore: analysisResult.intentionScore ? 100 - analysisResult.intentionScore : 50,
        riskReason: analysisResult.riskReason || '客户意向下降',
        recommendedActions: analysisResult.nextSteps || [],
        fromChatRecordId: chatRecordId,
        status: '待处理',
        assignedTo: customer?.salesId,
      });

      const saved = await this.riskAlertRepository.save(alert);
      this.logger.log(`创建风险预警: 客户${customerId}, 风险等级${analysisResult.riskLevel}`);

      return saved;
    } catch (error) {
      this.logger.error(`创建风险预警失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取待处理风险预警
   */
  async getPendingRiskAlerts(userId: number, userRole: string) {
    const queryBuilder = this.riskAlertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.customer', 'customer')
      .where('alert.status = :status', { status: '待处理' });

    // 销售只看自己的
    if (userRole === 'sales') {
      queryBuilder.andWhere('alert.assignedTo = :userId', { userId });
    }

    return queryBuilder
      .orderBy('alert.riskLevel', 'DESC')
      .addOrderBy('alert.createTime', 'DESC')
      .take(10)
      .getMany();
  }

  /**
   * 处理风险预警
   */
  async handleRiskAlert(alertId: number, handlerId: number, handleResult: string) {
    return this.riskAlertRepository.update(alertId, {
      status: '已解决',
      handlerId,
      handleResult,
      handleTime: new Date(),
    });
  }

  /**
   * 获取推荐话术列表
   */
  async getRecommendedScripts(scriptType: string, limit = 10) {
    return this.scriptRepository.find({
      where: {
        scriptType,
        isActive: 1,
      },
      order: {
        effectivenessScore: 'DESC',
        usageCount: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * 记录话术使用
   */
  async recordScriptUsage(scriptId: number, success: boolean) {
    const script = await this.scriptRepository.findOne({
      where: { id: scriptId },
    });

    if (script) {
      await this.scriptRepository.update(scriptId, {
        usageCount: script.usageCount + 1,
        successCount: success ? script.successCount + 1 : script.successCount,
      });
    }
  }

  /**
   * 批量识别沉睡客户并生成复苏话术
   */
  async identifySleepingCustomers(days = 30) {
    try {
      const sleepingDate = new Date();
      sleepingDate.setDate(sleepingDate.getDate() - days);

      // 查找超过N天未跟进的客户
      const customers = await this.customerRepository
        .createQueryBuilder('c')
        .where('c.updateTime < :date', { date: sleepingDate })
        .andWhere('c.lifecycleStage != :stage', { stage: '已成交' })
        .orderBy('c.customerIntent', 'DESC')
        .take(50)
        .getMany();

      const results = [];

      for (const customer of customers) {
        // 为每个客户生成复苏话术
        const recoveryScript = await this.deepseekService.generateRecoveryScript({
          realName: customer.realName,
          wechatNickname: customer.wechatNickname,
          lastContactTime: customer.updateTime,
          needs: '未知',
          objections: '无',
        });

        results.push({
          customer,
          recoveryScript,
          sleepDays: Math.floor((Date.now() - customer.updateTime.getTime()) / (1000 * 60 * 60 * 24)),
        });
      }

      this.logger.log(`识别到${results.length}个沉睡客户`);

      return {
        total: results.length,
        customers: results,
      };
    } catch (error) {
      this.logger.error(`识别沉睡客户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * AI陪练（简化版）
   */
  async startTrainingSession(userId: number, scenario: string) {
    const training = this.trainingRepository.create({
      userId,
      trainingType: '对话陪练',
      scenario,
      customerRole: 'AI模拟客户',
      conversation: [],
      duration: 0,
      roundCount: 0,
    });

    return this.trainingRepository.save(training);
  }

  /**
   * 陪练对话
   */
  async trainConversation(trainingId: number, userMessage: string) {
    try {
      const training = await this.trainingRepository.findOne({
        where: { id: trainingId },
      });

      if (!training) {
        throw new Error('训练记录不存在');
      }

      // 使用AI生成客户回复
      const conversation = training.conversation || [];
      conversation.push({ role: 'user', message: userMessage });

      // 从数据库获取提示词配置
      const scenarioKey = 'ai_training_conversation';
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');

      let systemPrompt = '你是一个教育培训的潜在客户，用于帮助销售人员进行销售话术练习。';
      let userPrompt = `你正在扮演一个教育培训的潜在客户，场景是"${training.scenario}"。
之前的对话：
${conversation.map((c, i) => `${i % 2 === 0 ? '销售' : '客户'}：${c.message}`).join('\n')}

现在请作为客户回复销售，要求：
1. 符合真实客户的反应
2. 可以提出异议或顾虑
3. 50字以内
4. 直接输出客户的话，不要"客户："前缀`;

      if (promptConfig) {
        systemPrompt = promptConfig.systemPrompt || systemPrompt;
        if (promptConfig.promptContent) {
          const conversationHistory = conversation.map((c, i) =>
            `${i % 2 === 0 ? '销售' : '客户'}：${c.message}`
          ).join('\n');

          userPrompt = promptConfig.promptContent
            .replace(/\{\{scenario\}\}/g, training.scenario)
            .replace(/\{\{conversationHistory\}\}/g, conversationHistory);
        }
      }

      const aiReply = await this.deepseekService.callAI(
        systemPrompt,
        userPrompt,
        {
          temperature: promptConfig?.temperature ?? 0.8,
          maxTokens: promptConfig?.maxTokens ?? 200
        },
      );
      conversation.push({ role: 'assistant', message: aiReply });

      // 更新训练记录
      await this.trainingRepository.update(trainingId, {
        conversation,
        roundCount: Math.floor(conversation.length / 2),
      });

      return {
        userMessage,
        aiReply,
        roundCount: Math.floor(conversation.length / 2),
      };
    } catch (error) {
      this.logger.error(`陪练对话失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 结束训练并评分
   */
  async endTraining(trainingId: number) {
    const training = await this.trainingRepository.findOne({
      where: { id: trainingId },
    });

    if (!training) {
      throw new Error('训练记录不存在');
    }

    // 简单评分逻辑
    const roundCount = training.roundCount || 0;
    let score = roundCount >= 5 ? 7.5 : 6.0;
    let result = roundCount >= 5 ? '良好' : '及格';

    await this.trainingRepository.update(trainingId, {
      aiScore: score,
      communicationScore: score,
      responseSpeedScore: score + 0.5,
      objectionHandlingScore: score - 0.5,
      trainingResult: result as any,
      aiFeedback: `完成${roundCount}轮对话，表现${result}。建议多练习异议处理技巧。`,
    });

    return this.trainingRepository.findOne({ where: { id: trainingId } });
  }

  /**
   * AI营销文案生成
   */
  async generateMarketingContent(params: {
    contentType: string; // 朋友圈文案、微信群发文案、抖音营销文案、小红书营销文案、短视频拍摄脚本、公众号推文
    customerIds?: number[]; // 选择的客户ID列表
    customerPainPoints?: string[]; // 客户痛点
    customerNeeds?: string[]; // 客户需求
    customerInterests?: string[]; // 客户兴趣点
    purpose?: string; // 发圈目的
    style?: string; // 风格要求
    wordCount?: string; // 字数要求
  }) {
    try {
      const {
        contentType,
        customerIds = [],
        customerPainPoints = [],
        customerNeeds = [],
        customerInterests = [],
        purpose,
        style,
        wordCount,
      } = params;

      // 如果提供了客户ID，从数据库获取客户痛点/需求/兴趣
      let painPoints = [...customerPainPoints];
      let needs = [...customerNeeds];
      let interests = [...customerInterests];

      if (customerIds.length > 0) {
        // 这里可以关联查询客户的AI标签数据
        // 暂时简化处理
      }

      // 从数据库获取提示词配置
      const scenarioKey = 'marketing_content_generate';
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');

      let systemPrompt = '你是一个专业的教育培训行业营销文案专家，擅长创作各类营销内容，包括朋友圈文案、短视频脚本、公众号推文等。';
      let userPrompt = '';

      if (promptConfig && promptConfig.promptContent) {
        // 使用数据库配置
        systemPrompt = promptConfig.systemPrompt || systemPrompt;

        // 构建内容
        const contentTypeMap = {
          '朋友圈文案': {
            instruction: '生成一条适合发朋友圈的营销文案',
            tips: '要求：简洁有力，引发共鸣，包含适当emoji，不要太硬广',
          },
          '微信群发文案': {
            instruction: '生成一条微信群发营销文案',
            tips: '要求：个性化称呼，直击痛点，明确行动号召',
          },
          '抖音营销文案': {
            instruction: '生成一条抖音短视频营销文案',
            tips: '要求：前3秒吸睛，节奏紧凑，包含热门话题，引导互动',
          },
          '小红书营销文案': {
            instruction: '生成一条小红书营销文案',
            tips: '要求：真实感受，干货分享，适当种草，包含emoji和标签',
          },
          '短视频拍摄脚本': {
            instruction: '生成一个短视频拍摄脚本',
            tips: '要求：包含场景、台词、镜头、时长，总时长30-60秒',
          },
          '公众号推文': {
            instruction: '生成一篇公众号推文',
            tips: '要求：标题吸睛，内容有价值，排版清晰，引导关注转发',
          },
        };

        const typeConfig = contentTypeMap[contentType] || contentTypeMap['朋友圈文案'];

        let painPointsText = '';
        if (painPoints.length > 0) {
          painPointsText = `客户痛点：\n${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n`;
        }

        let needsText = '';
        if (needs.length > 0) {
          needsText = `客户需求：\n${needs.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`;
        }

        let interestsText = '';
        if (interests.length > 0) {
          interestsText = `客户兴趣点：\n${interests.map((int, i) => `${i + 1}. ${int}`).join('\n')}\n`;
        }

        let purposeText = purpose ? `发布目的：${purpose}\n` : '';
        let styleText = style ? `风格要求：${style}\n` : '';
        let wordCountText = wordCount ? `字数要求：${wordCount}\n` : '';

        userPrompt = promptConfig.promptContent
          .replace(/\{\{instruction\}\}/g, typeConfig.instruction)
          .replace(/\{\{painPoints\}\}/g, painPointsText)
          .replace(/\{\{needs\}\}/g, needsText)
          .replace(/\{\{interests\}\}/g, interestsText)
          .replace(/\{\{purpose\}\}/g, purposeText)
          .replace(/\{\{style\}\}/g, styleText)
          .replace(/\{\{wordCount\}\}/g, wordCountText)
          .replace(/\{\{tips\}\}/g, typeConfig.tips);
      } else {
        // 使用默认配置
        const contentTypeMap = {
          '朋友圈文案': {
            instruction: '生成一条适合发朋友圈的营销文案',
            tips: '要求：简洁有力，引发共鸣，包含适当emoji，不要太硬广',
          },
          '微信群发文案': {
            instruction: '生成一条微信群发营销文案',
            tips: '要求：个性化称呼，直击痛点，明确行动号召',
          },
          '抖音营销文案': {
            instruction: '生成一条抖音短视频营销文案',
            tips: '要求：前3秒吸睛，节奏紧凑，包含热门话题，引导互动',
          },
          '小红书营销文案': {
            instruction: '生成一条小红书营销文案',
            tips: '要求：真实感受，干货分享，适当种草，包含emoji和标签',
          },
          '短视频拍摄脚本': {
            instruction: '生成一个短视频拍摄脚本',
            tips: '要求：包含场景、台词、镜头、时长，总时长30-60秒',
          },
          '公众号推文': {
            instruction: '生成一篇公众号推文',
            tips: '要求：标题吸睛，内容有价值，排版清晰，引导关注转发',
          },
        };

        const typeConfig = contentTypeMap[contentType] || contentTypeMap['朋友圈文案'];

        userPrompt = `${typeConfig.instruction}\n\n`;

        if (painPoints.length > 0) {
          userPrompt += `客户痛点：\n${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;
        }

        if (needs.length > 0) {
          userPrompt += `客户需求：\n${needs.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\n`;
        }

        if (interests.length > 0) {
          userPrompt += `客户兴趣点：\n${interests.map((int, i) => `${i + 1}. ${int}`).join('\n')}\n\n`;
        }

        if (purpose) {
          userPrompt += `发布目的：${purpose}\n`;
        }

        if (style) {
          userPrompt += `风格要求：${style}\n`;
        }

        if (wordCount) {
          userPrompt += `字数要求：${wordCount}\n`;
        }

        userPrompt += `\n${typeConfig.tips}\n\n直接输出文案内容，不要其他说明。`;
      }

      // 调用DeepSeek API生成
      const content = await this.deepseekService.callAI(
        systemPrompt,
        userPrompt,
        {
          temperature: promptConfig?.temperature ?? 0.8,
          maxTokens: promptConfig?.maxTokens ?? 2000
        },
      );

      this.logger.log(`生成${contentType}成功`);

      return {
        contentType,
        content,
        prompt,
      };
    } catch (error) {
      this.logger.error(`生成营销文案失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取营销文案历史记录
   * 注意：这里简化实现，实际应该有专门的表存储
   */
  async getMarketingContentHistory(userId: number, contentType?: string) {
    // TODO: 实现营销文案历史记录查询
    // 需要创建一个新表 ai_marketing_contents 来存储历史记录
    return {
      total: 0,
      list: [],
    };
  }

  /**
   * AI人效分析看板（给老板看的）
   */
  async getAiEfficiencyAnalytics(params: {
    startDate?: string;
    endDate?: string;
    userId?: number;
    departmentId?: number;
  }) {
    try {
      const { startDate, endDate, userId, departmentId } = params;

      // 1. 销售人员AI使用情况排行
      const userUsageStats = await this.getUserAiUsageStats(startDate, endDate, userId, departmentId);

      // 2. 客户质量分布
      const qualityDistribution = await this.getCustomerQualityDistribution(userId, departmentId);

      // 3. AI功能使用统计
      const featureUsageStats = await this.getAiFeatureUsageStats(startDate, endDate, userId, departmentId);

      // 4. 转化漏斗数据
      const conversionFunnel = await this.getConversionFunnel(startDate, endDate, userId, departmentId);

      // 5. 风险预警统计
      const riskStats = await this.getRiskStats(userId, departmentId);

      return {
        userUsageStats,
        qualityDistribution,
        featureUsageStats,
        conversionFunnel,
        riskStats,
      };
    } catch (error) {
      this.logger.error(`获取AI人效分析失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户AI使用统计
   */
  private async getUserAiUsageStats(startDate?: string, endDate?: string, userId?: number, departmentId?: number) {
    try {
      // 构建日期条件
      const dateCondition = this.buildDateCondition(startDate, endDate);

      // 获取所有活跃用户
      const usersQuery = this.userRepository.createQueryBuilder('u');
      if (userId) {
        usersQuery.where('u.id = :userId', { userId });
      }
      if (departmentId) {
        usersQuery.andWhere('u.department_id = :departmentId', { departmentId });
      }
      const users = await usersQuery.getMany();

      const userStats = [];

      for (const user of users) {
        // 1. AI聊天分析次数
        const chatRecordQuery = this.chatRecordRepository
          .createQueryBuilder('cr')
          .where('cr.user_id = :uid', { uid: user.id });
        if (dateCondition) {
          chatRecordQuery.andWhere(dateCondition);
        }
        const aiAnalysisCount = await chatRecordQuery.getCount();

        // 2. 高质量线索数（A级客户）
        const highQualityQuery = this.chatRecordRepository
          .createQueryBuilder('cr')
          .where('cr.user_id = :uid', { uid: user.id })
          .andWhere('cr.quality_level = :level', { level: 'A' });
        if (dateCondition) {
          highQualityQuery.andWhere(dateCondition);
        }
        const highQualityLeadsCount = await highQualityQuery.getCount();

        // 3. 话术使用次数
        const scriptUsageCount = await this.scriptRepository
          .createQueryBuilder('s')
          .select('SUM(s.usage_count)', 'total')
          .getRawOne()
          .then(r => parseInt(r?.total || '0'));

        // 4. 知识库搜索次数（简化统计：统计知识库条目数作为搜索次数的代理）
        const knowledgeSearchCount = await this.knowledgeRepository.count();

        // 5. 培训陪练次数
        const trainingQuery = this.trainingRepository
          .createQueryBuilder('t')
          .where('t.user_id = :uid', { uid: user.id });
        if (dateCondition) {
          trainingQuery.andWhere(dateCondition);
        }
        const trainingCount = await trainingQuery.getCount();

        // 6. AI标签数（从chatRecord的painPoints和interestPoints统计）
        const tagsResult = await this.chatRecordRepository
          .createQueryBuilder('cr')
          .select('cr.pain_points', 'painPoints')
          .addSelect('cr.interest_points', 'interestPoints')
          .where('cr.user_id = :uid', { uid: user.id })
          .getRawMany();

        const allTags = new Set();
        tagsResult.forEach(r => {
          if (r.painPoints) {
            try {
              const points = typeof r.painPoints === 'string' ? JSON.parse(r.painPoints) : r.painPoints;
              points.forEach((p: string) => allTags.add(p));
            } catch (e) { }
          }
          if (r.interestPoints) {
            try {
              const points = typeof r.interestPoints === 'string' ? JSON.parse(r.interestPoints) : r.interestPoints;
              points.forEach((p: string) => allTags.add(p));
            } catch (e) { }
          }
        });
        const aiTagsCount = allTags.size;

        // 总使用次数
        const totalUsageCount = aiAnalysisCount + scriptUsageCount + trainingCount;

        // 转化率（高质量线索 / 总分析次数）
        const conversionRate = aiAnalysisCount > 0 ? highQualityLeadsCount / aiAnalysisCount : 0;

        userStats.push({
          userId: user.id,
          userName: user.realName || user.username,
          aiAnalysisCount,
          aiTagsCount,
          scriptUsageCount,
          knowledgeSearchCount,
          trainingCount,
          totalUsageCount,
          highQualityLeadsCount,
          conversionRate,
        });
      }

      // 按总使用次数排序
      return userStats.sort((a, b) => b.totalUsageCount - a.totalUsageCount);
    } catch (error) {
      this.logger.error(`获取用户AI使用统计失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 构建日期条件
   */
  private buildDateCondition(startDate?: string, endDate?: string): string | null {
    if (startDate && endDate) {
      return `create_time BETWEEN '${startDate}' AND '${endDate}'`;
    }
    return null;
  }

  /**
   * 获取客户质量分布
   */
  private async getCustomerQualityDistribution(userId?: number, departmentId?: number) {
    try {
      const qb = this.chatRecordRepository
        .createQueryBuilder('cr')
        .select('cr.quality_level', 'level')
        .addSelect('COUNT(*)', 'count')
        .where('cr.quality_level IS NOT NULL')
        .groupBy('cr.quality_level');

      if (userId) {
        qb.andWhere('cr.user_id = :userId', { userId });
      }

      const results = await qb.getRawMany();

      const distribution = { A: 0, B: 0, C: 0, D: 0 };
      results.forEach(r => {
        if (r.level in distribution) {
          distribution[r.level] = parseInt(r.count);
        }
      });

      return distribution;
    } catch (error) {
      this.logger.error(`获取客户质量分布失败: ${error.message}`);
      return { A: 0, B: 0, C: 0, D: 0 };
    }
  }

  /**
   * 获取AI功能使用统计
   */
  private async getAiFeatureUsageStats(startDate?: string, endDate?: string, userId?: number, departmentId?: number) {
    try {
      const dateCondition = this.buildDateCondition(startDate, endDate);

      // 1. 聊天分析次数
      const chatAnalysisQuery = this.chatRecordRepository.createQueryBuilder('cr');
      if (userId) chatAnalysisQuery.andWhere('cr.user_id = :userId', { userId });
      if (dateCondition) chatAnalysisQuery.andWhere(dateCondition);
      const chatAnalysis = await chatAnalysisQuery.getCount();

      // 2. 话术生成次数
      const scriptQuery = this.scriptRepository.createQueryBuilder('s');
      if (dateCondition) scriptQuery.andWhere(dateCondition);
      const scriptGeneration = await scriptQuery.getCount();

      // 3. 知识库搜索（以条目数量为代理）
      const knowledgeSearch = await this.knowledgeRepository.count();

      // 4. AI培训次数
      const trainingQuery = this.trainingRepository.createQueryBuilder('t');
      if (userId) trainingQuery.andWhere('t.user_id = :userId', { userId });
      if (dateCondition) trainingQuery.andWhere(dateCondition);
      const training = await trainingQuery.getCount();

      // 5. 风险预警次数
      const riskQuery = this.riskAlertRepository.createQueryBuilder('r');
      if (userId) riskQuery.andWhere('r.assigned_to = :userId', { userId });
      if (dateCondition) riskQuery.andWhere(dateCondition);
      const riskAlert = await riskQuery.getCount();

      // 6. 营销文案生成（从ai_marketing_content表统计）
      const marketingQuery = this.marketingContentRepository.createQueryBuilder('m');
      if (userId) marketingQuery.andWhere('m.user_id = :userId', { userId });
      if (dateCondition) marketingQuery.andWhere(dateCondition);
      const marketing = await marketingQuery.getCount();

      return {
        chatAnalysis,
        scriptGeneration,
        knowledgeSearch,
        training,
        riskAlert,
        marketing,
      };
    } catch (error) {
      this.logger.error(`获取AI功能使用统计失败: ${error.message}`);
      return {
        chatAnalysis: 0,
        scriptGeneration: 0,
        knowledgeSearch: 0,
        training: 0,
        riskAlert: 0,
        marketing: 0,
      };
    }
  }

  /**
   * 获取转化漏斗数据
   */
  private async getConversionFunnel(startDate?: string, endDate?: string, userId?: number, departmentId?: number) {
    try {
      // 从客户生命周期阶段统计
      const customerQuery = this.customerRepository.createQueryBuilder('c');

      if (userId) {
        customerQuery.andWhere('c.sales_id = :userId', { userId });
      }
      if (departmentId) {
        customerQuery.andWhere('c.department_id = :departmentId', { departmentId });
      }
      if (startDate && endDate) {
        customerQuery.andWhere('c.create_time BETWEEN :startDate AND :endDate', { startDate, endDate });
      }

      // 统计各阶段客户数
      const [
        leads,      // 线索（未分级+待跟进）
        customers,  // 客户（意向客户）
        intents,    // 有意向（高意向+试听中）
        deals,      // 已成交
      ] = await Promise.all([
        customerQuery.clone().andWhere('c.lifecycle_stage IN (:...stages)', {
          stages: ['未分级', '待跟进']
        }).getCount(),
        customerQuery.clone().andWhere('c.lifecycle_stage = :stage', {
          stage: '意向客户'
        }).getCount(),
        customerQuery.clone().andWhere('c.lifecycle_stage IN (:...stages)', {
          stages: ['高意向', '试听中']
        }).getCount(),
        customerQuery.clone().andWhere('c.lifecycle_stage = :stage', {
          stage: '已成交'
        }).getCount(),
      ]);

      return {
        leads: leads || 0,
        customers: customers || 0,
        intents: intents || 0,
        deals: deals || 0,
      };
    } catch (error) {
      this.logger.error(`获取转化漏斗数据失败: ${error.message}`);
      return {
        leads: 0,
        customers: 0,
        intents: 0,
        deals: 0,
      };
    }
  }

  /**
   * 获取风险统计
   */
  private async getRiskStats(userId?: number, departmentId?: number) {
    const qb = this.riskAlertRepository.createQueryBuilder('risk');

    if (userId) {
      qb.andWhere('risk.assigned_to = :userId', { userId });
    }

    const [pending, high, medium, low] = await Promise.all([
      qb.clone().andWhere('risk.status = :status', { status: '待处理' }).getCount(),
      qb.clone().andWhere('risk.risk_level = :level', { level: '高' }).getCount(),
      qb.clone().andWhere('risk.risk_level = :level', { level: '中' }).getCount(),
      qb.clone().andWhere('risk.risk_level = :level', { level: '低' }).getCount(),
    ]);

    return {
      pending,
      high,
      medium,
      low,
      total: high + medium + low,
    };
  }

  /**
   * 生成AI诊断报告（周报/月报/季报）
   */
  async generateReport(params: {
    reportType: string; // 周报/月报/季报
    reportPeriod: string; // 2025-W01/2025-01/2025-Q1
    targetType?: string; // 个人/团队/全公司
    targetId?: number;
  }) {
    try {
      const { reportType, reportPeriod, targetType, targetId } = params;

      // 创建报告记录
      const report = this.reportRepository.create({
        reportType,
        reportPeriod,
        targetType,
        targetId,
        status: '生成中',
      });
      const savedReport = await this.reportRepository.save(report);

      // 异步生成报告内容
      this.generateReportContent(savedReport.id).catch((error) => {
        this.logger.error(`生成报告失败: ${error.message}`);
        this.reportRepository.update(savedReport.id, { status: '失败' });
      });

      return savedReport;
    } catch (error) {
      this.logger.error(`创建报告失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成报告内容（异步）
   */
  private async generateReportContent(reportId: number) {
    try {
      const report = await this.reportRepository.findOne({ where: { id: reportId } });
      if (!report) throw new Error('报告不存在');

      // 1. 收集关键指标数据
      const keyMetrics = await this.collectKeyMetrics(report);

      // 2. 使用AI分析生成洞察
      const aiInsights = await this.generateAiInsights(keyMetrics);

      // 3. 诊断问题
      const problems = await this.diagnoseProblems(keyMetrics);

      // 4. 生成改进建议
      const recommendations = await this.generateRecommendations(keyMetrics, problems);

      // 5. 更新报告
      report.keyMetrics = keyMetrics;
      report.aiInsights = aiInsights;
      report.problems = problems;
      report.recommendations = recommendations;
      report.status = '已完成';
      report.generateTime = new Date();
      await this.reportRepository.save(report);

      this.logger.log(`报告生成完成: ${reportId}`);
    } catch (error) {
      this.logger.error(`生成报告内容失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 收集关键指标
   */
  private async collectKeyMetrics(report: AiReport) {
    try {
      const { reportPeriod, targetType, targetId } = report;

      // 解析报告周期
      const { startDate, endDate } = this.parseReportPeriod(reportPeriod);

      // 构建查询条件
      const customerQuery = this.customerRepository.createQueryBuilder('c');
      const chatRecordQuery = this.chatRecordRepository.createQueryBuilder('cr');

      if (targetType === '个人' && targetId) {
        customerQuery.andWhere('c.sales_id = :userId', { userId: targetId });
        chatRecordQuery.andWhere('cr.user_id = :userId', { userId: targetId });
      }

      // 1. 总客户数
      const totalCustomers = await customerQuery.clone().getCount();

      // 2. 新增客户数
      const newCustomers = await customerQuery.clone()
        .andWhere('c.create_time BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getCount();

      // 3. 高质量线索（A级）
      const highQualityLeads = await chatRecordQuery.clone()
        .andWhere('cr.quality_level = :level', { level: 'A' })
        .andWhere('cr.create_time BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getCount();

      // 4. 转化率（已成交 / 新增客户）
      const dealsCount = await customerQuery.clone()
        .andWhere('c.lifecycle_stage = :stage', { stage: '已成交' })
        .andWhere('c.create_time BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getCount();
      const conversionRate = newCustomers > 0 ? dealsCount / newCustomers : 0;

      // 5. 平均响应时间（模拟数据）
      const avgResponseTime = 2.5;

      // 6. AI使用次数
      const aiUsageCount = await chatRecordQuery.clone()
        .andWhere('cr.create_time BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getCount();

      // 7. 客户满意度（模拟数据）
      const customerSatisfaction = 4.5;

      // 8. 知识库使用统计
      const knowledgeUsageStats = await this.knowledgeIntegrationService
        .queryKnowledgeForAnalysis({
          topic: '客户分析报告',
          category: 'analysis',
        });

      const knowledgeUsageCount = knowledgeUsageStats?.length || 0;

      return {
        totalCustomers,
        newCustomers,
        highQualityLeads,
        conversionRate,
        avgResponseTime,
        aiUsageCount,
        customerSatisfaction,
        knowledgeUsageCount,
        knowledgeReference: knowledgeUsageStats?.map(k => ({
          id: k.id,
          title: k.title,
          category: k.sceneCategory,
        })).slice(0, 5),
      };
    } catch (error) {
      this.logger.error(`收集关键指标失败: ${error.message}`);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        highQualityLeads: 0,
        conversionRate: 0,
        avgResponseTime: 0,
        aiUsageCount: 0,
        customerSatisfaction: 0,
      };
    }
  }

  /**
   * 解析报告周期
   */
  private parseReportPeriod(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period.includes('W')) {
      // 周报：2025-W01
      const weekNum = parseInt(period.split('W')[1]);
      startDate = new Date(now.getFullYear(), 0, 1 + (weekNum - 1) * 7);
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (period.includes('Q')) {
      // 季报：2025-Q1
      const quarter = parseInt(period.split('Q')[1]);
      startDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3, 0);
    } else {
      // 月报：2025-01
      const [year, month] = period.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * 生成AI洞察
   */
  private async generateAiInsights(keyMetrics: any): Promise<string[]> {
    try {
      const prompt = `作为一个资深的CRM分析专家，请根据以下数据生成3-5个关键洞察发现：

关键指标：
- 总客户数：${keyMetrics.totalCustomers}
- 新增客户：${keyMetrics.newCustomers}
- 高质量线索：${keyMetrics.highQualityLeads}
- 转化率：${(keyMetrics.conversionRate * 100).toFixed(1)}%
- 平均响应时间：${keyMetrics.avgResponseTime}小时
- AI使用次数：${keyMetrics.aiUsageCount}

请以JSON数组格式输出洞察，例如：["洞察1", "洞察2", "洞察3"]`;

      const content = await this.deepseekService.callAI(
        '你是一个专业的CRM数据分析专家',
        prompt,
        { temperature: 0.7, maxTokens: 1000 },
      );

      // 尝试解析JSON
      try {
        return JSON.parse(content);
      } catch {
        // 如果解析失败，手动提取
        return [content];
      }
    } catch (error) {
      this.logger.error(`生成AI洞察失败: ${error.message}`);
      return ['暂无洞察'];
    }
  }

  /**
   * 诊断问题
   */
  private async diagnoseProblems(keyMetrics: any): Promise<string[]> {
    try {
      // 从数据库获取提示词配置
      const scenarioKey = 'crm_problem_diagnosis';
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');

      let systemPrompt = '你是一个专业的CRM数据分析专家，擅长从关键指标中识别业务问题和改进机会。';
      let userPrompt = `作为CRM分析专家，请诊断以下数据中存在的问题：

关键指标：
- 转化率：${(keyMetrics.conversionRate * 100).toFixed(1)}%
- 平均响应时间：${keyMetrics.avgResponseTime}小时
- 高质量线索比例：${((keyMetrics.highQualityLeads / keyMetrics.newCustomers) * 100).toFixed(1)}%

请以JSON数组格式输出问题，例如：["问题1", "问题2"]`;

      if (promptConfig) {
        systemPrompt = promptConfig.systemPrompt || systemPrompt;
        if (promptConfig.promptContent) {
          const metricsText = `- 转化率：${(keyMetrics.conversionRate * 100).toFixed(1)}%
- 平均响应时间：${keyMetrics.avgResponseTime}小时
- 高质量线索比例：${((keyMetrics.highQualityLeads / keyMetrics.newCustomers) * 100).toFixed(1)}%`;

          userPrompt = promptConfig.promptContent
            .replace(/\{\{keyMetrics\}\}/g, metricsText);
        }
      }

      const content = await this.deepseekService.callAI(
        systemPrompt,
        userPrompt,
        {
          temperature: promptConfig?.temperature ?? 0.7,
          maxTokens: promptConfig?.maxTokens ?? 1000
        },
      );

      try {
        return JSON.parse(content);
      } catch {
        return [content];
      }
    } catch (error) {
      this.logger.error(`诊断问题失败: ${error.message}`);
      return ['暂无问题诊断'];
    }
  }

  /**
   * 生成改进建议
   */
  private async generateRecommendations(keyMetrics: any, problems: string[]): Promise<string[]> {
    try {
      // 从数据库获取提示词配置
      const scenarioKey = 'crm_improvement_recommendation';
      const promptConfig = await this.aiConfigService.getPromptConfig(scenarioKey, 'deepseek');

      let systemPrompt = '你是一个专业的CRM顾问，擅长根据诊断出的问题提供具体可执行的改进方案。';
      let userPrompt = `基于以下问题，请给出具体的改进建议：

问题：
${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}

请以JSON数组格式输出建议，例如：["建议1", "建议2"]`;

      if (promptConfig) {
        systemPrompt = promptConfig.systemPrompt || systemPrompt;
        if (promptConfig.promptContent) {
          const problemsText = problems.map((p, i) => `${i + 1}. ${p}`).join('\n');
          userPrompt = promptConfig.promptContent
            .replace(/\{\{problems\}\}/g, problemsText);
        }
      }

      const content = await this.deepseekService.callAI(
        systemPrompt,
        userPrompt,
        {
          temperature: promptConfig?.temperature ?? 0.7,
          maxTokens: promptConfig?.maxTokens ?? 1000
        },
      );

      try {
        return JSON.parse(content);
      } catch {
        return [content];
      }
    } catch (error) {
      this.logger.error(`生成改进建议失败: ${error.message}`);
      return ['暂无改进建议'];
    }
  }

  /**
   * 获取报告列表
   */
  async getReportList(params: {
    page: number;
    limit: number;
    reportType?: string;
    status?: string;
  }) {
    const { page, limit, reportType, status } = params;
    const qb = this.reportRepository.createQueryBuilder('report');

    if (reportType) {
      qb.andWhere('report.report_type = :reportType', { reportType });
    }

    if (status) {
      qb.andWhere('report.status = :status', { status });
    }

    qb.orderBy('report.create_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [list, total] = await qb.getManyAndCount();

    return {
      list,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取报告详情
   */
  async getReportDetail(id: number) {
    return this.reportRepository.findOne({ where: { id } });
  }
}
