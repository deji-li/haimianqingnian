import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import {
  AiScriptConversation,
  AiScriptMessage,
  AiScriptScenario,
  AiScriptTechnique,
  AiScriptFeedback,
  AiScriptRecommendation,
} from './entities/index';
import { CreateConversationDto, SendMessageDto, QueryConversationsDto, FunctionType } from './dto/index';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { AiConfigCallerService } from '../../common/services/ai/ai-config-caller.service';
import { KnowledgeEnhancedAIService, EnhancedAIResponse } from '../enterprise-knowledge/knowledge-enhanced-ai.service';
import { EnterpriseKnowledgeService } from '../enterprise-knowledge/enterprise-knowledge.service';

@Injectable()
export class AiScriptAssistantService {
  private readonly logger = new Logger(AiScriptAssistantService.name);

  constructor(
    @InjectRepository(AiScriptConversation)
    private readonly conversationRepository: Repository<AiScriptConversation>,
    @InjectRepository(AiScriptMessage)
    private readonly messageRepository: Repository<AiScriptMessage>,
    @InjectRepository(AiScriptScenario)
    private readonly scenarioRepository: Repository<AiScriptScenario>,
    @InjectRepository(AiScriptTechnique)
    private readonly techniqueRepository: Repository<AiScriptTechnique>,
    @InjectRepository(AiScriptFeedback)
    private readonly feedbackRepository: Repository<AiScriptFeedback>,
    @InjectRepository(AiScriptRecommendation)
    private readonly recommendationRepository: Repository<AiScriptRecommendation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly aiConfigCallerService: AiConfigCallerService,
    @Inject(forwardRef(() => KnowledgeEnhancedAIService))
    private readonly knowledgeEnhancedAIService: KnowledgeEnhancedAIService,
    @Inject(forwardRef(() => EnterpriseKnowledgeService))
    private readonly knowledgeService: EnterpriseKnowledgeService,
  ) {}

