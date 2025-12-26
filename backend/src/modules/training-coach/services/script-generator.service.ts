import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingScript } from '../entities/training-script.entity';
import { CustomerPersona } from '../entities/customer-persona.entity';
import { AiConfigCallerService } from '@/common/services/ai/ai-config-caller.service';
import {
  GenerateScriptFromChatDto,
  GenerateScriptFromKnowledgeDto,
  GenerateScriptWithAIDto,
  ScriptGenerationRequirements
} from '../dto/script-generation.dto';

@Injectable()
export class ScriptGeneratorService {
  private readonly logger = new Logger(ScriptGeneratorService.name);

  constructor(
    @InjectRepository(TrainingScript)
    private readonly scriptRepository: Repository<TrainingScript>,
    @InjectRepository(CustomerPersona)
    private readonly personaRepository: Repository<CustomerPersona>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 基于聊天记录生成培训剧本
   */
  async generateFromChatHistory(
    generateDto: GenerateScriptFromChatDto,
    userId: number
  ): Promise<TrainingScript> {
    this.logger.log(`开始基于聊天记录生成剧本: ${generateDto.scenario}`);

    try {
      // 1. 分析聊天内容
      const chatContent = generateDto.chat_content;

      // 2. 模拟对话模式分析（基于聊天内容）
      const conversationPatterns = this.analyzeConversationPatterns([chatContent]);

      // 3. 提取关键话术
      const keyScripts = this.extractKeyScripts([chatContent]);

      // 4. 识别客户异议类型
      const objections = this.identifyObjections([chatContent]);

      // 5. 构建AI提示词
      const prompt = this.buildChatAnalysisPrompt({
        conversationPatterns,
        keyScripts,
        objections,
        chatContent,
        scenarioType: generateDto.scenario,
        difficulty: generateDto.difficulty || '普通',
        trainingGoals: []
      });

      // 6. 调用AI生成剧本
      const aiResponse = await this.aiConfigCallerService.callAI(
        'training_script_generation',
        { prompt: prompt }
      );

      // 7. 解析并保存剧本
      const scriptData = this.parseAIScriptResponse(aiResponse);
      const script = await this.saveScript({
        title: generateDto.title,
        scenario: generateDto.scenario,
        difficulty: generateDto.difficulty || '普通',
        source_type: '聊天记录',
        customer_background: scriptData.customer_background,
        training_goal: scriptData.training_goal,
        key_objections: scriptData.key_objections,
        standard_scripts: scriptData.standard_scripts,
        dialogue_flow: scriptData.dialogue_flow,
        max_rounds: scriptData.max_rounds || 6,
        creator_id: userId,
        status: '草稿'
      });

      this.logger.log(`基于聊天记录生成剧本成功: ${script.id}`);
      return script;

    } catch (error) {
      this.logger.error(`基于聊天记录生成剧本失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 基于知识库生成培训剧本
   */
  async generateFromKnowledgeBase(
    generateDto: GenerateScriptFromKnowledgeDto,
    userId: number
  ): Promise<TrainingScript> {
    this.logger.log(`开始基于知识库生成剧本: ${generateDto.keywords}`);

    try {
      // 1. 检索相关知识库内容
      const knowledgeResults = await this.searchKnowledgeBase(generateDto.keywords);

      // 2. 构建AI提示词
      const prompt = this.buildKnowledgeBasedPrompt({
        knowledgeContent: knowledgeResults,
        knowledgeBaseId: generateDto.knowledge_base_id,
        keywords: generateDto.keywords,
        scenarioType: generateDto.scenario,
        difficulty: generateDto.difficulty || '普通'
      });

      // 3. 调用AI生成剧本
      const aiResponse = await this.aiConfigCallerService.callAI(
        'training_script_generation',
        { prompt: prompt }
      );

      // 4. 解析并保存剧本
      const scriptData = this.parseAIScriptResponse(aiResponse);
      const script = await this.saveScript({
        title: generateDto.title,
        scenario: generateDto.scenario,
        difficulty: generateDto.difficulty || '普通',
        source_type: '知识库',
        customer_background: scriptData.customer_background,
        training_goal: scriptData.training_goal,
        key_objections: scriptData.key_objections,
        standard_scripts: scriptData.standard_scripts,
        dialogue_flow: scriptData.dialogue_flow,
        max_rounds: scriptData.max_rounds || 6,
        creator_id: userId,
        status: '草稿'
      });

      this.logger.log(`基于知识库生成剧本成功: ${script.id}`);
      return script;

    } catch (error) {
      this.logger.error(`基于知识库生成剧本失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 使用AI智能生成剧本
   */
  async generateWithAI(
    generateDto: GenerateScriptWithAIDto,
    userId: number
  ): Promise<TrainingScript> {
    this.logger.log(`开始AI智能生成剧本: ${generateDto.title}`);

    try {
      // 1. 构建完整的生成提示词
      const prompt = this.buildAIGenerationPrompt({
        title: generateDto.title,
        scenario: generateDto.scenario,
        customerBackground: generateDto.customer_background,
        trainingGoal: generateDto.training_goal,
        difficulty: generateDto.difficulty || '普通'
      });

      // 2. 调用AI生成剧本
      const aiResponse = await this.aiConfigCallerService.callAI(
        'training_script_generation',
        { prompt: prompt }
      );

      // 3. 解析并保存剧本
      const scriptData = this.parseAIScriptResponse(aiResponse);
      const script = await this.saveScript({
        title: generateDto.title,
        scenario: generateDto.scenario,
        difficulty: generateDto.difficulty || '普通',
        source_type: 'AI生成',
        customer_background: generateDto.customer_background,
        training_goal: generateDto.training_goal,
        key_objections: scriptData.key_objections,
        standard_scripts: scriptData.standard_scripts,
        dialogue_flow: scriptData.dialogue_flow,
        max_rounds: scriptData.max_rounds || 6,
        creator_id: userId,
        status: '草稿'
      });

      this.logger.log(`AI智能生成剧本成功: ${script.id}`);
      return script;

    } catch (error) {
      this.logger.error(`AI智能生成剧本失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取剧本列表
   */
  async getScripts(
    page: number = 1,
    limit: number = 10,
    scenario?: string,
    difficulty?: string,
    status?: string
  ): Promise<{ scripts: TrainingScript[]; total: number }> {
    const queryBuilder = this.scriptRepository.createQueryBuilder('script');

    if (scenario) {
      queryBuilder.andWhere('script.scenario = :scenario', { scenario });
    }
    if (difficulty) {
      queryBuilder.andWhere('script.difficulty = :difficulty', { difficulty });
    }
    if (status) {
      queryBuilder.andWhere('script.status = :status', { status });
    }

    const [scripts, total] = await queryBuilder
      .orderBy('script.create_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { scripts, total };
  }

  // ==================== 私有方法 ====================

  /**
   * 获取聊天记录（模拟实现）
   */
  private async getChatRecords(chatIds: number[]): Promise<any[]> {
    // TODO: 实际应该从wework_chat_records表获取数据
    // 这里先返回模拟数据
    return chatIds.map(id => ({
      id,
      content: `聊天记录${id}`,
      sender: 'customer',
      timestamp: new Date()
    }));
  }

  /**
   * 分析对话模式
   */
  private analyzeConversationPatterns(chatRecords: any[]): Record<string, any> {
    return {
      averageMessageLength: 15,
      objectionFrequency: 0.3,
      decisionSpeed: 'medium',
      communicationStyle: 'formal'
    };
  }

  /**
   * 提取关键话术
   */
  private extractKeyScripts(chatRecords: any[]): string[] {
    return [
      '开场白：您好，我是XX公司的销售顾问',
      '异议处理：我理解您的顾虑，很多客户也有类似的担心',
      '促成技巧：如果您现在决定，我们可以提供特别优惠'
    ];
  }

  /**
   * 识别客户异议
   */
  private identifyObjections(chatRecords: any[]): string[] {
    return ['价格太贵', '效果不确定', '需要时间考虑'];
  }

  /**
   * 搜索知识库（模拟实现）
   */
  private async searchKnowledgeBase(query: string): Promise<any[]> {
    // TODO: 实际应该调用enterprise-knowledge服务
    return [
      {
        title: '价格谈判技巧',
        content: '价格谈判的关键在于价值展示...',
        relevanceScore: 0.85
      }
    ];
  }

  /**
   * 获取销售方法论
   */
  private async getSalesMethodology(scenarioType: string): Promise<Record<string, any>> {
    const methodologies = {
      first_contact: {
        steps: ['建立信任', '了解需求', '展示价值', '获取承诺'],
        keyPoints: ['专业性', '同理心', '价值主张']
      },
      price_negotiation: {
        steps: ['价值锚定', '异议处理', '方案优化', '促成决策'],
        keyPoints: ['ROI分析', '对比优势', '风险评估']
      },
      objection_handling: {
        steps: ['倾听理解', '认同感受', '事实回应', '解决疑虑'],
        keyPoints: ['同理心', '数据支撑', '案例佐证']
      }
    };

    return methodologies[scenarioType] || methodologies.first_contact;
  }

  /**
   * 构建基于聊天记录分析的提示词
   */
  private buildChatAnalysisPrompt(data: Record<string, any>): string {
    return `【基于聊天记录的剧本生成需求】

对话模式分析：
${JSON.stringify(data.conversationPatterns, null, 2)}

关键话术提取：
${JSON.stringify(data.keyScripts, null, 2)}

客户异议识别：
${JSON.stringify(data.objections, null, 2)}

场景类型：${data.scenarioType}
难度等级：${data.difficulty}
培训目标：${data.trainingGoals.join(', ')}

请基于以上聊天记录分析，生成一个实战性强的销售培训剧本。`;
  }

  /**
   * 构建基于知识库的提示词
   */
  private buildKnowledgeBasedPrompt(data: Record<string, any>): string {
    return `【基于知识库的剧本生成需求】

知识库内容：
${JSON.stringify(data.knowledgeContent, null, 2)}

销售方法论：
${JSON.stringify(data.salesMethodology, null, 2)}

客户角色：
${JSON.stringify(data.customerPersona, null, 2)}

场景类型：${data.scenarioType}
难度等级：${data.difficulty}

请基于知识库内容和销售方法论，生成专业的销售培训剧本。`;
  }

  /**
   * 构建AI生成提示词
   */
  private buildAIGenerationPrompt(data: Record<string, any>): string {
    return `【AI智能剧本生成需求】

剧本标题：${data.title}
场景类型：${data.scenario}
客户背景：${data.customerBackground}
培训目标：${data.trainingGoal}
难度等级：${data.difficulty}

请根据以上需求，生成一个完整的销售培训剧本，要求真实、专业、有挑战性。`;
  }

  /**
   * 解析AI剧本响应
   */
  private parseAIScriptResponse(aiResponse: any): Record<string, any> {
    try {
      if (typeof aiResponse === 'string') {
        // 尝试解析JSON响应
        if (aiResponse.trim().startsWith('{')) {
          return JSON.parse(aiResponse);
        } else {
          // 如果不是JSON格式，则生成默认结构
          return {
            title: 'AI生成的培训剧本',
            customer_background: aiResponse.substring(0, 200),
            training_goal: '提升销售技能',
            key_objections: ['价格异议', '效果疑虑'],
            standard_scripts: [aiResponse.substring(0, 100)],
            dialogue_flow: { round_1: { customer: '你们这个是什么？' } },
            max_rounds: 6
          };
        }
      }
      return aiResponse;
    } catch (error) {
      this.logger.error(`解析AI响应失败: ${error.message}`);
      throw new Error('AI响应格式解析失败');
    }
  }

  /**
   * 保存剧本
   */
  private async saveScript(scriptData: Record<string, any>): Promise<TrainingScript> {
    const script = this.scriptRepository.create(scriptData);
    return await this.scriptRepository.save(script);
  }

  /**
   * 转换难度等级
   */
  private convertDifficultyLevel(level: number): string {
    if (level <= 2) return '简单';
    if (level <= 4) return '普通';
    return '困难';
  }
}