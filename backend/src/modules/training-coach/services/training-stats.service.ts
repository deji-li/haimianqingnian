import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerPersona } from '../entities/customer-persona.entity';
import { TrainingSession } from '../entities/training-session.entity';

@Injectable()
export class TrainingStatsService {
  private readonly logger = new Logger(TrainingStatsService.name);

  constructor(
    @InjectRepository(CustomerPersona)
    private readonly personaRepository: Repository<CustomerPersona>,
    @InjectRepository(TrainingSession)
    private readonly sessionRepository: Repository<TrainingSession>,
  ) {}

  /**
   * 获取客户角色列表
   */
  async getCustomerPersonas(isActive?: boolean) {
    const queryBuilder = this.personaRepository.createQueryBuilder('persona');

    if (isActive !== undefined) {
      queryBuilder.where('persona.is_active = :isActive', { isActive });
    }

    const personas = await queryBuilder
      .orderBy('persona.id', 'ASC')
      .getMany();

    return {
      personas: personas.map(p => ({
        id: p.id,
        name: p.name,
        personality_type: p.personality_type,
        characteristics: p.characteristics,
        communication_style: p.communication_style,
        decision_making_style: p.decision_making_style,
        typical_objections: p.typical_objections,
        response_patterns: p.response_patterns,
        difficulty_settings: p.difficulty_settings,
        is_active: p.is_active,
      })),
      total: personas.length,
    };
  }

  /**
   * 获取用户培训统计数据
   */
  async getTrainingStatistics(userId: number) {
    // 查询用户所有会话
    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.user_id = :userId', { userId })
      .getMany();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.session_status === 'completed').length;

    // 计算平均分数
    const sessionsWithScore = sessions.filter(s => s.final_score !== null && s.final_score !== undefined);
    const averageScore = sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + s.final_score, 0) / sessionsWithScore.length
      : 0;

    // 计算目标达成率
    const sessionsWithGoalRate = sessions.filter(s => s.goal_achievement_rate !== null);
    const goalAchievementRate = sessionsWithGoalRate.length > 0
      ? sessionsWithGoalRate.reduce((sum, s) => sum + s.goal_achievement_rate, 0) / sessionsWithGoalRate.length
      : 0;

    // 统计常用场景（从session_metrics中提取）
    const scenarioCount: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.session_metrics && typeof session.session_metrics === 'object') {
        const metrics = session.session_metrics as any;
        if (metrics.scenario) {
          scenarioCount[metrics.scenario] = (scenarioCount[metrics.scenario] || 0) + 1;
        }
      }
    });

    const favoriteScenarios = Object.entries(scenarioCount)
      .map(([scenario, count]) => ({ scenario, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 分析改进点（基于低分维度）
    const improvementAreas: string[] = [];
    const avgMetrics = {
      goalAchievement: 0,
      professionalism: 0,
      efficiency: 0,
      adaptability: 0,
      customerSatisfaction: 0,
      count: 0,
    };

    sessions.forEach(session => {
      if (session.session_metrics && typeof session.session_metrics === 'object') {
        const metrics = session.session_metrics as any;
        if (metrics.dimensions) {
          avgMetrics.goalAchievement += metrics.dimensions.goalAchievement || 0;
          avgMetrics.professionalism += metrics.dimensions.professionalism || 0;
          avgMetrics.efficiency += metrics.dimensions.efficiency || 0;
          avgMetrics.adaptability += metrics.dimensions.adaptability || 0;
          avgMetrics.customerSatisfaction += metrics.dimensions.customerSatisfaction || 0;
          avgMetrics.count++;
        }
      }
    });

    if (avgMetrics.count > 0) {
      const avgGoal = avgMetrics.goalAchievement / avgMetrics.count;
      const avgProf = avgMetrics.professionalism / avgMetrics.count;
      const avgEff = avgMetrics.efficiency / avgMetrics.count;
      const avgAdapt = avgMetrics.adaptability / avgMetrics.count;
      const avgCust = avgMetrics.customerSatisfaction / avgMetrics.count;

      if (avgGoal < 70) improvementAreas.push('目标达成度需要提升');
      if (avgProf < 70) improvementAreas.push('专业性表现需要加强');
      if (avgEff < 70) improvementAreas.push('沟通效率有待改善');
      if (avgAdapt < 70) improvementAreas.push('应变能力需要提升');
      if (avgCust < 70) improvementAreas.push('客户满意度需要关注');
    }

    if (improvementAreas.length === 0) {
      improvementAreas.push('继续保持优秀表现');
    }

    return {
      totalSessions,
      completedSessions,
      averageScore: Math.round(averageScore * 10) / 10,
      goalAchievementRate: Math.round(goalAchievementRate * 10) / 10,
      favoriteScenarios,
      improvementAreas,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 1000) / 10 : 0,
    };
  }
}
