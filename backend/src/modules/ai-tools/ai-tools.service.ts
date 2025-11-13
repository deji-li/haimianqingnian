import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './entities/index';
import { DeepseekAnalysisService, AiAnalysisResult } from '../../common/services/ai/deepseek-analysis.service';
import { Customer } from '../customer/entities/customer.entity';

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
    private readonly deepseekService: DeepseekAnalysisService,
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

      const prompt = `你正在扮演一个教育培训的潜在客户，场景是"${training.scenario}"。
之前的对话：
${conversation.map((c, i) => `${i % 2 === 0 ? '销售' : '客户'}：${c.message}`).join('\n')}

现在请作为客户回复销售，要求：
1. 符合真实客户的反应
2. 可以提出异议或顾虑
3. 50字以内
4. 直接输出客户的话，不要"客户："前缀`;

      const aiReply = await this.deepseekService.callAI(
        '你是一个教育培训的潜在客户',
        prompt,
        { temperature: 0.8, maxTokens: 200 },
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

      // 构建AI生成prompt
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

      let prompt = `${typeConfig.instruction}\n\n`;

      if (painPoints.length > 0) {
        prompt += `客户痛点：\n${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;
      }

      if (needs.length > 0) {
        prompt += `客户需求：\n${needs.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\n`;
      }

      if (interests.length > 0) {
        prompt += `客户兴趣点：\n${interests.map((int, i) => `${i + 1}. ${int}`).join('\n')}\n\n`;
      }

      if (purpose) {
        prompt += `发布目的：${purpose}\n`;
      }

      if (style) {
        prompt += `风格要求：${style}\n`;
      }

      if (wordCount) {
        prompt += `字数要求：${wordCount}\n`;
      }

      prompt += `\n${typeConfig.tips}\n\n直接输出文案内容，不要其他说明。`;

      // 调用DeepSeek API生成
      const content = await this.deepseekService.callAI(
        '你是一个专业的教育培训行业营销文案专家',
        prompt,
        { temperature: 0.8, maxTokens: 2000 },
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
    // TODO: 实现真实的统计逻辑
    // 这里返回模拟数据
    return [
      {
        userId: 1,
        userName: '张三',
        aiAnalysisCount: 25,
        aiTagsCount: 120,
        scriptUsageCount: 45,
        knowledgeSearchCount: 30,
        totalUsageCount: 220,
        highQualityLeadsCount: 8,
        conversionRate: 0.32,
      },
      {
        userId: 2,
        userName: '李四',
        aiAnalysisCount: 18,
        aiTagsCount: 90,
        scriptUsageCount: 32,
        knowledgeSearchCount: 22,
        totalUsageCount: 162,
        highQualityLeadsCount: 5,
        conversionRate: 0.28,
      },
    ];
  }

  /**
   * 获取客户质量分布
   */
  private async getCustomerQualityDistribution(userId?: number, departmentId?: number) {
    // TODO: 从ai_chat_records表统计质量等级分布
    return {
      A: 12,
      B: 28,
      C: 35,
      D: 15,
    };
  }

  /**
   * 获取AI功能使用统计
   */
  private async getAiFeatureUsageStats(startDate?: string, endDate?: string, userId?: number, departmentId?: number) {
    // TODO: 统计各AI功能使用次数
    return {
      chatAnalysis: 45,
      scriptGeneration: 78,
      knowledgeSearch: 56,
      training: 23,
      riskAlert: 12,
      marketing: 34,
    };
  }

  /**
   * 获取转化漏斗数据
   */
  private async getConversionFunnel(startDate?: string, endDate?: string, userId?: number, departmentId?: number) {
    // TODO: 统计线索->客户->意向->成交的转化数据
    return {
      leads: 100,
      customers: 65,
      intents: 38,
      deals: 15,
    };
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
    // TODO: 实现真实的数据统计
    return {
      totalCustomers: 150,
      newCustomers: 25,
      highQualityLeads: 12,
      conversionRate: 0.32,
      avgResponseTime: 2.5,
      aiUsageCount: 245,
      customerSatisfaction: 4.5,
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
      const prompt = `作为CRM分析专家，请诊断以下数据中存在的问题：

关键指标：
- 转化率：${(keyMetrics.conversionRate * 100).toFixed(1)}%
- 平均响应时间：${keyMetrics.avgResponseTime}小时
- 高质量线索比例：${((keyMetrics.highQualityLeads / keyMetrics.newCustomers) * 100).toFixed(1)}%

请以JSON数组格式输出问题，例如：["问题1", "问题2"]`;

      const content = await this.deepseekService.callAI(
        '你是一个专业的CRM数据分析专家',
        prompt,
        { temperature: 0.7, maxTokens: 1000 },
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
      const prompt = `基于以下问题，请给出具体的改进建议：

问题：
${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}

请以JSON数组格式输出建议，例如：["建议1", "建议2"]`;

      const content = await this.deepseekService.callAI(
        '你是一个专业的CRM顾问',
        prompt,
        { temperature: 0.7, maxTokens: 1000 },
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
