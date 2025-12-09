import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CustomerService } from '../../customer/customer.service'
import { AiChatService } from '../../ai-chat/ai-chat.service'
import { AiCacheService } from '../../../common/services/ai/ai-cache.service'
import { WeWorkChatRecord } from '../entities/wework-chat-record.entity'

export interface CustomerInsightUpdate {
  customerId: number
  externalUserId: string
  customerProfile: Record<string, any>
  painPoints: string[]
  interests: string[]
  needs: string[]
  intentionScore: number
  riskLevel: string
  dealOpportunity: string
  estimatedCycle: string
  suggestions: string[]
  followupPlan: string[]
}

@Injectable()
export class WeWorkInsightUpdater {
  private readonly logger = new Logger(WeWorkInsightUpdater.name)
  private readonly cachePrefix = 'wework:insights:'
  private readonly cacheTtl = 2 * 60 * 60 // 2小时缓存

  constructor(
    private readonly customerService: CustomerService,
    private readonly aiChatService: AiChatService,
    private readonly aiCacheService: AiCacheService,
  ) {}

  /**
   * 更新客户洞察
   */
  async updateCustomerInsights(externalUserId: string, analysisResult: any): Promise<CustomerInsightUpdate> {
    try {
      this.logger.log(`更新客户洞察: ${externalUserId}`)

      // 查找对应的CRM客户
      const customer = await this.findCustomerByExternalUserId(externalUserId)
      if (!customer) {
        this.logger.warn(`未找到外部用户 ${externalUserId} 对应的CRM客户`)
        throw new Error(`未找到对应的客户: ${externalUserId}`)
      }

      const update: CustomerInsightUpdate = {
        customerId: customer.id,
        externalUserId,
        customerProfile: analysisResult.customerProfile || {},
        painPoints: analysisResult.customerPainPoints || [],
        interests: analysisResult.customerInterests || [],
        needs: analysisResult.customerNeeds || [],
        intentionScore: analysisResult.intentionScore || 0,
        riskLevel: analysisResult.riskLevel || '低',
        dealOpportunity: analysisResult.dealOpportunity || '低',
        estimatedCycle: analysisResult.estimatedCycle || '1-2周',
        suggestions: analysisResult.suggestions || [],
        followupPlan: analysisResult.followupPlan || []
      }

      // 并行执行所有更新操作
      await Promise.all([
        this.updateCustomerProfile(customer.id, update.customerProfile),
        this.updateIntentionScore(customer.id, update.intentionScore),
        this.updateCustomerTags(customer.id, update),
        this.updateCustomerAIInsights(customer.id, analysisResult),
        this.cacheAnalysisResult(customer.id, analysisResult),
        this.triggerRealtimeNotification(customer.id, update)
      ])

      this.logger.log(`客户洞察更新完成: ${customer.id}, 意向度: ${update.intentionScore}`)
      return update
    } catch (error) {
      this.logger.error('更新客户洞察失败:', error)
      throw error
    }
  }

  /**
   * 更新客户基础信息
   */
  private async updateCustomerProfile(customerId: number, customerProfile: Record<string, any>): Promise<void> {
    try {
      const updateData: any = {}

      // 提取客户档案信息
      if (customerProfile.age) {
        updateData.age = customerProfile.age
      }

      if (customerProfile.gender) {
        updateData.gender = customerProfile.gender === '男' ? 1 : 2
      }

      if (customerProfile.occupation) {
        updateData.occupation = customerProfile.occupation
      }

      if (customerProfile.education) {
        updateData.education = customerProfile.education
      }

      if (customerProfile.familyStatus) {
        updateData.familyStatus = customerProfile.familyStatus
      }

      if (customerProfile.incomeLevel) {
        updateData.incomeLevel = customerProfile.incomeLevel
      }

      if (customerProfile.communicationStyle) {
        updateData.communicationStyle = customerProfile.communicationStyle
      }

      if (customerProfile.decisionMaker) {
        updateData.decisionMaker = customerProfile.decisionMaker
      }

      // 如果有需要更新的字段
      if (Object.keys(updateData).length > 0) {
        await this.customerService.update(customerId, updateData)
        this.logger.log(`客户档案更新完成: ${customerId}`)
      }
    } catch (error) {
      this.logger.error(`更新客户档案失败 ${customerId}:`, error)
    }
  }

  /**
   * 更新客户意向度评分
   */
  private async updateIntentionScore(customerId: number, intentionScore: number): Promise<void> {
    try {
      await this.customerService.update(customerId, {
        intentionScore,
        lastAnalysisTime: new Date()
      })
      this.logger.log(`客户意向度更新完成: ${customerId} -> ${intentionScore}`)
    } catch (error) {
      this.logger.error(`更新客户意向度失败 ${customerId}:`, error)
    }
  }

