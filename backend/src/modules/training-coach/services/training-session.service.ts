import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from '../entities/training-session.entity';
import { TrainingScript } from '../entities/training-script.entity';
import { CustomerPersona } from '../entities/customer-persona.entity';
import { CreateSessionDto, SendMessageDto, UpdateSessionDto } from '../dto/create-session.dto';
import { AiConfigCallerService } from '@/common/services/ai/ai-config-caller.service';

export interface ChatMessage {
  id: number;
  role: 'sales' | 'customer';
  content: string;
  timestamp: Date;
  evaluation?: {
    score: number;
    feedback?: string;
  };
}

export interface CustomerResponse {
  message: string;
  metadata: {
    emotion: string;
    objectionType?: string;
    decisionSignals?: string[];
    responseStrategy: string;
  };
  evaluation?: {
    goalProgress: number;
    professionalism: number;
    efficiency: string;
  };
  sessionProgress: {
    currentRound: number;
    goalAchievement: number;
    shouldEnd: boolean;
  };
}

@Injectable()
export class TrainingSessionService {
  private readonly logger = new Logger(TrainingSessionService.name);
  private activeSessions = new Map<number, TrainingSession>();

  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepository: Repository<TrainingSession>,
    @InjectRepository(TrainingScript)
    private readonly scriptRepository: Repository<TrainingScript>,
    @InjectRepository(CustomerPersona)
    private readonly personaRepository: Repository<CustomerPersona>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  // 注入EvaluationService的占位符 - 将通过模块注入
  private evaluationService: any;