  /**
   * 创建对话会话
   */
  async createConversation(userId: number, dto: CreateConversationDto) {
    try {
      // 验证场景和技巧是否存在
      if (dto.scenarioId) {
        const scenario = await this.scenarioRepository.findOne({
          where: { id: dto.scenarioId, isActive: true }
        });
        if (!scenario) {
          throw new NotFoundException('场景不存在或已禁用');
        }
      }

      if (dto.techniqueId) {
        const technique = await this.techniqueRepository.findOne({
          where: { id: dto.techniqueId, isActive: true }
        });
        if (!technique) {
          throw new NotFoundException('技巧不存在或已禁用');
        }
      }

      // 获取客户信息
      let customer = null;
      if (dto.customerId) {
        customer = await this.customerRepository.findOne({
          where: { id: dto.customerId }
        });
        if (!customer) {
          throw new NotFoundException('客户不存在');
        }
      }

      const conversation = this.conversationRepository.create({
        userId,
        functionType: dto.functionType,
        scenarioId: dto.scenarioId,
        techniqueId: dto.techniqueId,
        customerId: dto.customerId,
        title: dto.title || this.generateTitle(dto.functionType, customer),
      });

      const savedConversation = await this.conversationRepository.save(conversation);

      // 如果有场景和技巧，发送欢迎消息
      if (dto.scenarioId && dto.techniqueId) {
        await this.sendWelcomeMessage(savedConversation.id, userId, dto);
      }

      this.logger.log(`创建对话成功: ID=${savedConversation.id}, 类型=${dto.functionType}`);
      return savedConversation;

    } catch (error) {
      this.logger.error(`创建对话失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(conversationId: number, userId: number, dto: SendMessageDto) {
    try {
      // 验证对话是否存在且属于当前用户
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId, isActive: true }
      });

      if (!conversation) {
        throw new NotFoundException('对话不存在或无权限访问');
      }

      // 获取客户信息
      let customer = null;
      if (conversation.customerId) {
        customer = await this.customerRepository.findOne({
          where: { id: conversation.customerId }
        });
      }

      // 保存用户消息
      const userMessage = this.messageRepository.create({
        conversationId,
        role: 'user',
        content: dto.content,
      });
      await this.messageRepository.save(userMessage);

      // 检查是否需要生成智能标题（第一条用户消息）
      const messageCount = await this.messageRepository.count({ where: { conversationId } });
      if (messageCount === 1) {
        // 这是第一条消息，生成智能标题
        const scenarioName = dto.scenario || conversation.scenarioId ? (await this.scenarioRepository.findOne({ where: { id: conversation.scenarioId } }))?.scenarioName : '默认场景';
        const smartTitle = await this.generateSmartTitle(conversationId, dto.content, scenarioName || '默认场景');
        await this.conversationRepository.update(conversationId, { title: smartTitle });
        this.logger.log(`为对话 ${conversationId} 生成智能标题: ${smartTitle}`);
      }

      // 构建AI响应
      const aiResponse = await this.generateAIResponse(conversation, dto, customer);

      // 保存AI回复
      const assistantMessage = this.messageRepository.create({
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        thinkingProcess: aiResponse.thinkingProcess,
        knowledgeSource: aiResponse.knowledgeSources,
        sourceType: (aiResponse as any).sourceType,
        suggestions: aiResponse.suggestions,
        confidenceScore: aiResponse.confidence,
        processingTime: aiResponse.processingTime,
      });
      await this.messageRepository.save(assistantMessage);

      // 更新对话的最后消息时间
      await this.conversationRepository.update(conversationId, {
        lastMessageTime: new Date(),
      });

      this.logger.log(`发送消息成功: 对话ID=${conversationId}`);
      return {
        userMessage,
        assistantMessage,
        knowledgeSources: aiResponse.knowledgeSources,
      };

    } catch (error) {
      this.logger.error(`发送消息失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取对话列表
   */
  async getConversations(userId: number, userRole: string, query: QueryConversationsDto) {
    try {
      // 简化查询，先获取对话基本信息
      const qb = this.conversationRepository.createQueryBuilder('conv');

      // 权限控制：管理员可以看所有对话，普通用户只能看自己的
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';

      if (isAdmin) {
        // 管理员：如果query中指定了userId，则筛选该用户的对话；否则显示所有对话
        if (query.userId) {
          qb.where('conv.userId = :userId', { userId: query.userId });
        }
        // 如果没有指定userId，则不添加userId过滤条件，显示所有对话
      } else {
        // 普通用户：只能看自己的对话
        qb.where('conv.userId = :userId', { userId });
      }

      if (query.functionType) {
        qb.andWhere('conv.functionType = :functionType', { functionType: query.functionType });
      }

      if (query.customerId) {
        qb.andWhere('conv.customerId = :customerId', { customerId: query.customerId });
      }

      if (query.isActive !== undefined) {
        qb.andWhere('conv.isActive = :isActive', { isActive: query.isActive });
      }

      const [list, total] = await qb
        .orderBy('conv.lastMessageTime', 'DESC')
        .addOrderBy('conv.createTime', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      // 分别获取关联数据，避免复杂的join查询
      for (const conv of list) {
        // 获取客户信息
        if (conv.customerId) {
          try {
            const customer = await this.customerRepository.findOne({
              where: { id: conv.customerId }
            });
            (conv as any).customer = customer;
          } catch (error) {
            this.logger.warn(`获取客户 ${conv.customerId} 信息失败: ${error.message}`);
            (conv as any).customer = null;
          }
        }

        // 获取场景信息
        if (conv.scenarioId) {
          try {
            const scenario = await this.scenarioRepository.findOne({
              where: { id: conv.scenarioId }
            });
            (conv as any).scenario = scenario;
          } catch (error) {
            this.logger.warn(`获取场景 ${conv.scenarioId} 信息失败: ${error.message}`);
            (conv as any).scenario = null;
          }
        }

        // 获取技巧信息
        if (conv.techniqueId) {
          try {
            const technique = await this.techniqueRepository.findOne({
              where: { id: conv.techniqueId }
            });
            (conv as any).technique = technique;
          } catch (error) {
            this.logger.warn(`获取技巧 ${conv.techniqueId} 信息失败: ${error.message}`);
            (conv as any).technique = null;
          }
        }

        // 获取最新消息
        try {
          const latestMessage = await this.messageRepository.findOne({
            where: { conversationId: conv.id },
            order: { createTime: 'DESC' },
          });
          (conv as any).latestMessage = latestMessage;
        } catch (error) {
          this.logger.warn(`获取对话 ${conv.id} 最新消息失败: ${error.message}`);
          (conv as any).latestMessage = null;
        }
      }

      return {
        list,
        total,
        page: query.page,
        limit: query.limit,
      };

    } catch (error) {
      this.logger.error(`获取对话列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取对话详情
   */
  async getConversationDetail(conversationId: number, userId: number) {
    try {
      // 先获取基本对话信息
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId }
      });

      if (!conversation) {
        throw new NotFoundException('对话不存在或无权限访问');
      }

      // 分别获取关联数据
      const conv: any = { ...conversation };

      // 获取客户信息
      if (conversation.customerId) {
        try {
          conv.customer = await this.customerRepository.findOne({
            where: { id: conversation.customerId }
          });
        } catch (error) {
          this.logger.warn(`获取客户 ${conversation.customerId} 信息失败: ${error.message}`);
          conv.customer = null;
        }
      }

      // 获取场景信息
      if (conversation.scenarioId) {
        try {
          conv.scenario = await this.scenarioRepository.findOne({
            where: { id: conversation.scenarioId }
          });
        } catch (error) {
          this.logger.warn(`获取场景 ${conversation.scenarioId} 信息失败: ${error.message}`);
          conv.scenario = null;
        }
      }

      // 获取技巧信息
      if (conversation.techniqueId) {
        try {
          conv.technique = await this.techniqueRepository.findOne({
            where: { id: conversation.techniqueId }
          });
        } catch (error) {
          this.logger.warn(`获取技巧 ${conversation.techniqueId} 信息失败: ${error.message}`);
          conv.technique = null;
        }
      }

      // 获取消息列表
      const messages = await this.messageRepository.find({
        where: { conversationId },
        order: { createTime: 'ASC' }
      });

      return {
        conversation: conv,
        messages,
      };

    } catch (error) {
      this.logger.error(`获取对话详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: number, userId: number) {
    try {
      // 查找对话
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId }
      });

      if (!conversation) {
        throw new NotFoundException('对话不存在或无权限访问');
      }

      // 删除对话的所有消息
      await this.messageRepository.delete({ conversationId });
      this.logger.log(`删除对话 ${conversationId} 的所有消息`);

      // 删除对话
      await this.conversationRepository.delete({ id: conversationId });
      this.logger.log(`删除对话成功: ID=${conversationId}, userId=${userId}`);

      return {
        message: '对话删除成功',
        deletedId: conversationId
      };

    } catch (error) {
      this.logger.error(`删除对话失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取场景列表
   */
  async getScenarios(functionType?: FunctionType) {
    try {
      // 先尝试简单查询，不使用复杂的query builder
      let scenarios;
      if (functionType) {
        scenarios = await this.scenarioRepository.find({
          where: {
            functionType: functionType,
            isActive: true
          },
          order: {
            sortOrder: 'ASC',
            createTime: 'ASC'
          }
        });
      } else {
        scenarios = await this.scenarioRepository.find({
          where: {
            isActive: true
          },
          order: {
            sortOrder: 'ASC',
            createTime: 'ASC'
          }
        });
      }

      // 简单处理技巧数据
      for (const scenario of scenarios) {
        try {
          const techniques = await this.techniqueRepository.find({
            where: {
              scenarioId: scenario.id,
              isActive: true
            },
            order: { sortOrder: 'ASC' }
          });
          (scenario as any).techniques = techniques;
        } catch (techError) {
          this.logger.warn(`获取场景 ${scenario.id} 的技巧失败: ${techError.message}`);
          (scenario as any).techniques = [];
        }
      }

      return scenarios;

    } catch (error) {
      this.logger.error(`获取场景列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取技巧列表
   */
  async getTechniques(scenarioId: number) {
    try {
      const techniques = await this.techniqueRepository.find({
        where: {
          scenarioId: scenarioId,
          isActive: true
        },
        order: {
          sortOrder: 'ASC',
          createTime: 'ASC'
        }
      });

      return techniques;

    } catch (error) {
      this.logger.error(`获取技巧列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成AI响应
   */
  private async generateAIResponse(
    conversation: AiScriptConversation,
    dto: SendMessageDto,
    customer?: Customer | null,
  ): Promise<EnhancedAIResponse & { thinkingProcess?: string; suggestions?: any[] }> {
    try {
      // 构建客户画像
      const customerProfile = customer ? `
客户姓名: ${customer.realName || customer.wechatNickname || '未知'}
客户意向: ${customer.customerIntent || '未知'}
跟进状态: ${customer.lifecycleStage || '未知'}
最后联系: ${customer.updateTime?.toLocaleDateString() || '未知'}
      `.trim() : dto.customerProfile || '';

      // 获取场景描述
      let scenarioDesc = dto.scenario || '';
      if (conversation.scenarioId) {
        const scenario = await this.scenarioRepository.findOne({
          where: { id: conversation.scenarioId }
        });
        scenarioDesc = scenario?.scenarioDesc || dto.scenario || '';
      }

      // 获取技巧说明
      let techniqueDesc = dto.technique || '';
      if (conversation.techniqueId) {
        const technique = await this.techniqueRepository.findOne({
          where: { id: conversation.techniqueId }
        });
        techniqueDesc = technique?.techniqueDesc || dto.technique || '';
      }

      // 构建查询内容
      let query = dto.content;

      // 添加场景和技巧上下文
      if (scenarioDesc && techniqueDesc) {
        query += `\n\n场景: ${scenarioDesc}\n技巧: ${techniqueDesc}`;
      }

      // 添加客户画像
      if (customerProfile) {
        query += `\n\n客户信息:\n${customerProfile}`;
      }

      // 映射功能类型到知识库查询类型
      const functionTypeMap = {
        deal_assist: 'MARKETING_ADVICE',
        reply_assist: 'MARKETING_ADVICE',
        script_polish: 'KNOWLEDGE_MINING',
        opening_lines: 'MARKETING_ADVICE',
      };

      // 使用知识库增强AI服务
      const enhancedResponse = await this.knowledgeEnhancedAIService.generateEnhancedResponse({
        query,
        context: {
          functionType: conversation.functionType,
          customerName: customer?.realName || customer?.wechatNickname,
          scenario: scenarioDesc,
          technique: techniqueDesc,
        },
        functionType: functionTypeMap[conversation.functionType] as any,
        userId: conversation.userId,
        customerId: conversation.customerId || undefined,
        useKnowledgeBase: true,
      });

      // 添加思考过程和建议
      const result = {
        ...enhancedResponse,
        thinkingProcess: this.generateThinkingProcess(enhancedResponse),
        suggestions: this.generateSuggestions(enhancedResponse, conversation.functionType as any),
      };

      return result;

    } catch (error) {
      this.logger.error(`生成AI响应失败: ${error.message}`, error.stack);

      // 降级处理：返回基础响应
      return {
        content: this.getFallbackResponse(conversation.functionType as any, dto.content),
        confidence: 0.5,
        responseStrategy: 'GENERAL_AI',
        processingTime: 0,
        thinkingProcess: 'AI服务暂时不可用，使用预设回复',
        suggestions: [],
      };
    }
  }

  /**
   * 发送欢迎消息
   */
  private async sendWelcomeMessage(conversationId: number, userId: number, dto: CreateConversationDto) {
    const welcomeMessage = this.getWelcomeMessage(dto.functionType);

    const message = this.messageRepository.create({
      conversationId,
      role: 'assistant',
      content: welcomeMessage,
      sourceType: 'ai_generate',
    });

    await this.messageRepository.save(message);
  }

  /**
   * 生成对话标题
   */
  private generateTitle(functionType: FunctionType, customer?: Customer | null): string {
    const typeNames = {
      deal_assist: '帮你谈单',
      reply_assist: '帮你回复',
      script_polish: '话术润色',
      opening_lines: '开场白生成',
    };

    const customerName = customer?.realName || customer?.wechatNickname || '未知客户';
    return `${typeNames[functionType]} - ${customerName}`;
  }

  /**
   * 生成思考过程
   */
  private generateThinkingProcess(response: EnhancedAIResponse): string {
    const strategy = response.responseStrategy;
    let thinking = '';

    // 根据策略生成详细的思考过程
    switch (strategy) {
      case 'KNOWLEDGE_BASED':
        thinking = '1. 分析用户需求和场景\n' +
                  '2. 从企业知识库中检索相关话术案例\n' +
                  '3. 匹配最符合当前情境的话术模板\n' +
                  '4. 根据客户特点进行个性化调整\n' +
                  '5. 生成专业的话术回复';
        break;
      case 'KNOWLEDGE_ENHANCED':
        thinking = '1. 深入理解用户需求和沟通场景\n' +
                  '2. 从企业知识库获取相关案例和最佳实践\n' +
                  '3. 结合AI智能分析生成个性化建议\n' +
                  '4. 考虑客户心理和购买决策因素\n' +
                  '5. 优化话术的表达方式和情感色彩';
        break;
      case 'GENERAL_AI':
        thinking = '1. 理解用户的基本需求和意图\n' +
                  '2. 基于销售沟通经验生成建议\n' +
                  '3. 考虑常见的话术技巧和策略\n' +
                  '4. 调整语言风格以适应沟通场景\n' +
                  '5. 提供通用性的话术指导';
        break;
    }

    // 添加置信度分析
    if (response.confidence) {
      thinking += `\n\n置信度分析: ${(response.confidence * 100).toFixed(1)}%`;
      if (response.confidence >= 0.8) {
        thinking += '（高置信度，建议直接使用）';
      } else if (response.confidence >= 0.6) {
        thinking += '（中等置信度，可根据实际情况调整）';
      } else {
        thinking += '（低置信度，建议提供更多上下文信息）';
      }
    }

    // 添加知识来源说明
    if (response.knowledgeSources && response.knowledgeSources.length > 0) {
      thinking += `\n\n知识来源分析:\n`;
      response.knowledgeSources.forEach((source, index) => {
        thinking += `${index + 1}. ${source.title}（相关度: ${((source as any).score || 0).toFixed(2)}）\n`;
      });
      thinking += '\n综合企业知识库和成功案例，确保话术的专业性和实用性。';
    }

    // 添加处理时间信息
    if (response.processingTime) {
      thinking += `\n\n处理耗时: ${response.processingTime}ms`;
    }

    return thinking;
  }

  /**
   * 生成建议
   */
  private generateSuggestions(response: EnhancedAIResponse, functionType: FunctionType): any[] {
    const suggestions = [];

    if (response.knowledgeSources && response.knowledgeSources.length > 0) {
      suggestions.push({
        type: 'knowledge',
        title: '查看相关知识',
        description: '推荐查看相关的知识库内容',
        data: response.knowledgeSources,
      });
    }

    if (response.confidence < 0.7) {
      suggestions.push({
        type: 'improve',
        title: '优化建议',
        description: '可以提供更详细的客户信息以获得更精准的话术建议',
      });
    }

    return suggestions;
  }

  /**
   * 获取欢迎消息
   */
  private getWelcomeMessage(functionType: FunctionType): string {
    const welcomeMessages = {
      deal_assist: '您好！我是您的谈单助手，请告诉我您遇到的客户情况，我将为您提供专业的话术建议。',
      reply_assist: '您好！我是您的回复助手，请描述客户的提问或异议，我将帮您生成合适的回复话术。',
      script_polish: '您好！我是话术润色助手，请提供您想要优化的话术内容，我将帮您进行改进。',
      opening_lines: '您好！我是开场白生成助手，请告诉我客户的基本情况，我将为您生成有效的开场白。',
    };

    return welcomeMessages[functionType] || '您好！我是AI话术助手，请问有什么可以帮助您的？';
  }

  /**
   * 获取降级响应
   */
  private getFallbackResponse(functionType: FunctionType, content: string): string {
    const fallbackResponses = {
      deal_assist: '建议先了解客户的真实需求和痛点，然后针对性地介绍产品的价值。可以询问客户目前遇到的具体问题是什么？',
      reply_assist: '建议耐心倾听客户的顾虑，表示理解并给出合理的解释。可以强调我们的服务优势来解决客户的担忧。',
      script_polish: '建议让话术更加简洁明了，突出重点，同时保持亲和力和专业性。',
      opening_lines: '建议以友好的问候开始，简要介绍自己和目的，然后询问客户的时间是否方便。',
    };

    return fallbackResponses[functionType] || '抱歉，AI服务暂时不可用，请稍后再试。';
  }

  /**
   * 推荐话术到知识库
   */
  async recommendScript(userId: number, dto: { conversationId: number, messageId: number, recommendReason?: string }) {
    try {
      // 验证消息是否存在
      const message = await this.messageRepository.findOne({
        where: { id: dto.messageId, conversationId: dto.conversationId }
      });

      if (!message) {
        throw new NotFoundException('消息不存在');
      }

      // 验证对话是否属于当前用户
      const conversation = await this.conversationRepository.findOne({
        where: { id: dto.conversationId, userId }
      });

      if (!conversation) {
        throw new NotFoundException('对话不存在或无权限访问');
      }

      // 检查是否已经推荐过
      const existing = await this.recommendationRepository.findOne({
        where: {
          messageId: dto.messageId,
          userId
        }
      });

      if (existing) {
        throw new BadRequestException('该话术已推荐过');
      }

      // 创建推荐记录
      const recommendation = this.recommendationRepository.create({
        conversationId: dto.conversationId,
        messageId: dto.messageId,
        scriptContent: message.content,
        functionType: conversation.functionType,
        scenarioId: conversation.scenarioId,
        techniqueId: conversation.techniqueId,
        aiQualityScore: message.confidenceScore || 0,
        recommendReason: dto.recommendReason || this.generateRecommendReason(message, conversation),
        userId,
        status: 'pending',
      });

      const saved = await this.recommendationRepository.save(recommendation);

      // 如果AI评分很高（>=0.8），自动批准
      if (message.confidenceScore && message.confidenceScore >= 0.8) {
        await this.approveRecommendation(saved.id, userId, true, '高质量话术自动通过');
      }

      this.logger.log(`话术推荐成功: ID=${saved.id}, 用户=${userId}`);
      return saved;

    } catch (error) {
      this.logger.error(`推荐话术失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取推荐列表
   */
  async getRecommendations(query: any, userId: number, userRole: string) {
    try {
      const qb = this.recommendationRepository.createQueryBuilder('rec');

      // 普通用户只能看自己的推荐
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        qb.where('rec.userId = :userId', { userId });
      }

      if (query.functionType) {
        qb.andWhere('rec.functionType = :functionType', { functionType: query.functionType });
      }

      if (query.status) {
        qb.andWhere('rec.status = :status', { status: query.status });
      }

      const [list, total] = await qb
        .orderBy('rec.createTime', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();

      return {
        list,
        total,
        page: query.page,
        limit: query.limit,
      };

    } catch (error) {
      this.logger.error(`获取推荐列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 审核推荐
   */
  async approveRecommendation(recommendationId: number, userId: number, approved: boolean, remark?: string) {
    try {
      const recommendation = await this.recommendationRepository.findOne({
        where: { id: recommendationId }
      });

      if (!recommendation) {
        throw new NotFoundException('推荐记录不存在');
      }

      recommendation.status = approved ? 'approved' : 'rejected';
      recommendation.approvedBy = userId;
      recommendation.approvedAt = new Date();

      await this.recommendationRepository.save(recommendation);

      // 如果通过，则将话术添加到企业知识库
      if (approved) {
        await this.addScriptToKnowledge(recommendation);
      }

      this.logger.log(`审核推荐成功: ID=${recommendationId}, 结果=${approved ? '通过' : '拒绝'}`);
      return recommendation;

    } catch (error) {
      this.logger.error(`审核推荐失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 将话术添加到知识库
   */
  private async addScriptToKnowledge(recommendation: AiScriptRecommendation) {
    try {
      // 调用企业知识库服务添加知识
      this.logger.log(`将话术添加到知识库: 推荐ID=${recommendation.id}`);

      // 映射功能类型到知识库类别
      const categoryMap = {
        opening_lines: '开场技巧',
        deal_assist: '成交技巧',
        reply_assist: '应对异议',
        script_polish: '话术模板',
      };

      const category = categoryMap[recommendation.functionType] || '其他';

      // 创建知识库条目
      const knowledge = await this.knowledgeService.create({
        title: `优质话术 - ${category}`,
        content: recommendation.scriptContent,
        sceneCategory: category,
        questionType: 'FAQ',
        sourceType: 'ai_generated',
      }, recommendation.userId);

      this.logger.log(`话术已添加到知识库: 知识ID=${knowledge.id}`);

      return knowledge;

    } catch (error) {
      this.logger.error(`添加到知识库失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成推荐原因
   */
  private generateRecommendReason(message: AiScriptMessage, conversation: AiScriptConversation): string {
    const reasons = [];

    if (message.confidenceScore && message.confidenceScore >= 0.8) {
      reasons.push('AI生成质量高');
    }

    if (message.knowledgeSource && message.knowledgeSource.length > 0) {
      reasons.push('基于企业知识库');
    }

    if (message.sourceType === 'knowledge_hybrid') {
      reasons.push('知识库与AI融合生成');
    }

    return reasons.length > 0 ? reasons.join('、') : '用户主动推荐';
  }

  /**
   * 直接生成话术（工具模式）
   */
  async generateDirect(userId: number, dto: {
    functionType: 'script_polish' | 'opening_lines'
    content?: string
    scenarioId?: number
    techniqueId?: number
    variables?: Record<string, any>
  }) {
    try {
      // 构建提示词
      let prompt = '';

      if (dto.functionType === 'script_polish') {
        prompt = this.buildScriptPolishPrompt(dto);
      } else if (dto.functionType === 'opening_lines') {
        prompt = this.buildOpeningLinesPrompt(dto);
      }

      // 获取场景和技巧信息
      const scenario = dto.scenarioId ? await this.scenarioRepository.findOne({
        where: { id: dto.scenarioId }
      }) : null;

      const technique = dto.techniqueId ? await this.techniqueRepository.findOne({
        where: { id: dto.techniqueId }
      }) : null;

      // 调用AI服务
      const aiResponse = await this.callAIService(prompt, dto.functionType);

      return {
        content: aiResponse.content,
        thinkingProcess: aiResponse.thinkingProcess || 'AI思考过程生成中...',
        confidence: aiResponse.confidence || 0.5,
        processingTime: aiResponse.processingTime || 0,
        knowledgeSources: aiResponse.knowledgeSources || [],
        scenario: scenario?.scenarioName,
        technique: technique?.techniqueName,
      };

    } catch (error) {
      this.logger.error(`直接生成话术失败: ${error.message}`, error.stack);

      // 返回默认回复
      return {
        content: this.getDefaultResponse(dto.functionType),
        thinkingProcess: 'AI服务暂时不可用，使用预设回复',
        confidence: 0.5,
        processingTime: 0,
        knowledgeSources: [],
      };
    }
  }

  /**
   * 构建话术润色提示词
   */
  private buildScriptPolishPrompt(dto: any): string {
    const { content, variables } = dto;

    let prompt = `请帮我润色以下话术内容：\n\n${content}\n\n`;

    if (variables) {
      if (variables.applicationScenario) {
        prompt += `应用场景：${variables.applicationScenario}\n`;
      }
      if (variables.polishGoal) {
        prompt += `润色目标：${variables.polishGoal}\n`;
      }
    }

    prompt += `\n请根据以上信息，提供润色后的专业话术。要求：\n1. 保持原意不变\n2. 语气更加专业自然\n3. 结构清晰有说服力\n4. 适合实际沟通使用`;

    return prompt;
  }

  /**
   * 构建开场白提示词
   */
  private buildOpeningLinesPrompt(dto: any): string {
    const { scenarioId, techniqueId } = dto;

    let prompt = `请帮我生成一个有效的开场白。`;

    if (scenarioId) {
      prompt += `场景ID：${scenarioId}。`;
    }

    if (techniqueId) {
      prompt += `技巧ID：${techniqueId}。`;
    }

    prompt += `\n请生成简洁、自然、有吸引力的开场白，能够快速建立联系并引导对话。`;

    return prompt;
  }

  /**
   * 调用AI服务
   */
  private async callAIService(prompt: string, functionType: string): Promise<{
    content: string
    thinkingProcess?: string
    confidence?: number
    processingTime?: number
    knowledgeSources?: any[]
  }> {
    try {
      // 使用知识增强AI服务
      const response = await this.knowledgeEnhancedAIService.generateEnhancedResponse({
        query: prompt,
        context: { functionType },
        functionType: functionType as any,
        userId: 0,
        useKnowledgeBase: true,
      });

      // 返回处理后的响应
      return {
        content: response.content,
        thinkingProcess: `AI使用${response.responseStrategy}模式生成回答`,
        confidence: response.confidence,
        processingTime: response.processingTime,
        knowledgeSources: response.knowledgeSources,
      };
    } catch (error) {
      this.logger.error(`AI服务调用失败: ${error.message}`, error.stack);

      // 返回默认响应
      return {
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        thinkingProcess: 'AI服务调用失败',
        confidence: 0.3,
        processingTime: 0,
        knowledgeSources: [],
      };
    }
  }

  /**
   * 生成智能标题
   */
  private async generateSmartTitle(conversationId: number, firstMessage: string, scenarioName: string): Promise<string> {
    try {
      // 提取用户输入的关键词
      const keywords = this.extractKeywords(firstMessage);

      // 生成摘要标题
      if (keywords.length > 0) {
        // 使用关键词生成标题
        const keywordSummary = keywords.slice(0, 3).join('、');
        return `帮你谈单-${keywordSummary}`;
      } else if (firstMessage.length > 0) {
        // 使用前几个字作为标题
        const summary = firstMessage.substring(0, 10);
        return `帮你谈单-${summary}${firstMessage.length > 10 ? '...' : ''}`;
      } else {
        // 使用场景名称
        return `帮你谈单-${scenarioName}`;
      }
    } catch (error) {
      this.logger.warn(`生成智能标题失败: ${error.message}`);
      return `帮你谈单-${scenarioName}`;
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(message: string): string[] {
    try {
      // 移除标点符号和特殊字符
      const cleanedMessage = message.replace(/[^\u4e00-\u9fa5\w\s]/g, ' ');

      // 停用词列表
      const stopWords = [
        '的', '了', '是', '在', '有', '和', '与', '或', '但', '而', '等',
        '我', '你', '他', '她', '它', '们', '这', '那', '哪', '什么', '怎么',
        '能', '会', '要', '想', '可以', '就', '都', '也', '还', '再',
        '吗', '呢', '吧', '啊', '哦', '嗯'
      ];

      // 分词并过滤
      const words = cleanedMessage
        .split(/\s+/)
        .filter(word => {
          // 过滤条件：长度大于1，不在停用词列表中
          return word.length > 1 && !stopWords.includes(word);
        })
        .filter(word => {
          // 过滤纯数字和纯英文字母
          return !/^\d+$/.test(word) && !/^[a-zA-Z]+$/.test(word);
        });

      // 返回前5个关键词
      return words.slice(0, 5);
    } catch (error) {
      this.logger.warn(`提取关键词失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取默认回复
   */
  private getDefaultResponse(functionType: string): string {
    const defaults = {
      script_polish: '抱歉，话术润色服务暂时不可用。请稍后再试，或者手动优化您的话术内容。',
      opening_lines: '抱歉，开场白生成服务暂时不可用。请稍后再试，或者使用其他方式开始对话。'
    };

    return defaults[functionType] || '抱歉，AI服务暂时不可用，请稍后再试。';
  }

  /**
   * 提交反馈
   */
  async submitFeedback(userId: number, dto: { messageId: number; feedbackType: 'like' | 'dislike'; feedbackReason?: string }) {
    try {
      // 验证消息是否存在
      const message = await this.messageRepository.findOne({
        where: { id: dto.messageId }
      });

      if (!message) {
        throw new NotFoundException('消息不存在');
      }

      // 检查是否已经反馈过
      const existingFeedback = await this.feedbackRepository.findOne({
        where: {
          messageId: dto.messageId,
          userId,
        }
      });

      if (existingFeedback) {
        // 更新现有反馈
        existingFeedback.feedbackType = dto.feedbackType;
        existingFeedback.feedbackReason = dto.feedbackReason || null;
        await this.feedbackRepository.save(existingFeedback);

        this.logger.log(`用户${userId}更新了消息${dto.messageId}的反馈`);
        return { message: '反馈已更新', feedback: existingFeedback };
      }

      // 创建新反馈
      const feedback = this.feedbackRepository.create({
        messageId: dto.messageId,
        userId,
        feedbackType: dto.feedbackType,
        feedbackReason: dto.feedbackReason || null,
        isLearned: false,
      });

      const savedFeedback = await this.feedbackRepository.save(feedback);

      this.logger.log(`用户${userId}提交了反馈: 消息ID=${dto.messageId}, 类型=${dto.feedbackType}`);

      // 如果是好评，标记消息为高质量
      if (dto.feedbackType === 'like') {
        message.isFeatured = true;
        await this.messageRepository.save(message);
      }

      return { message: '反馈提交成功', feedback: savedFeedback };

    } catch (error) {
      this.logger.error(`提交反馈失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 记录话术使用
   */
  async recordScriptUsage(userId: number, messageId: number, success: boolean) {
    try {
      // 验证消息是否存在
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['conversation']
      });

      if (!message) {
        throw new NotFoundException('消息不存在');
      }

      // 更新消息的使用次数
      message.usageCount = (message.usageCount || 0) + 1;

      // 如果使用成功，更新成功率相关字段
      if (success) {
        message.successUsageCount = (message.successUsageCount || 0) + 1;
      }

      await this.messageRepository.save(message);

      this.logger.log(`记录话术使用: 消息ID=${messageId}, 用户ID=${userId}, 成功=${success}`);

      return {
        message: '使用记录成功',
        usageCount: message.usageCount,
        successUsageCount: message.successUsageCount,
        successRate: message.usageCount > 0
          ? Math.round((message.successUsageCount / message.usageCount) * 100)
          : 0
      };

    } catch (error) {
      this.logger.error(`记录话术使用失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}