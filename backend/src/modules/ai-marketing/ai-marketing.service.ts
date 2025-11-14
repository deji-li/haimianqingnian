import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiMarketingScenario } from './entities/ai-marketing-scenario.entity';
import { ExecuteScenarioDto, BatchExecuteScenarioDto } from './dto/marketing-scenario.dto';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigService } from '../ai-config/ai-config.service';

@Injectable()
export class AiMarketingService {
  private readonly logger = new Logger(AiMarketingService.name);

  constructor(
    @InjectRepository(AiMarketingScenario)
    private readonly scenarioRepository: Repository<AiMarketingScenario>,
    private readonly deepseekService: DeepseekAnalysisService,
    private readonly aiConfigService: AiConfigService,
  ) {}

  /**
   * 获取所有场景配置
   */
  async getAllScenarios(category?: string, isActive?: boolean) {
    const where: any = {};
    if (category) where.scenarioCategory = category;
    if (isActive !== undefined) where.isActive = isActive ? 1 : 0;

    return await this.scenarioRepository.find({
      where,
      order: { sortOrder: 'ASC', scenarioName: 'ASC' },
    });
  }

  /**
   * 获取单个场景配置
   */
  async getScenario(scenarioKey: string) {
    const scenario = await this.scenarioRepository.findOne({
      where: { scenarioKey },
    });

    if (!scenario) {
      throw new NotFoundException(`场景配置不存在: ${scenarioKey}`);
    }

    return scenario;
  }

  /**
   * 执行营销场景分析
   */
  async executeScenario(dto: ExecuteScenarioDto) {
    this.logger.log(`执行营销场景: ${dto.scenarioKey}`);

    // 1. 获取场景配置
    const scenario = await this.getScenario(dto.scenarioKey);

    if (!scenario.isActive) {
      throw new BadRequestException(`场景已禁用: ${dto.scenarioKey}`);
    }

    // 2. 验证必需变量
    this.validateVariables(scenario, dto.variables);

    // 3. 替换提示词模板中的变量
    const userPrompt = this.replaceVariables(scenario.userPromptTemplate, dto.variables);

    // 4. 调用AI进行分析
    try {
      let result;

      if (scenario.modelProvider === 'deepseek') {
        result = await this.deepseekService.analyze(
          userPrompt,
          scenario.systemPrompt,
          {
            temperature: Number(scenario.temperature),
            max_tokens: scenario.maxTokens,
          },
        );
      } else {
        // TODO: 支持豆包等其他模型
        throw new BadRequestException(`暂不支持的模型供应商: ${scenario.modelProvider}`);
      }

      // 5. 尝试解析JSON结果
      let parsedResult;
      try {
        // 提取JSON部分（处理Markdown代码块）
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) ||
                         result.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, result];

        const jsonStr = jsonMatch[1] || result;
        parsedResult = JSON.parse(jsonStr.trim());
      } catch (e) {
        // 如果不是JSON，返回原始文本
        parsedResult = { raw_result: result };
      }

