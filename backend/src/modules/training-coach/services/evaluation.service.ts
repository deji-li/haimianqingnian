import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from '../entities/training-session.entity';
import { TrainingScript } from '../entities/training-script.entity';
import { AiConfigCallerService } from '@/common/services/ai/ai-config-caller.service';
import { ChatMessage } from './training-session.service';

export interface EvaluationResult {
  overallScore: number;
  dimensionScores: {
    goalAchievement: number;
    professionalism: number;
    efficiency: number;
    adaptability: number;
    customerSatisfaction: number;
  };
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  recommendations: string[];
  goalAchievementRate: number;
  completionStatus: 'success' | 'partial' | 'failure';
}

export interface RealTimeEvaluation {
  currentScore: number;
  goalProgress: number;
  professionalism: number;
  efficiency: string;
  suggestions: string[];
}

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepository: Repository<TrainingSession>,
    @InjectRepository(TrainingScript)
    private readonly scriptRepository: Repository<TrainingScript>,
    private readonly aiConfigCallerService: AiConfigCallerService,
  ) {}

  /**
   * 实时评估销售表现
   */
  async evaluateRealTime(
    session: TrainingSession,
    salesMessage: string,
    conversationHistory: ChatMessage[]
  ): Promise<RealTimeEvaluation> {
    this.logger.log(`实时评估会话 ${session.id} 的销售表现`);

    try {
      // 1. 分析消息质量
      const messageQuality = await this.analyzeMessageQuality(salesMessage);

      // 2. 分析对话进度
      const progressAnalysis = this.analyzeProgress(session, conversationHistory);

      // 3. 生成实时建议
      const suggestions = await this.generateRealTimeSuggestions(
        session,
        salesMessage,
        conversationHistory,
        messageQuality
      );

      // 4. 计算实时评分
      const currentScore = this.calculateRealtimeScore(
        messageQuality,
        progressAnalysis,
        session
      );

      return {
        currentScore: Math.round(currentScore),
        goalProgress: progressAnalysis.goalProgress,
        professionalism: messageQuality.professionalism,
        efficiency: progressAnalysis.efficiency,
        suggestions
      };
    } catch (error) {
      this.logger.error(`实时评估失败: ${error.message}`, error.stack);
      // 返回默认评估
      return {
        currentScore: 75,
        goalProgress: 50,
        professionalism: 70,
        efficiency: 'normal',
        suggestions: ['继续保持良好沟通']
      };
    }
  }

  /**
   * 最终综合评估
   */
  async evaluateFinal(session: TrainingSession): Promise<EvaluationResult> {
    this.logger.log(`最终评估会话 ${session.id}`);

    try {
      const script = await this.scriptRepository.findOne({
        where: { id: session.script_id }
      });

      const conversationHistory = session.conversation_history?.messages || [];

      // 1. 构建评估提示词
      const evaluationPrompt = this.buildEvaluationPrompt(
        session,
        script,
        conversationHistory
      );

      // 2. 调用AI进行综合评估
      const aiEvaluation = await this.aiConfigCallerService.callAI(
        'training_evaluation',
        { prompt: evaluationPrompt }
      );

      // 3. 解析AI评估结果
      const parsedEvaluation = this.parseAIEvaluation(aiEvaluation);

      // 4. 计算目标达成率
      const goalAchievementRate = this.calculateGoalAchievement(
        session,
        conversationHistory
      );

      // 5. 确定完成状态
      const completionStatus = this.determineCompletionStatus(
        parsedEvaluation.overallScore,
        goalAchievementRate
      );

      return {
        overallScore: parsedEvaluation.overallScore || 75,
        dimensionScores: {
          goalAchievement: parsedEvaluation.dimensionScores?.goalAchievement || 70,
          professionalism: parsedEvaluation.dimensionScores?.professionalism || 70,
          efficiency: parsedEvaluation.dimensionScores?.efficiency || 70,
          adaptability: parsedEvaluation.dimensionScores?.adaptability || 70,
          customerSatisfaction: parsedEvaluation.dimensionScores?.customerSatisfaction || 70
        },
        strengths: parsedEvaluation.strengths || [],
        improvements: parsedEvaluation.improvements || [],
        detailedFeedback: parsedEvaluation.detailedFeedback || '',
        recommendations: parsedEvaluation.recommendations || [],
        goalAchievementRate,
        completionStatus
      };
    } catch (error) {
      this.logger.error(`最终评估失败: ${error.message}`, error.stack);
      // 返回默认评估
      return this.getDefaultEvaluation(session);
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 分析消息质量
   */
  private async analyzeMessageQuality(message: string): Promise<Record<string, any>> {
    // 消息长度分析
    const length = message.length;
    const lengthScore = this.calculateLengthScore(length);

    // 关键词分析
    const keywordScore = this.analyzeKeywords(message);

    // 专业术语分析
    const professionalScore = this.analyzeProfessionalism(message);

    // 情感色彩分析
    const emotionScore = this.analyzeEmotion(message);

    return {
      length,
      lengthScore,
      keywordScore,
      professionalism: Math.round((professionalScore + keywordScore) / 2),
      emotionScore,
      overall: Math.round((lengthScore + keywordScore + professionalScore + emotionScore) / 4)
    };
  }

  /**
   * 计算消息长度评分
   */
  private calculateLengthScore(length: number): number {
    if (length < 10) return 40;
    if (length < 30) return 60;
    if (length < 100) return 85;
    if (length < 200) return 90;
    return 85; // 太长也不好
  }

  /**
   * 分析关键词
   */
  private analyzeKeywords(message: string): number {
    const positiveKeywords = ['您', '您好', '请问', '了解', '帮助', '优势', '价值', '收益'];
    const negativeKeywords = ['你', '啥', '咋样', '行不', '算了'];

    let score = 70;
    positiveKeywords.forEach(keyword => {
      if (message.includes(keyword)) score += 3;
    });
    negativeKeywords.forEach(keyword => {
      if (message.includes(keyword)) score -= 5;
    });

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 分析专业性
   */
  private analyzeProfessionalism(message: string): number {
    const professionalTerms = [
      '方案', '产品', '服务', '客户', '需求', '解决', '提供',
      '投资', '收益', 'ROI', '案例', '数据', '效果'
    ];

    let score = 60;
    professionalTerms.forEach(term => {
      if (message.includes(term)) score += 4;
    });

    return Math.min(100, score);
  }

  /**
   * 分析情感色彩
   */
  private analyzeEmotion(message: string): number {
    const positiveEmotions = ['感谢', '荣幸', '很高兴', '理解', '支持'];
    const negativeEmotions = ['不行', '不可能', '别', '不要'];

    let score = 75;
    positiveEmotions.forEach(emotion => {
      if (message.includes(emotion)) score += 5;
    });
    negativeEmotions.forEach(emotion => {
      if (message.includes(emotion)) score -= 8;
    });

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 分析对话进度
   */
  private analyzeProgress(
    session: TrainingSession,
    conversationHistory: ChatMessage[]
  ): Record<string, any> {
    const progressRate = session.current_round / session.max_rounds;
    const salesMessages = conversationHistory.filter(m => m.role === 'sales');

    // 计算平均回复长度
    const avgLength = salesMessages.length > 0
      ? salesMessages.reduce((sum, m) => sum + m.content.length, 0) / salesMessages.length
      : 0;

    // 判断效率
    let efficiency = 'normal';
    if (progressRate > 0.8 && session.current_round <= 3) efficiency = 'excellent';
    else if (progressRate > 0.6 && session.current_round <= 5) efficiency = 'good';
    else if (progressRate < 0.3 && session.current_round >= 5) efficiency = 'poor';

    return {
      goalProgress: Math.round(progressRate * 100),
      efficiency,
      avgMessageLength: Math.round(avgLength),
      messageCount: salesMessages.length
    };
  }

  /**
   * 生成实时建议
   */
  private async generateRealTimeSuggestions(
    session: TrainingSession,
    salesMessage: string,
    conversationHistory: ChatMessage[],
    messageQuality: Record<string, any>
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // 基于消息质量的建议
    if (messageQuality.length < 20) {
      suggestions.push('回复太简短，建议提供更多细节和价值信息');
    }

    if (messageQuality.professionalism < 60) {
      suggestions.push('可以使用更专业的术语来展示专业度');
    }

    if (messageQuality.emotionScore < 60) {
      suggestions.push('保持积极的沟通态度，展现真诚和热情');
    }

    // 基于对话轮次的建议
    if (session.current_round === 0) {
      suggestions.push('开场阶段：建立信任关系是关键');
    } else if (session.current_round === 1) {
      suggestions.push('需求挖掘阶段：多提问，了解客户真实需求');
    } else if (session.current_round >= session.max_rounds - 2) {
      suggestions.push('即将结束：尝试推进到下一步行动');
    }

    // 基于培训目标的建议
    const trainingGoals = session.training_goals as any[];
    if (trainingGoals && trainingGoals.length > 0) {
      suggestions.push(`关注培训目标：${trainingGoals[0]}`);
    }

    return suggestions.slice(0, 3); // 最多返回3条建议
  }

  /**
   * 计算实时评分
   */
  private calculateRealtimeScore(
    messageQuality: Record<string, any>,
    progressAnalysis: Record<string, any>,
    session: TrainingSession
  ): number {
    const qualityScore = messageQuality.overall * 0.4;
    const progressScore = progressAnalysis.goalProgress * 0.3;
    const efficiencyScore = this.getEfficiencyScore(progressAnalysis.efficiency) * 0.3;

    return qualityScore + progressScore + efficiencyScore;
  }

  /**
   * 获取效率评分
   */
  private getEfficiencyScore(efficiency: string): number {
    const scoreMap: Record<string, number> = {
      'excellent': 95,
      'good': 85,
      'normal': 75,
      'poor': 50
    };
    return scoreMap[efficiency] || 75;
  }

  /**
   * 构建评估提示词
   */
  private buildEvaluationPrompt(
    session: TrainingSession,
    script: TrainingScript,
    conversationHistory: ChatMessage[]
  ): string {
    return `【培训评估任务】

会话ID：${session.id}
培训剧本：${script.title}
场景类型：${script.scenario}
培训目标：${JSON.stringify(session.training_goals)}

对话历史：
${conversationHistory.map((msg, index) =>
  `${index + 1}. [${msg.role === 'sales' ? '销售' : '客户'}] ${msg.content}`
).join('\n')}

请从以下维度全面评估销售表现：
1. 目标达成度 (40%) - 是否达成培训目标
2. 专业性 (25%) - 话术专业度和产品知识掌握
3. 效率 (15%) - 沟通效率和时间管理
4. 应变能力 (10%) - 处理异议和突发情况
5. 客户体验 (10%) - 客户感受和满意度

输出格式（JSON）：
{
  "overallScore": 总体评分(0-100),
  "dimensionScores": {
    "goalAchievement": 目标达成度评分,
    "professionalism": 专业性评分,
    "efficiency": 效率评分,
    "adaptability": 应变能力评分,
    "customerSatisfaction": 客户体验评分
  },
  "strengths": ["优势1", "优势2", "优势3"],
  "improvements": ["改进建议1", "改进建议2", "改进建议3"],
  "detailedFeedback": "详细反馈文字（200-300字）",
  "recommendations": ["推荐行动1", "推荐行动2", "推荐行动3"]
}`;
  }

  /**
   * 解析AI评估结果
   */
  private parseAIEvaluation(aiResponse: any): Partial<EvaluationResult> {
    try {
      let parsed: any;

      if (typeof aiResponse === 'string') {
        // 尝试提取JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法解析AI评估结果');
        }
      } else {
        parsed = aiResponse;
      }

      return {
        overallScore: parsed.overallScore || 75,
        dimensionScores: {
          goalAchievement: parsed.dimensionScores?.goalAchievement || 70,
          professionalism: parsed.dimensionScores?.professionalism || 70,
          efficiency: parsed.dimensionScores?.efficiency || 70,
          adaptability: parsed.dimensionScores?.adaptability || 70,
          customerSatisfaction: parsed.dimensionScores?.customerSatisfaction || 70
        },
        strengths: parsed.strengths || ['沟通态度良好'],
        improvements: parsed.improvements || ['继续提升专业能力'],
        detailedFeedback: parsed.detailedFeedback || '整体表现良好，继续努力。',
        recommendations: parsed.recommendations || ['多练习类似场景']
      };
    } catch (error) {
      this.logger.error(`解析AI评估结果失败: ${error.message}`);
      return this.getDefaultPartialEvaluation();
    }
  }

  /**
   * 计算目标达成率
   */
  private calculateGoalAchievement(
    session: TrainingSession,
    conversationHistory: ChatMessage[]
  ): number {
    const trainingGoals = session.training_goals as any[] || [];
    if (trainingGoals.length === 0) return 75;

    const progressRate = session.current_round / session.max_rounds;
    const messageQualityAvg = this.calculateAverageMessageQuality(conversationHistory);

    // 综合进度和质量计算达成率
    return Math.round((progressRate * 50) + (messageQualityAvg * 0.5));
  }

  /**
   * 计算平均消息质量
   */
  private calculateAverageMessageQuality(conversationHistory: ChatMessage[]): number {
    const salesMessages = conversationHistory.filter(m => m.role === 'sales');
    if (salesMessages.length === 0) return 75;

    const avgLength = salesMessages.reduce((sum, m) => sum + m.content.length, 0) / salesMessages.length;
    return Math.min(100, 50 + avgLength * 0.5);
  }

  /**
   * 确定完成状态
   */
  private determineCompletionStatus(
    overallScore: number,
    goalAchievementRate: number
  ): 'success' | 'partial' | 'failure' {
    if (overallScore >= 80 && goalAchievementRate >= 70) return 'success';
    if (overallScore >= 60 || goalAchievementRate >= 50) return 'partial';
    return 'failure';
  }

  /**
   * 获取默认评估结果
   */
  private getDefaultEvaluation(session: TrainingSession): EvaluationResult {
    const progressRate = session.current_round / session.max_rounds;
    const overallScore = 70 + progressRate * 15;

    return {
      overallScore: Math.round(overallScore),
      dimensionScores: {
        goalAchievement: 70,
        professionalism: 75,
        efficiency: 70,
        adaptability: 65,
        customerSatisfaction: 70
      },
      strengths: [
        '态度积极，沟通意愿强',
        '保持了良好的对话节奏'
      ],
      improvements: [
        '可以更深入挖掘客户需求',
        '专业知识储备有待提升',
        '异议处理技巧需要加强'
      ],
      detailedFeedback: '整体表现良好，基本达成了培训目标。在沟通中展现了积极的态度和良好的服务意识。建议在未来的训练中，更加注重需求挖掘和专业知识的运用，提升异议处理能力。',
      recommendations: [
        '多学习成功案例和话术模板',
        '加强产品知识和行业知识储备',
        '练习常见异议的应对策略'
      ],
      goalAchievementRate: Math.round(progressRate * 100),
      completionStatus: overallScore >= 80 ? 'success' : overallScore >= 60 ? 'partial' : 'failure'
    };
  }

  /**
   * 获取默认部分评估结果
   */
  private getDefaultPartialEvaluation(): Partial<EvaluationResult> {
    return {
      overallScore: 75,
      dimensionScores: {
        goalAchievement: 70,
        professionalism: 75,
        efficiency: 75,
        adaptability: 70,
        customerSatisfaction: 75
      },
      strengths: ['沟通态度良好', '保持积极互动'],
      improvements: ['提升专业能力', '加强异议处理'],
      detailedFeedback: '整体表现中规中矩，有提升空间。',
      recommendations: ['多练习类似场景', '学习成功案例']
    };
  }
}
