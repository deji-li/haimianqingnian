import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiChatRecord } from './entities/ai-chat-record.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { KnowledgeIntegrationService } from '../enterprise-knowledge/knowledge-integration.service';
import { FeedbackKnowledgeService } from '../enterprise-knowledge/feedback-knowledge.service';
import { AiAssistantChatDto, AiAssistantFeedbackDto } from './dto/ai-assistant.dto';

/**
 * AI助手服务（实时对话）
 * 集成企业知识库，优先使用知识库回答问题
 */
@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    @InjectRepository(AiChatRecord)
    private readonly aiChatRecordRepository: Repository<AiChatRecord>,
    private readonly deepseekAnalysisService: DeepseekAnalysisService,
    private readonly knowledgeIntegrationService: KnowledgeIntegrationService,
    private readonly feedbackKnowledgeService: FeedbackKnowledgeService,
  ) {}

  /**
   * AI助手对话（知识库优先）
   */
  async chat(chatDto: AiAssistantChatDto, userId: number) {
    this.logger.log(`AI助手对话 - 用户: ${userId}, 问题: ${chatDto.question}`);

    try {
      // 1. 如果启用知识库优先，先查询知识库
      if (chatDto.useKnowledge !== false) {
        const knowledgeResult = await this.knowledgeIntegrationService.queryKnowledgeForAiChat({
          userQuestion: chatDto.question,
          conversationContext: chatDto.conversationContext,
          customerId: chatDto.customerId,
          userId,
        });

        // 2. 根据AI决策处理
        switch (knowledgeResult.decision) {
          case 'direct':
            // 直接使用知识库答案
            this.logger.log(`使用知识库直接回答 - 知识ID: ${knowledgeResult.knowledge.id}`);

            // 保存对话记录
            const directConversation = await this.saveConversation({
              userId,
              customerId: chatDto.customerId,
              userQuestion: chatDto.question,
              aiAnswer: knowledgeResult.suggestedAnswer,
              answerSource: 'knowledge_direct',
              knowledgeId: knowledgeResult.knowledge.id,
              matchScore: 90,
            });

            return {
              answer: knowledgeResult.suggestedAnswer,
              source: 'knowledge_base',
              knowledge: {
                id: knowledgeResult.knowledge.id,
                title: knowledgeResult.knowledge.title,
              },
              conversationId: directConversation.id,
              canFeedback: true, // 可以反馈
            };

          case 'hybrid':
            // 混合模式：知识库+AI整合
            this.logger.log(`使用混合模式 - 知识库参考 + AI整合`);

            // 调用DeepSeek，提供知识库参考内容
            const hybridAnswer = await this.generateHybridAnswer(
              chatDto.question,
              knowledgeResult.referenceContent,
              chatDto.conversationContext,
            );

            // 保存对话记录
            const hybridConversation = await this.saveConversation({
              userId,
              customerId: chatDto.customerId,
              userQuestion: chatDto.question,
              aiAnswer: hybridAnswer,
              answerSource: 'knowledge_hybrid',
              knowledgeId: knowledgeResult.knowledge[0]?.id,
              matchScore: 70,
              context: {
                usedKnowledge: knowledgeResult.knowledge.map((k: any) => ({
                  id: k.id,
                  title: k.title,
                })),
              },
            });

            return {
              answer: hybridAnswer,
              source: 'hybrid',
              knowledge: knowledgeResult.knowledge,
              conversationId: hybridConversation.id,
              canFeedback: true,
            };

          case 'generate':
          default:
            // 完全AI生成
            this.logger.log('知识库无相关内容，使用纯AI生成');
            break; // 继续走下面的纯AI生成逻辑
        }
      }

      // 3. 纯AI生成（知识库无法提供或未启用知识库）
      const aiAnswer = await this.generatePureAiAnswer(
        chatDto.question,
        chatDto.conversationContext,
      );

      // 保存对话记录
      const aiConversation = await this.saveConversation({
        userId,
        customerId: chatDto.customerId,
        userQuestion: chatDto.question,
        aiAnswer,
        answerSource: 'ai_generate',
        matchScore: null,
      });

      return {
        answer: aiAnswer,
        source: 'ai_generate',
        knowledge: null,
        conversationId: aiConversation.id,
        canFeedback: false, // 纯AI生成暂不支持反馈
      };
    } catch (error) {
      this.logger.error(`AI助手对话失败: ${error.message}`, error.stack);

      // 降级：返回默认回答
      return {
        answer: '抱歉，我遇到了一些技术问题，请稍后再试或联系客服。',
        source: 'error',
        knowledge: null,
        conversationId: null,
        canFeedback: false,
      };
    }
  }

  /**
   * 生成混合答案（知识库参考 + AI整合）
   */
  private async generateHybridAnswer(
    question: string,
    referenceContent: string,
    conversationContext?: any,
  ): Promise<string> {
    try {
      // 构建提示词
      const prompt = `请基于以下知识库内容回答用户的问题，你可以根据需要进行整合、扩展和优化，使答案更加完善。

【知识库参考内容】
${referenceContent}

【用户问题】
${question}

${conversationContext ? `【对话上下文】\n${JSON.stringify(conversationContext)}\n` : ''}

要求：
1. 优先使用知识库中的准确信息
2. 可以补充知识库中没有但相关的内容
3. 语言要自然流畅，符合对话场景
4. 如果知识库内容不完全匹配，可以适当扩展
`;

      // TODO: DeepseekAnalysisService was deleted - temporarily disabled
      // const result = await this.deepseekAnalysisService.chat(prompt);
      // return result.answer || result.content || '抱歉，我无法生成合适的回答。';

      this.logger.warn('generateHybridAnswer temporarily disabled - DeepseekAnalysisService was deleted');
      return referenceContent; // Return reference content as fallback
    } catch (error) {
      this.logger.error(`生成混合答案失败: ${error.message}`);
      // 降级：直接返回知识库参考内容
      return referenceContent;
    }
  }

  /**
   * 生成纯AI答案
   */
  private async generatePureAiAnswer(
    question: string,
    conversationContext?: any,
  ): Promise<string> {
    try {
      // TODO: DeepseekAnalysisService was deleted - temporarily disabled
      // const prompt = `${question}${conversationContext ? `\n\n对话上下文：${JSON.stringify(conversationContext)}` : ''}`;
      // const result = await this.deepseekAnalysisService.chat(prompt);
      // return result.answer || result.content || '抱歉，我暂时无法回答这个问题。';

      this.logger.warn('generatePureAiAnswer temporarily disabled - DeepseekAnalysisService was deleted');
      return '抱歉，AI服务暂时不可用，请联系管理员。';
    } catch (error) {
      this.logger.error(`生成AI答案失败: ${error.message}`);
      return '抱歉，我遇到了一些技术问题，请稍后再试。';
    }
  }

  /**
   * 保存对话记录
   */
  private async saveConversation(data: {
    userId: number;
    customerId?: number;
    userQuestion: string;
    aiAnswer: string;
    answerSource: string;
    knowledgeId?: number;
    matchScore?: number;
    context?: any;
  }) {
    try {
      // TODO: AiChatRecord entity doesn't have 'role', 'content', 'context' fields
      // It was designed for chat screenshots with OCR, not for conversation storage
      // Need to either: 1) Create a new entity for AI conversations, or
      // 2) Store conversation data in aiAnalysisResult JSON field
      const conversation = this.aiChatRecordRepository.create({
        userId: data.userId,
        customerId: data.customerId,
        // role: 'assistant', // REMOVED: Field doesn't exist
        // content: data.userQuestion, // REMOVED: Field doesn't exist - using rawText instead
        rawText: data.userQuestion, // Using rawText for user question
        ocrText: data.aiAnswer, // AI answer stored in ocrText
        chatDate: new Date(),
        uploadType: 'text',
        ocrStatus: '已完成', // Changed from '无需OCR'
        analysisStatus: '已完成',
        aiAnalysisResult: { // Using aiAnalysisResult instead of 'context'
          answerSource: data.answerSource,
          knowledgeId: data.knowledgeId,
          matchScore: data.matchScore,
          ...data.context,
        },
      });

      return await this.aiChatRecordRepository.save(conversation);
    } catch (error) {
      this.logger.error(`保存对话记录失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 提交反馈（集成到知识库反馈系统）
   */
  async submitFeedback(feedbackDto: AiAssistantFeedbackDto, userId: number) {
    this.logger.log(`提交AI助手反馈 - 对话ID: ${feedbackDto.conversationId}`);

    try {
      // 1. 查找对话记录
      const conversation = await this.aiChatRecordRepository.findOne({
        where: { id: feedbackDto.conversationId },
      });

      if (!conversation) {
        return {
          success: false,
          message: '对话记录不存在',
        };
      }

      // 2. 如果使用了知识库，提交到知识库反馈系统
      if (feedbackDto.knowledgeId && feedbackDto.satisfied === false) {
        await this.feedbackKnowledgeService.submitFeedback(
          {
            knowledgeId: feedbackDto.knowledgeId,
            feedbackScene: 'ai_chat',
            customerId: conversation.customerId,
            userQuestion: conversation.rawText || '问题未记录', // Required by DTO - using rawText
            knowledgeAnswer: conversation.ocrText || '答案未记录', // Required by DTO - using ocrText
            feedbackReason: feedbackDto.feedbackReason,
            conversationContext: conversation.aiAnalysisResult, // Using aiAnalysisResult instead of context
          },
          userId,
        );

        return {
          success: true,
          message: '反馈已提交到知识库系统',
        };
      }

      // 3. 纯AI生成的反馈（暂时只记录，不处理）
      this.logger.log(`纯AI生成反馈 - 满意度: ${feedbackDto.satisfied}`);

      return {
        success: true,
        message: '感谢您的反馈',
      };
    } catch (error) {
      this.logger.error(`提交反馈失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: '反馈提交失败',
      };
    }
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(params: {
    userId?: number;
    customerId?: number;
    limit?: number;
  }) {
    const queryBuilder = this.aiChatRecordRepository.createQueryBuilder('conv');

    // queryBuilder.where('conv.role = :role', { role: 'assistant' }); // REMOVED: Field 'role' doesn't exist in AiChatRecord
    queryBuilder.where('conv.uploadType = :uploadType', { uploadType: 'text' }); // Filter by text type instead

    if (params.userId) {
      queryBuilder.andWhere('conv.userId = :userId', { userId: params.userId });
    }

    if (params.customerId) {
      queryBuilder.andWhere('conv.customerId = :customerId', { customerId: params.customerId });
    }

    const conversations = await queryBuilder
      .orderBy('conv.chatDate', 'DESC')
      .take(params.limit || 20)
      .getMany();

    return conversations.map((conv) => ({
      id: conv.id,
      question: conv.rawText, // Using rawText instead of content
      answer: conv.ocrText,
      answerSource: conv.aiAnalysisResult?.answerSource, // Using aiAnalysisResult instead of context
      knowledgeId: conv.aiAnalysisResult?.knowledgeId,
      chatDate: conv.chatDate,
    }));
  }
}