  /**
   * 更新客户标签
   */
  private async updateCustomerTags(customerId: number, update: CustomerInsightUpdate): Promise<void> {
    try {
      const newTags = []

      // 基于痛点生成标签
      if (update.painPoints.length > 0) {
        const painPointTags = this.generatePainPointTags(update.painPoints)
        newTags.push(...painPointTags)
      }

      // 基于兴趣生成标签
      if (update.interests.length > 0) {
        const interestTags = this.generateInterestTags(update.interests)
        newTags.push(...interestTags)
      }

      // 基于客户画像生成标签
      if (Object.keys(update.customerProfile).length > 0) {
        const profileTags = this.generateProfileTags(update.customerProfile)
        newTags.push(...profileTags)
      }

      // 基于意向度生成标签
      const intentionTag = this.generateIntentionTag(update.intentionScore)
      if (intentionTag) {
        newTags.push(intentionTag)
      }

      // 基于风险等级生成标签
      if (update.riskLevel && update.riskLevel !== '低') {
        newTags.push(update.riskLevel + '风险')
      }

      // 基于成交机会生成标签
      if (update.dealOpportunity && update.dealOpportunity !== '低') {
        newTags.push(update.dealOpportunity + '机会')
      }

      // 去重并应用标签
      const uniqueTags = [...new Set(newTags)]
      if (uniqueTags.length > 0) {
        await this.customerService.addTags(customerId, uniqueTags)
        this.logger.log(`客户标签更新完成: ${customerId}, 新增标签: ${uniqueTags.join(', ')}`)
      }
    } catch (error) {
      this.logger.error(`更新客户标签失败 ${customerId}:`, error)
    }
  }

  /**
   * 更新客户AI洞察数据
   */
  private async updateCustomerAIInsights(customerId: number, analysisResult: any): Promise<void> {
    try {
      // 保存AI分析记录
      await this.aiChatService.createChatRecord({
        customerId,
        chatContent: JSON.stringify(analysisResult),
        painPoints: analysisResult.customerPainPoints || [],
        interests: analysisResult.customerInterests || [],
        needs: analysisResult.customerNeeds || [],
        intentionScore: analysisResult.intentionScore || 0,
        riskLevel: analysisResult.riskLevel || '低',
        dealOpportunity: analysisResult.dealOpportunity || '低',
        estimatedCycle: analysisResult.estimatedCycle || '1-2周',
        suggestions: analysisResult.suggestions || [],
        followupPlan: analysisResult.followupPlan || [],
        analysisTime: new Date()
      })

      this.logger.log(`AI分析记录保存完成: ${customerId}`)
    } catch (error) {
      this.logger.error(`保存AI分析记录失败 ${customerId}:`, error)
    }
  }

  /**
   * 缓存分析结果
   */
  private async cacheAnalysisResult(customerId: number, analysisResult: any): Promise<void> {
    try {
      const cacheKey = `${this.cachePrefix}${customerId}`
      await this.aiCacheService.set(
        cacheKey,
        JSON.stringify(analysisResult),
        this.cacheTtl
      )
      this.logger.log(`分析结果缓存完成: ${customerId}`)
    } catch (error) {
      this.logger.error(`缓存分析结果失败 ${customerId}:`, error)
    }
  }

  /**
   * 触发实时通知
   */
  private async triggerRealtimeNotification(customerId: number, update: CustomerInsightUpdate): Promise<void> {
    try {
      const notification = {
        customerId,
        type: 'customer_insight_update',
        data: {
          intentionScore: update.intentionScore,
          painPointsCount: update.painPoints.length,
          riskLevel: update.riskLevel,
          dealOpportunity: update.dealOpportunity
        }
      }

      // 这里可以集成WebSocket、消息队列等实时通知机制
      await this.sendRealtimeNotification(notification)
      this.logger.log(`实时通知发送完成: ${customerId}`)
    } catch (error) {
      this.logger.error(`发送实时通知失败 ${customerId}:`, error)
    }
  }

  /**
   * 查找客户
   */
  private async findCustomerByExternalUserId(externalUserId: string): Promise<any> {
    try {
      return await this.customerService.findByWeWorkExternalId(externalUserId)
    } catch (error) {
      this.logger.error('查找客户失败:', error)
      return null
    }
  }

  /**
   * 痛点标签生成
   */
  private generatePainPointTags(painPoints: string[]): string[] {
    const tagMapping: Record<string, string> = {
      '价格': '价格敏感',
      '费用': '价格敏感',
      '贵': '价格敏感',
      '便宜': '价格敏感',
      '时间': '时间紧张',
      '忙': '时间紧张',
      '效果': '效果关注',
      '质量': '效果关注',
      '师资': '师资重视',
      '老师': '师资重视',
      '环境': '环境要求',
      '装修': '环境要求',
      '交通': '交通便利',
      '停车': '交通便利',
      '距离': '交通便利',
      '设施': '设施要求',
      '设备': '设施要求'
    }

    return painPoints
      .flatMap(point =>
        Object.keys(tagMapping)
          .filter(key => point.includes(key))
          .map(key => tagMapping[key])
      )
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // 去重
  }