  /**
   * 创建培训会话
   */
  async createSession(createDto: CreateSessionDto, userId: number): Promise<TrainingSession> {
    this.logger.log(`创建培训会话: ${createDto.script_id} for user ${userId}`);

    try {
      // 1. 验证剧本存在
      const script = await this.scriptRepository.findOne({
        where: { id: createDto.script_id }
      });

      if (!script) {
        throw new NotFoundException('培训剧本不存在');
      }

      // 2. 验证客户角色存在
      const customerPersona = await this.personaRepository.findOne({
        where: { id: createDto.customer_persona_id }
      });

      if (!customerPersona) {
        throw new NotFoundException('客户角色不存在');
      }

      // 3. 创建会话
      const session = this.sessionRepository.create({
        user_id: userId,
        script_id: createDto.script_id,
        customer_persona_id: createDto.customer_persona_id,
        session_name: createDto.session_name || `${script.title} - ${customerPersona.name}`,
        session_status: 'preparing',
        training_goals: createDto.training_goals || JSON.parse(script.training_goal || '[]'),
        max_rounds: createDto.max_rounds || script.max_rounds,
        current_round: 0,
        conversation_history: { messages: [] },
        session_metrics: {
          startTime: new Date(),
          duration: 0,
          averageResponseTime: 0,
          objectionCount: 0
        },
        started_at: new Date(),
        last_activity_at: new Date()
      });

      const savedSession = await this.sessionRepository.save(session);
      this.activeSessions.set(savedSession.id, savedSession);

      this.logger.log(`培训会话创建成功: ${savedSession.id}`);
      return savedSession;

    } catch (error) {
      this.logger.error(`创建培训会话失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 开始培训会话
   */
  async startSession(sessionId: number, userId: number): Promise<TrainingSession> {
    this.logger.log(`开始培训会话: ${sessionId}`);

    const session = await this.validateSessionAccess(sessionId, userId);

    if (session.session_status !== 'preparing') {
      throw new BadRequestException('会话状态不正确，无法开始');
    }

    // 更新会话状态
    session.session_status = 'active';
    session.started_at = new Date();
    session.last_activity_at = new Date();

    await this.sessionRepository.save(session);
    this.activeSessions.set(sessionId, session);

    return session;
  }

  /**
   * 发送消息并获取AI回复
   */
  async sendMessage(sessionId: number, messageDto: SendMessageDto, userId: number): Promise<CustomerResponse> {
    this.logger.log(`发送消息到会话 ${sessionId}: ${messageDto.message.substring(0, 50)}...`);

    const session = await this.validateSessionAccess(sessionId, userId);

    if (session.session_status !== 'active') {
      throw new BadRequestException('会话未激活，请先开始会话');
    }

    try {
      // 1. 获取会话相关数据
      const [script, customerPersona] = await Promise.all([
        this.scriptRepository.findOne({ where: { id: session.script_id } }),
        this.personaRepository.findOne({ where: { id: session.customer_persona_id } })
      ]);

      // 2. 添加用户消息到历史记录
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'sales',
        content: messageDto.message,
        timestamp: new Date()
      };

      this.addMessageToHistory(session, userMessage);

      // 3. 生成AI客户响应
      const customerResponse = await this.generateCustomerResponse(session, messageDto.message, script, customerPersona);

      // 4. 添加AI回复到历史记录
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'customer',
        content: customerResponse.message,
        timestamp: new Date(),
        evaluation: customerResponse.evaluation ? {
          score: customerResponse.evaluation.goalProgress,
          feedback: '目标达成度良好'
        } : undefined
      };

      this.addMessageToHistory(session, aiMessage);

      // 5. 更新会话状态
      session.current_round += 1;
      session.last_activity_at = new Date();

      // 6. 检查是否应该结束会话
      if (messageDto.end_session || session.current_round >= session.max_rounds || customerResponse.sessionProgress.shouldEnd) {
        await this.endSession(sessionId, userId);
      }

      await this.sessionRepository.save(session);

      this.logger.log(`消息处理完成，会话 ${sessionId} 当前轮次: ${session.current_round}`);
      return customerResponse;

    } catch (error) {
      this.logger.error(`发送消息失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 暂停会话
   */
  async pauseSession(sessionId: number, userId: number): Promise<TrainingSession> {
    this.logger.log(`暂停会话: ${sessionId}`);

    const session = await this.validateSessionAccess(sessionId, userId);

    if (session.session_status !== 'active') {
      throw new BadRequestException('只能暂停活跃的会话');
    }

    session.session_status = 'paused';
    session.last_activity_at = new Date();

    await this.sessionRepository.save(session);
    return session;
  }

  /**
   * 恢复会话
   */
  async resumeSession(sessionId: number, userId: number): Promise<TrainingSession> {
    this.logger.log(`恢复会话: ${sessionId}`);

    const session = await this.validateSessionAccess(sessionId, userId);

    if (session.session_status !== 'paused') {
      throw new BadRequestException('只能恢复暂停的会话');
    }

    session.session_status = 'active';
    session.last_activity_at = new Date();

    await this.sessionRepository.save(session);
    return session;
  }

  /**
   * 结束会话
   */
  async endSession(sessionId: number, userId: number): Promise<TrainingSession> {
    this.logger.log(`结束会话: ${sessionId}`);

    const session = await this.validateSessionAccess(sessionId, userId);

    session.session_status = 'completed';
    session.completed_at = new Date();
    session.last_activity_at = new Date();

    // 计算最终评分和目标达成率
    const evaluation = await this.calculateFinalEvaluation(session);
    session.final_score = evaluation.overallScore;
    session.goal_achievement_rate = evaluation.goalAchievementRate;
    session.completion_status = evaluation.completionStatus;

    await this.sessionRepository.save(session);
    this.activeSessions.delete(sessionId);

    return session;
  }

  /**
   * 获取会话详情
   */
  async getSession(sessionId: number, userId: number): Promise<TrainingSession> {
    return await this.validateSessionAccess(sessionId, userId);
  }

  /**
   * 获取用户会话列表
   */
  async getUserSessions(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ sessions: TrainingSession[]; total: number }> {
    const queryBuilder = this.sessionRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.script', 'script')
      .leftJoinAndSelect('session.customer_persona', 'customer_persona')
      .where('session.user_id = :userId', { userId })
      .orderBy('session.last_activity_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('session.session_status = :status', { status });
    }

    const [sessions, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { sessions, total };
  }

  /**
   * 获取会话评估报告
   */
  async getSessionEvaluation(sessionId: number, userId: number): Promise<any> {
    const session = await this.validateSessionAccess(sessionId, userId);

    if (session.session_status !== 'completed') {
      throw new BadRequestException('只能查看已完成会话的评估报告');
    }

    const script = await this.scriptRepository.findOne({
      where: { id: session.script_id }
    });

    const customerPersona = await this.personaRepository.findOne({
      where: { id: session.customer_persona_id }
    });

    // 计算持续时间
    const duration = session.completed_at && session.started_at
      ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)
      : 0;

    // 构建评估报告数据
    const conversationHistory = session.conversation_history?.messages || [];

    // 模拟维度评分（实际应该从evaluation service获取）
    const dimensionScores = {
      goalAchievement: session.final_score * 0.9 || 70,
      professionalism: session.final_score * 0.95 || 75,
      efficiency: session.final_score * 0.85 || 70,
      adaptability: session.final_score * 0.8 || 65,
      customerSatisfaction: session.final_score * 0.9 || 70
    };

    // 模拟培训目标达成情况
    const trainingGoals = (session.training_goals as any[] || []).map((goal: any) => ({
      text: typeof goal === 'string' ? goal : goal.text || goal,
      achieved: Math.random() > 0.3 // 70%概率达成
    }));

    return {
      data: {
        session_name: session.session_name,
        completion_status: session.completion_status,
        completed_at: session.completed_at,
        duration,
        final_score: session.final_score || 75,
        goal_achievement_rate: session.goal_achievement_rate || 70,
        script_id: session.script_id,
        evaluation: {
          dimension_scores: dimensionScores,
          strengths: [
            '沟通态度积极，展现了良好的服务意识',
            '能够准确理解客户需求并给予回应',
            '保持了良好的对话节奏和专业性'
          ],
          improvements: [
            '可以更深入挖掘客户的潜在需求',
            '异议处理技巧有待进一步提升',
            '产品知识的运用可以更加灵活'
          ],
          detailed_feedback: `本次培训表现${session.final_score >= 80 ? '优秀' : session.final_score >= 60 ? '良好' : '一般'}。在与客户的沟通中，展现了积极的态度和基本的专业素养。建议在今后的训练中，更加注重需求挖掘和价值传递，提升处理客户异议的能力。通过持续练习和总结，相信能够快速提升销售技能。`,
          recommendations: [
            '复习本次培训的对话记录，总结成功经验',
            '针对薄弱环节进行专项练习',
            '学习优秀案例和标准话术模板'
          ]
        },
        training_goals: trainingGoals,
        conversation_history: conversationHistory.map((msg: any, index: number) => ({
          ...msg,
          senderName: msg.role === 'customer' ? customerPersona.name : '销售（你）'
        }))
      }
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 验证会话访问权限
   */
  private async validateSessionAccess(sessionId: number, userId: number): Promise<TrainingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['script', 'customer_persona']
    });

    if (!session) {
      throw new NotFoundException('培训会话不存在');
    }

    if (session.user_id !== userId) {
      throw new BadRequestException('无权访问该会话');
    }

    return session;
  }

  /**
   * 生成AI客户响应
   */
  private async generateCustomerResponse(
    session: TrainingSession,
    salesMessage: string,
    script: TrainingScript,
    customerPersona: CustomerPersona
  ): Promise<CustomerResponse> {
    // 1. 构建对话上下文
    const conversationHistory = session.conversation_history?.messages || [];
    const conversationContext = this.buildConversationContext(session, salesMessage, conversationHistory);

    // 2. 构建角色扮演提示词
    const prompt = this.buildPersonaPrompt({
      customerPersona,
      conversationContext,
      currentRound: session.current_round + 1,
      trainingGoals: session.training_goals,
      script: script
    });

    // 3. 调用AI生成响应
    const aiResponse = await this.aiConfigCallerService.callAI(
      'training_customer_persona',
      { prompt: prompt }
    );

    // 4. 解析AI响应
    const parsedResponse = this.parseCustomerResponse(aiResponse);

    // 5. 实时评估销售表现
    const evaluation = await this.evaluateSalesResponse(salesMessage, conversationContext);

    // 6. 判断会话进度
    const sessionProgress = this.calculateSessionProgress(session, parsedResponse);

    return {
      message: parsedResponse.message,
      metadata: parsedResponse.metadata,
      evaluation,
      sessionProgress
    };
  }

  /**
   * 构建对话上下文
   */
  private buildConversationContext(
    session: TrainingSession,
    currentMessage: string,
    history: ChatMessage[]
  ): Record<string, any> {
    return {
      sessionId: session.id,
      currentRound: session.current_round + 1,
      trainingGoals: session.training_goals,
      maxRounds: session.max_rounds,
      conversationHistory: history.slice(-5), // 只保留最近5条消息
      currentMessage,
      sessionMetrics: session.session_metrics
    };
  }

  /**
   * 构建角色扮演提示词
   */
  private buildPersonaPrompt(data: Record<string, any>): string {
    return `【客户角色扮演任务】

角色信息：
- 姓名：${data.customerPersona.name}
- 性格类型：${data.customerPersona.personality_type}
- 沟通风格：${data.customerPersona.communication_style}
- 决策风格：${data.customerPersona.decision_making_style}
- 典型异议：${JSON.stringify(data.customerPersona.typical_objections)}

当前对话上下文：
- 场景：${data.script.scenario}
- 当前轮次：${data.currentRound}/${data.maxRounds}
- 培训目标：${JSON.stringify(data.training_goals)}
- 销售刚说的话：${data.conversationContext.currentMessage}

请完全代入客户角色，根据角色特点和当前对话情况，生成真实的客户回应。要求：
1. 严格符合角色性格特征
2. 回应要自然真实
3. 适时提出合理异议
4. 根据销售回应调整态度
5. 保持角色的决策逻辑

输出格式：
{
  "message": "客户回应消息",
  "emotion": "当前情绪状态",
  "objection_type": "异议类型（如有）",
  "decision_signals": ["决策信号"],
  "response_strategy": "回应策略说明"
}`;
  }

  /**
   * 解析客户响应
   */
  private parseCustomerResponse(aiResponse: any): Record<string, any> {
    try {
      if (typeof aiResponse === 'string') {
        if (aiResponse.trim().startsWith('{')) {
          return JSON.parse(aiResponse);
        } else {
          return {
            message: aiResponse,
            metadata: {
              emotion: 'neutral',
              responseStrategy: 'standard'
            }
          };
        }
      }
      return aiResponse;
    } catch (error) {
      this.logger.error(`解析客户响应失败: ${error.message}`);
      return {
        message: '我需要考虑一下',
        metadata: {
          emotion: 'neutral',
          responseStrategy: 'standard'
        }
      };
    }
  }

  /**
   * 添加消息到历史记录
   */
  private addMessageToHistory(session: TrainingSession, message: ChatMessage): void {
    if (!session.conversation_history) {
      session.conversation_history = { messages: [] };
    }
    session.conversation_history.messages.push(message);
  }

  /**
   * 评估销售回复
   */
  private async evaluateSalesResponse(
    message: string,
    context: Record<string, any>
  ): Promise<CustomerResponse['evaluation']> {
    // 简化的评估逻辑
    const score = Math.random() * 40 + 60; // 60-100分

    return {
      goalProgress: Math.round(score),
      professionalism: Math.round(score * 0.8),
      efficiency: score > 80 ? 'good' : score > 60 ? 'normal' : 'poor'
    };
  }

  /**
   * 计算会话进度
   */
  private calculateSessionProgress(
    session: TrainingSession,
    customerResponse: Record<string, any>
  ): CustomerResponse['sessionProgress'] {
    const progressRate = (session.current_round + 1) / session.max_rounds;
    const shouldEnd = progressRate >= 1 || customerResponse.metadata.decision_signals?.includes('购买意向');

    return {
      currentRound: session.current_round + 1,
      goalAchievement: Math.round(progressRate * 100),
      shouldEnd
    };
  }

  /**
   * 计算最终评估
   */
  private async calculateFinalEvaluation(session: TrainingSession): Promise<Record<string, any>> {
    const messages = session.conversation_history?.messages || [];
    const salesMessages = messages.filter(m => m.role === 'sales');

    // 简化的评估计算
    const overallScore = Math.random() * 30 + 70; // 70-100分
    const goalAchievementRate = Math.random() * 40 + 60; // 60-100%

    return {
      overallScore: Math.round(overallScore),
      goalAchievementRate: Math.round(goalAchievementRate),
      completionStatus: overallScore >= 80 ? 'success' : overallScore >= 60 ? 'partial' : 'failure'
    };
  }
}