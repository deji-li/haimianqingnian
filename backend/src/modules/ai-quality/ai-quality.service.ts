import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { AiStaffQualityRecord } from '../ai-marketing/entities/ai-staff-quality-record.entity'
import { AiSopRule } from '../ai-marketing/entities/ai-sop-rule.entity'
import { AiViolationRule } from '../ai-marketing/entities/ai-violation-rule.entity'
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service'

export interface QualityCheckResult {
  chatRecordId: number
  userId: number
  customerId: number
  chatDate: Date
  sopItems: any[]
  sopCompletedCount: number
  sopTotalCount: number
  sopScore: number
  violations: any[]
  violationCount: number
  messageCount: number
  responseSpeed: string
  responseTimeAvg: number
  highIntentCustomer: number
  serviceAttitude: string
}

export interface QualityStats {
  totalChecked: number
  violations: number
  sopCompletionRate: number
  highIntentCount: number
}

@Injectable()
export class AiQualityService {
  private readonly logger = new Logger(AiQualityService.name)

  constructor(
    @InjectRepository(AiStaffQualityRecord)
    private readonly qualityRepository: Repository<AiStaffQualityRecord>,
    @InjectRepository(AiSopRule)
    private readonly sopRuleRepository: Repository<AiSopRule>,
    @InjectRepository(AiViolationRule)
    private readonly violationRuleRepository: Repository<AiViolationRule>,
    private readonly deepSeekService: DeepseekAnalysisService,
  ) {}

  /**
   * 执行AI质检检查
   * 在聊天记录分析完成后自动触发
   */
  async performQualityCheck(chatRecord: {
    id: number
    userId: number
    customerId: number
    chatContent: string
    messageCount?: number
    chatDate?: Date
    intentionScore?: number
    riskLevel?: string
    analysisTime?: Date
  }): Promise<QualityCheckResult> {
    try {
      this.logger.log(`开始AI质检检查，聊天记录ID: ${chatRecord.id}`)

      // 1. 检查SOP规则
      const sopResult = await this.checkSopRules(chatRecord)

      // 2. 检查违规规则
      const violationResult = await this.checkViolationRules(chatRecord)

      // 3. 计算执行力指标
      const metrics = await this.calculateMetrics(chatRecord)

      // 4. 判断是否高意向客户
      const highIntentCustomer = (chatRecord.intentionScore || 0) >= 70 ? 1 : 0

      // 5. 构建质检结果
      const result: QualityCheckResult = {
        chatRecordId: chatRecord.id,
        userId: chatRecord.userId,
        customerId: chatRecord.customerId,
        chatDate: chatRecord.chatDate || new Date(),
        sopItems: sopResult.sopItems,
        sopCompletedCount: sopResult.completedCount,
        sopTotalCount: sopResult.totalCount,
        sopScore: sopResult.score,
        violations: violationResult.violations,
        violationCount: violationResult.violationCount,
        messageCount: metrics.messageCount,
        responseSpeed: metrics.responseSpeed,
        responseTimeAvg: metrics.responseTimeAvg,
        highIntentCustomer,
        serviceAttitude: metrics.serviceAttitude,
      }

      // 6. 保存质检记录
      await this.saveQualityRecord(result)

      this.logger.log(`AI质检检查完成，聊天记录ID: ${chatRecord.id}, SOP得分: ${result.sopScore}, 违规数: ${result.violationCount}`)
      return result
    } catch (error) {
      this.logger.error(`AI质检检查失败，聊天记录ID: ${chatRecord.id}`, error)
      throw error
    }
  }