  /**
   * 兴趣标签生成
   */
  private generateInterestTags(interests: string[]): string[] {
    const interestMapping: Record<string, string> = {
      '美术': '艺术兴趣',
      '画画': '艺术兴趣',
      '音乐': '音乐兴趣',
      '钢琴': '音乐��趣',
      '小提琴': '音乐兴趣',
      '舞蹈': '舞蹈兴趣',
      '芭蕾': '舞蹈兴趣',
      '体育': '体育兴趣',
      '游泳': '体育兴趣',
      '篮球': '体育兴趣',
      '足球': '体育兴趣',
      '英语': '英语学习',
      '口语': '英语学习',
      '数学': '数学思维',
      '奥数': '数学思维',
      '编程': '编程兴趣',
      '计算机': '编程兴趣',
      '科学': '科学探索',
      '实验': '科学探索',
      '阅读': '阅读兴趣',
      '书法': '书法兴趣',
      '围棋': '棋类兴趣',
      '象棋': '棋类兴趣'
    }

    return interests
      .flatMap(interest =>
        Object.keys(interestMapping)
          .filter(key => interest.includes(key))
          .map(key => interestMapping[key])
      )
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // 去重
  }

  /**
   * 客户画像标签生成
   */
  private generateProfileTags(customerProfile: Record<string, any>): string[] {
    const tags = []

    // 年龄标签
    if (customerProfile.age) {
      const age = parseInt(customerProfile.age)
      if (age < 6) {
        tags.push('幼儿客户')
      } else if (age < 12) {
        tags.push('少儿客户')
      } else if (age < 18) {
        tags.push('青少年客户')
      } else {
        tags.push('成人客户')
      }
    }

    // 教育背景标签
    if (customerProfile.education) {
      if (customerProfile.education.includes('大学') || customerProfile.education.includes('本科')) {
        tags.push('高学历')
      }
    }

    // 家庭状态标签
    if (customerProfile.familyStatus) {
      if (customerProfile.familyStatus.includes('已婚') || customerProfile.familyStatus.includes('有孩子')) {
        tags.push('家庭客户')
      }
    }

    // 沟通风格标签
    if (customerProfile.communicationStyle) {
      if (customerProfile.communicationStyle.includes('理性')) {
        tags.push('理性决策')
      } else if (customerProfile.communicationStyle.includes('感性')) {
        tags.push('感性决策')
      }
    }

    return tags
  }

  /**
   * 意向度标签生成
   */
  private generateIntentionTag(score: number): string | null {
    if (score >= 80) {
      return '高意向'
    } else if (score >= 60) {
      return '中意向'
    } else if (score >= 40) {
      return '低意向'
    } else if (score > 0) {
      return '初步意向'
    }
    return null
  }

  /**
   * 发送实时通知
   */
  private async sendRealtimeNotification(notification: any): Promise<void> {
    // 这里可以集成WebSocket、消息队列等实时通知机制
    this.logger.log('发送实时通知:', notification)
  }

  /**
   * 批量更新客户洞察
   */
  async batchUpdateInsights(updates: CustomerInsightUpdate[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const update of updates) {
      try {
        await this.updateCustomerInsights(update.externalUserId, {
          customerProfile: update.customerProfile,
          customerPainPoints: update.painPoints,
          customerInterests: update.interests,
          customerNeeds: update.needs,
          intentionScore: update.intentionScore,
          riskLevel: update.riskLevel,
          dealOpportunity: update.dealOpportunity,
          estimatedCycle: update.estimatedCycle,
          suggestions: update.suggestions,
          followupPlan: update.followupPlan
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${update.customerId}: ${error.message}`)
      }
    }

    this.logger.log(`批量更新客户洞察完成: 成功 ${results.success}, 失败 ${results.failed}`)
    return results
  }

  /**
   * 清理过期缓存
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const pattern = `${this.cachePrefix}*`
      await this.aiCacheService.deletePattern(pattern)
      this.logger.log('过期客户洞察缓存清理完成')
    } catch (error) {
      this.logger.error('清理过期缓存失败:', error)
    }
  }

  /**
   * 获取客户洞察缓存
   */
  async getCustomerInsightsCache(customerId: number): Promise<any | null> {
    try {
      const cacheKey = `${this.cachePrefix}${customerId}`
      const cached = await this.aiCacheService.get(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      this.logger.error(`获取客户洞察缓存失败 ${customerId}:`, error)
      return null
    }
  }
}