      return {
        scenarioKey: dto.scenarioKey,
        scenarioName: scenario.scenarioName,
        result: parsedResult,
        rawResult: result,
        executedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`场景执行失败: ${error.message}`, error.stack);
      throw new BadRequestException(`AI分析失败: ${error.message}`);
    }
  }

  /**
   * 批量执行多个场景
   */
  async batchExecuteScenarios(dto: BatchExecuteScenarioDto) {
    this.logger.log(`批量执行场景: ${dto.scenarioKeys.join(', ')}`);

    const results = [];
    const errors = [];

    for (const scenarioKey of dto.scenarioKeys) {
      try {
        const result = await this.executeScenario({
          scenarioKey,
          variables: dto.sharedVariables,
          customerId: dto.customerId,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          scenarioKey,
          error: error.message,
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * 痛点分析（快捷方法）
   */
  async analyzePainPoints(chatContent: string, customerProfile?: any) {
    return await this.executeScenario({
      scenarioKey: 'pain_point_analysis',
      variables: {
        chat_content: chatContent,
        customer_profile: customerProfile ? JSON.stringify(customerProfile, null, 2) : '暂无',
      },
    });
  }

  /**
   * 兴趣点挖掘（快捷方法）
   */
  async mineInterestPoints(chatContent: string) {
    return await this.executeScenario({
      scenarioKey: 'interest_point_mining',
      variables: {
        chat_content: chatContent,
      },
    });
  }

  /**
   * 需求定位（快捷方法）
   */
  async positionNeeds(chatContent: string, painPoints: string[], interestPoints: string[]) {
    return await this.executeScenario({
      scenarioKey: 'need_positioning',
      variables: {
        chat_content: chatContent,
        pain_points: JSON.stringify(painPoints),
        interest_points: JSON.stringify(interestPoints),
      },
    });
  }

  /**
   * 话术推荐（快捷方法）
   */
  async recommendScripts(
    painPoints: string[],
    interestPoints: string[],
    conversationStage: string,
    decisionRole: string,
  ) {
    return await this.executeScenario({
      scenarioKey: 'script_recommendation',
      variables: {
        pain_points: JSON.stringify(painPoints),
        interest_points: JSON.stringify(interestPoints),
        conversation_stage: conversationStage,
        decision_role: decisionRole,
      },
    });
  }

  /**
   * 异议处理（快捷方法）
   */
  async handleObjections(chatContent: string, objections: string[]) {
    return await this.executeScenario({
      scenarioKey: 'objection_handling',
      variables: {
        chat_content: chatContent,
        objections: JSON.stringify(objections),
      },
    });
  }

  /**
   * 成交时机判断（快捷方法）
   */
  async assessClosingTiming(
    chatContent: string,
    intentionScore: number,
    resolvedPainPoints: string[],
    unresolvedPainPoints: string[],
    communicationRounds: number,
  ) {
    return await this.executeScenario({
      scenarioKey: 'closing_timing',
      variables: {
        chat_content: chatContent,
        intention_score: intentionScore.toString(),
        resolved_pain_points: JSON.stringify(resolvedPainPoints),
        unresolved_pain_points: JSON.stringify(unresolvedPainPoints),
        communication_rounds: communicationRounds.toString(),
      },
    });
  }

  /**
   * 验证必需变量
   */
  private validateVariables(scenario: AiMarketingScenario, variables: Record<string, any>) {
    if (!scenario.requiredVariables || scenario.requiredVariables.length === 0) {
      return;
    }

    const missingVars = [];
    for (const varName of scenario.requiredVariables) {
      if (!(varName in variables) || variables[varName] === null || variables[varName] === undefined) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new BadRequestException(
        `缺少必需变量: ${missingVars.join(', ')}. 需要的变量: ${scenario.requiredVariables.join(', ')}`,
      );
    }
  }

  /**
   * 替换提示词模板中的变量
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    // 替换 {{variable_name}} 格式的变量
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return result;
  }

  /**
   * 获取场景分类列表
   */
  async getCategories() {
    const scenarios = await this.scenarioRepository.find();
    const categories = [...new Set(scenarios.map(s => s.scenarioCategory))];
    return categories.map(category => ({
      category,
      count: scenarios.filter(s => s.scenarioCategory === category).length,
    }));
  }

  /**
   * 创建或更新场景配置
   */
  async upsertScenario(data: Partial<AiMarketingScenario>) {
    if (!data.scenarioKey) {
      throw new BadRequestException('场景标识不能为空');
    }

    const existing = await this.scenarioRepository.findOne({
      where: { scenarioKey: data.scenarioKey },
    });

    if (existing) {
      await this.scenarioRepository.update(existing.id, data);
      return await this.getScenario(data.scenarioKey);
    } else {
      const scenario = this.scenarioRepository.create(data);
      return await this.scenarioRepository.save(scenario);
    }
  }

  /**
   * 启用/禁用场景
   */
  async toggleScenario(scenarioKey: string, isActive: boolean) {
    const scenario = await this.getScenario(scenarioKey);
    await this.scenarioRepository.update(scenario.id, { isActive: isActive ? 1 : 0 });
    return { message: `场景已${isActive ? '启用' : '禁用'}` };
  }
}