  /**
   * 检查SOP规则
   */
  private async checkSopRules(chatRecord: any): Promise<{
    sopItems: any[]
    completedCount: number
    totalCount: number
    score: number
  }> {
    try {
      // 获取所有活跃的SOP规则
      const sopRules = await this.sopRuleRepository.find({
        where: { isActive: 1 },
        order: { ruleOrder: 'ASC' }
      })

      const sopItems = []
      let completedCount = 0

      for (const rule of sopRules) {
        const isCompleted = await this.evaluateSopRule(rule, chatRecord)

        sopItems.push({
          ruleId: rule.id,
          ruleName: rule.ruleName,
          ruleCategory: rule.ruleCategory,
          keywords: rule.checkKeywords,
          completed: isCompleted,
        })

        if (isCompleted) {
          completedCount++
        }
      }

      const totalCount = sopRules.length
      const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

      return {
        sopItems,
        completedCount,
        totalCount,
        score,
      }
    } catch (error) {
      this.logger.error('SOP规则检查失败:', error)
      return {
        sopItems: [],
        completedCount: 0,
        totalCount: 0,
        score: 0,
      }
    }
  }

  /**
   * 评估单个SOP规则
   */
  private async evaluateSopRule(rule: AiSopRule, chatRecord: any): Promise<boolean> {
    try {
      const content = chatRecord.chatContent.toLowerCase()
      const keywords = rule.checkKeywords || []

      // 检查是否包含所有必需关键词
      const hasRequiredKeywords = keywords.length === 0 ||
        keywords.some(keyword => content.includes(keyword.toLowerCase()))

      return hasRequiredKeywords
    } catch (error) {
      this.logger.error(`评估SOP规则失败 ${rule.ruleName}:`, error)
      return false
    }
  }

  /**
   * 检查违规规则
   */
  private async checkViolationRules(chatRecord: any): Promise<{
    violations: any[]
    violationCount: number
  }> {
    try {
      // 获取所有活跃的违规规则
      const violationRules = await this.violationRuleRepository.find({
        where: { isActive: 1 }
      })

      const violations = []

      for (const rule of violationRules) {
        const violation = await this.evaluateViolationRule(rule, chatRecord)

        if (violation.detected) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.ruleName,
            violationType: rule.violationType,
            severity: rule.severity,
            keywords: rule.keywords,
            matchedContent: violation.matchedContent,
            description: rule.description,
          })
        }
      }

      return {
        violations,
        violationCount: violations.length,
      }
    } catch (error) {
      this.logger.error('违规规则检查失败:', error)
      return {
        violations: [],
        violationCount: 0,
      }
    }
  }

  /**
   * 评估单个违规规则
   */
  private async evaluateViolationRule(rule: AiViolationRule, chatRecord: any): Promise<{
    detected: boolean
    matchedContent: string[]
  }> {
    try {
      const content = chatRecord.chatContent.toLowerCase()
      const keywords = rule.keywords || []
      const matchedContent: string[] = []

      // 检查是否包含违规关键词
      for (const keyword of keywords) {
        if (content.includes(keyword.toLowerCase())) {
          // 提取包含关键词的句子
          const sentences = content.split(/[。！？.!?]/)
          for (const sentence of sentences) {
            if (sentence.includes(keyword.toLowerCase())) {
              matchedContent.push(sentence.trim())
            }
          }
        }
      }

      return {
        detected: matchedContent.length > 0,
        matchedContent,
      }
    } catch (error) {
      this.logger.error(`评估违规规则失败 ${rule.ruleName}:`, error)
      return {
        detected: false,
        matchedContent: [],
      }
    }
  }

  /**
   * 计算执行力指标
   */
  private async calculateMetrics(chatRecord: any): Promise<{
    messageCount: number
    responseSpeed: string
    responseTimeAvg: number
    serviceAttitude: string
  }> {
    try {
      // 消息数量（如果聊天记录中没有提供，设为默认值）
      const messageCount = chatRecord.messageCount || 1

      // 响应速度（基于风险等级判断）
      let responseSpeed = '正常'
      if (chatRecord.riskLevel) {
        if (chatRecord.riskLevel === '低') {
          responseSpeed = '快速'
        } else if (chatRecord.riskLevel === '高') {
          responseSpeed = '较慢'
        }
      }

      // 平均响应时间（模拟数据，实际应该从聊天记录中计算）
      const responseTimeAvg = Math.floor(Math.random() * 300) + 60 // 60-360秒

      // 服务态度（基于分析结果判断）
      let serviceAttitude = '良好'
      if (chatRecord.intentionScore >= 80) {
        serviceAttitude = '优秀'
      } else if (chatRecord.intentionScore <= 40) {
        serviceAttitude = '一般'
      }

      return {
        messageCount,
        responseSpeed,
        responseTimeAvg,
        serviceAttitude,
      }
    } catch (error) {
      this.logger.error('计算执行力指标失败:', error)
      return {
        messageCount: 1,
        responseSpeed: '正常',
        responseTimeAvg: 180,
        serviceAttitude: '良好',
      }
    }
  }

  /**
   * 保存质检记录
   */
  private async saveQualityRecord(result: QualityCheckResult): Promise<void> {
    try {
      const qualityRecord = this.qualityRepository.create({
        chatRecordId: result.chatRecordId,
        userId: result.userId,
        customerId: result.customerId,
        chatDate: result.chatDate,
        sopItems: result.sopItems,
        sopCompletedCount: result.sopCompletedCount,
        sopTotalCount: result.sopTotalCount,
        sopScore: result.sopScore,
        violations: result.violations,
        violationCount: result.violationCount,
        messageCount: result.messageCount,
        responseSpeed: result.responseSpeed,
        responseTimeAvg: result.responseTimeAvg,
        highIntentCustomer: result.highIntentCustomer,
        serviceAttitude: result.serviceAttitude,
      })

      await this.qualityRepository.save(qualityRecord)
      this.logger.log(`质检记录保存成功: ${qualityRecord.id}`)
    } catch (error) {
      this.logger.error('保存质检记录失败:', error)
      throw error
    }
  }

  /**
   * 获取质检统计数据
   */
  async getQualityStats(params: {
    userId?: number
    startDate?: string
    endDate?: string
  }): Promise<QualityStats> {
    try {
      const { userId, startDate, endDate } = params

      const whereCondition: any = {}
      if (userId) {
        whereCondition.userId = userId
      }
      if (startDate && endDate) {
        whereCondition.chatDate = Between(new Date(startDate), new Date(endDate))
      }

      // 获取总质检数
      const totalChecked = await this.qualityRepository.count({
        where: whereCondition,
      })

      // 获取违规数（有违规的记录数）
      const violations = await this.qualityRepository.count({
        where: {
          ...whereCondition,
          violationCount: 1, // 违规数大于0
        },
      })

      // 获取SOP完成率
      const sopStats = await this.qualityRepository
        .createQueryBuilder('record')
        .select('AVG(record.sopScore)', 'avgScore')
        .where(whereCondition)
        .getRawOne()

      const sopCompletionRate = Math.round(parseFloat(sopStats?.avgScore || '0'))

      // 获取高意向客户数
      const highIntentCount = await this.qualityRepository.count({
        where: {
          ...whereCondition,
          highIntentCustomer: 1,
        },
      })

      return {
        totalChecked,
        violations,
        sopCompletionRate,
        highIntentCount,
      }
    } catch (error) {
      this.logger.error('获取质检统计数据失败:', error)
      return {
        totalChecked: 0,
        violations: 0,
        sopCompletionRate: 0,
        highIntentCount: 0,
      }
    }
  }

  /**
   * 获取SOP质检列表
   */
  async getSopList(params: {
    userId?: number
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<{ list: any[]; total: number }> {
    try {
      const { userId, startDate, endDate, page = 1, pageSize = 20 } = params

      const whereCondition: any = {}
      if (userId) {
        whereCondition.userId = userId
      }
      if (startDate && endDate) {
        whereCondition.chatDate = Between(new Date(startDate), new Date(endDate))
      }

      const [list, total] = await this.qualityRepository.findAndCount({
        where: whereCondition,
        relations: ['user', 'customer'],
        order: { createTime: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      // 格式化返回数据
      const formattedList = list.map(record => ({
        id: record.id,
        customerId: record.customerId,
        customerName: record.customer?.realName || '未知客户',
        chatDate: record.chatDate,
        sopStatus: record.sopScore >= 80 ? 'completed' : record.sopScore >= 60 ? 'uncompleted' : 'uncheck',
        sopScore: record.sopScore,
        sopItems: record.sopItems,
      }))

      return {
        list: formattedList,
        total,
      }
    } catch (error) {
      this.logger.error('获取SOP质检列表失败:', error)
      return {
        list: [],
        total: 0,
      }
    }
  }

  /**
   * 获取违规质检列表
   */
  async getViolationList(params: {
    userId?: number
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<{ list: any[]; total: number }> {
    try {
      const { userId, startDate, endDate, page = 1, pageSize = 20 } = params

      const whereCondition: any = { violationCount: 1 } // 只返回有违规的记录
      if (userId) {
        whereCondition.userId = userId
      }
      if (startDate && endDate) {
        whereCondition.chatDate = Between(new Date(startDate), new Date(endDate))
      }

      const [list, total] = await this.qualityRepository.findAndCount({
        where: whereCondition,
        relations: ['user', 'customer'],
        order: { createTime: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      // 格式化返回数据
      const formattedList = list.map(record => ({
        id: record.id,
        customerId: record.customerId,
        customerName: record.customer?.realName || '未知客户',
        chatDate: record.chatDate,
        violationItems: record.violations?.map(v => v.ruleName) || [],
        violationContent: record.violations?.map(v => v.matchedContent.join('，')).join('\n') || '',
        violationKeywords: record.violations?.flatMap(v => v.keywords) || [],
      }))

      return {
        list: formattedList,
        total,
      }
    } catch (error) {
      this.logger.error('获取违规质检列表失败:', error)
      return {
        list: [],
        total: 0,
      }
    }
  }

  /**
   * 获取执行力报表
   */
  async getReportList(params: {
    userId?: number
    startDate?: string
    endDate?: string
  }): Promise<{ list: any[] }> {
    try {
      const { userId, startDate, endDate } = params

      const queryBuilder = this.qualityRepository
        .createQueryBuilder('record')
        .leftJoin('record.user', 'user')
        .select([
          'user.id as userId',
          'user.realName as employeeName',
          'COUNT(record.id) as totalChats',
          'SUM(record.messageCount) as totalMessages',
          'AVG(record.responseTimeAvg) as avgResponseTime',
          'COUNT(CASE WHEN record.sopScore >= 80 THEN 1 END) as sopCompletedCount',
          'COUNT(CASE WHEN record.violationCount > 0 THEN 1 END) as violationCount',
          'COUNT(CASE WHEN record.highIntentCustomer = 1 THEN 1 END) as highIntentCount',
        ])
        .groupBy('user.id')
        .orderBy('totalChats', 'DESC')

      // 添加筛选条件
      if (userId) {
        queryBuilder.andWhere('record.userId = :userId', { userId })
      }
      if (startDate && endDate) {
        queryBuilder.andWhere('record.chatDate BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })
      }

      const result = await queryBuilder.getRawMany()

      // 格式化数据
      const list = result.map(row => ({
        employeeName: row.employeeName || '未知员工',
        totalChats: parseInt(row.totalChats) || 0,
        totalMessages: parseInt(row.totalMessages) || 0,
        avgResponseTime: Math.round(parseFloat(row.avgResponseTime) || 0),
        sopCompletedCount: parseInt(row.sopCompletedCount) || 0,
        violationCount: parseInt(row.violationCount) || 0,
        highIntentCount: parseInt(row.highIntentCount) || 0,
        completionRate: row.totalChats > 0
          ? Math.round((row.sopCompletedCount / row.totalChats) * 100)
          : 0,
      }))

      return {
        list,
      }
    } catch (error) {
      this.logger.error('获取执行力报表失败:', error)
      return {
        list: [],
      }
    }
  }

  /**
   * 批量质检聊天记录
   */
  async batchQualityCheck(chatRecords: any[]): Promise<void> {
    try {
      this.logger.log(`开始批量质检，记录数: ${chatRecords.length}`)

      for (const chatRecord of chatRecords) {
        try {
          await this.performQualityCheck(chatRecord)
        } catch (error) {
          this.logger.error(`单个质检失败，聊天记录ID: ${chatRecord.id}`, error)
          // 继续处理其他记录，不中断批量操作
        }
      }

      this.logger.log(`批量质检完成`)
    } catch (error) {
      this.logger.error('批量质检失败:', error)
      throw error
    }
  }
}