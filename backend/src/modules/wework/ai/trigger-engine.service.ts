import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkChatRecord } from '../entities/wework-chat-record.entity'
import { WeWorkTriggerRule } from '../entities/wework-trigger-rule.entity'
import { WeWorkInsightUpdater } from './insight-updater.service'
import { DeepseekAnalysisService } from '../../../common/services/ai/deepseek-analysis.service'
import { CustomerService } from '../../customer/customer.service'

export interface TriggerEvaluation {
  ruleId: number
  ruleName: string
  triggered: boolean
  confidence: number
  reason?: string
}

export interface TriggerAction {
  ruleId: number
  ruleName: string
  actionType: string
  executed: boolean
  result?: any
  error?: string
}

@Injectable()
export class WeWorkAITriggerEngine {
  private readonly logger = new Logger(WeWorkAITriggerEngine.name)

  constructor(
    @InjectRepository(WeWorkTriggerRule)
    private readonly triggerRuleRepository: Repository<WeWorkTriggerRule>,
    @InjectRepository(WeWorkChatRecord)
    private readonly chatRecordRepository: Repository<WeWorkChatRecord>,
    private readonly insightUpdater: WeWorkInsightUpdater,
    private readonly deepSeekService: DeepseekAnalysisService,
    private readonly customerService: CustomerService,
  ) {}

  /**
   * 处理消息触发器
   */
  async processMessageTrigger(message: WeWorkChatRecord): Promise<TriggerAction[]> {
    try {
      this.logger.log(`处理消息触发器: ${message.msgid}, 类型: ${message.msgtype}`)

      // 获取活跃的触发规则
      const activeRules = await this.getActiveTriggerRules()

      const results: TriggerAction[] = []

      for (const rule of activeRules) {
        try {
          // 评估规则是否触发
          const evaluation = await this.evaluateRule(rule, message)

          if (evaluation.triggered) {
            // 执行规则动作
            const action = await this.executeRuleAction(rule, message)
            results.push(action)

            this.logger.log(`触发规则执行成功: ${rule.ruleName}`)
          } else {
            results.push({
              ruleId: rule.id,
              ruleName: rule.ruleName,
              actionType: rule.actionType,
              executed: false,
              result: { reason: evaluation.reason }
            })
          }
        } catch (error) {
          this.logger.error(`执行触发规则失败 ${rule.ruleName}:`, error)
          results.push({
            ruleId: rule.id,
            ruleName: rule.ruleName,
            actionType: rule.actionType,
            executed: false,
            error: error.message
          })
        }
      }

      return results
    } catch (error) {
      this.logger.error('处理消息触发器失败:', error)
      throw error
    }
  }

  /**
   * 获取活跃的触发规则
   */
  private async getActiveTriggerRules(): Promise<WeWorkTriggerRule[]> {
    return await this.triggerRuleRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC' } // 高优先级先执行
    })
  }

  /**
   * 评估规则
   */
  private async evaluateRule(rule: WeWorkTriggerRule, message: WeWorkChatRecord): Promise<TriggerEvaluation> {
    try {
      switch (rule.triggerType) {
        case 'keyword':
          return await this.evaluateKeywordTrigger(rule, message)
        case 'message_type':
          return await this.evaluateMessageTypeTrigger(rule, message)
        case 'time_interval':
          return await this.evaluateTimeIntervalTrigger(rule, message)
        case 'customer_status':
          return await this.evaluateCustomerStatusTrigger(rule, message)
        default:
          return {
            ruleId: rule.id,
            ruleName: rule.ruleName,
            triggered: false,
            confidence: 0,
            reason: `未知的触发类型: ${rule.triggerType}`
          }
      }
    } catch (error) {
      this.logger.error(`评估触发规则失败 ${rule.ruleName}:`, error)
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        triggered: false,
        confidence: 0,
        reason: `规则评估失败: ${error.message}`
      }
    }
  }

  /**
   * 评估关键词触发
   */
  private async evaluateKeywordTrigger(
    rule: WeWorkTriggerRule,
    message: WeWorkChatRecord
  ): Promise<TriggerEvaluation> {
    const keywords = rule.keywords
    const content = message.textContent.toLowerCase()

    // 计算匹配度
    const matchedKeywords = keywords.filter(keyword =>
      content.includes(keyword.toLowerCase())
    )

    const triggered = matchedKeywords.length > 0
    const confidence = triggered ? Math.min(matchedKeywords.length / keywords.length, 1.0) : 0

    return {
      ruleId: rule.id,
      ruleName: rule.ruleName,
      triggered,
      confidence,
      reason: triggered ? `匹配关键词: ${matchedKeywords.join(', ')}` : '未匹配任何关键词'
    }
  }

  /**
   * 评估消息类型触发
   */
  private async evaluateMessageTypeTrigger(
    rule: WeWorkTriggerRule,
    message: WeWorkChatRecord
  ): Promise<TriggerEvaluation> {
    const targetTypes = rule.messageTypes
    const messageType = message.msgtype

    const triggered = targetTypes.includes(messageType)
    const confidence = triggered ? 1.0 : 0

    return {
      ruleId: rule.id,
      ruleName: rule.ruleName,
      triggered,
      confidence,
      reason: triggered ? `消息类型匹配: ${messageType}` : '消息类型不匹配'
    }
  }

  /**
   * 评估时间间隔触发
   */
  private async evaluateTimeIntervalTrigger(
    rule: WeWorkTriggerRule,
    message: WeWorkChatRecord
  ): Promise<TriggerEvaluation> {
    const intervalHours = rule.intervalHours
    const externalUserId = message.externalUserId

    if (!externalUserId) {
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        triggered: false,
        confidence: 0,
        reason: '缺少外部用户ID'
      }
    }

    // 查找最近一次的分析时间
    const lastAnalysis = await this.findLastAnalysis(externalUserId)

    if (!lastAnalysis) {
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        triggered: true,
        confidence: 1.0,
        reason: '首次分析'
      }
    }

    // 计算时间差
    const timeDiff = Date.now() - new Date(lastAnalysis).getTime()
    const intervalMs = intervalHours * 60 * 60 * 1000

    const triggered = timeDiff >= intervalMs
    const confidence = Math.min(timeDiff / intervalMs, 1.0)

    return {
      ruleId: rule.id,
      ruleName: rule.ruleName,
      triggered,
      confidence,
      reason: triggered ? `时间间隔达到要求: ${Math.round(timeDiff / (60 * 60 * 1000))}小时` : '时间间隔未达到要求'
    }
  }

  /**
   * 评估客户状态触发
   */
  private async evaluateCustomerStatusTrigger(
    rule: WeWorkTriggerRule,
    message: WeWorkChatRecord
  ): Promise<TriggerEvaluation> {
    try {
      const customer = await this.findCustomerByExternalUserId(message.externalUserId)

      if (!customer) {
        return {
          ruleId: rule.id,
          ruleName: rule.ruleName,
          triggered: false,
          confidence: 0,
          reason: '未找到对应的客户'
        }
      }

      const conditions = rule.triggerConditions
      let triggered = false
      let reason = ''

      // 检查意向度变化
      if (conditions.intentionChange) {
        const threshold = conditions.intentionThreshold || 70
        triggered = (customer.intentionScore || 0) >= threshold
        reason = triggered ? `意向度达到${customer.intentionScore}分` : `意向度未达到${threshold}分`
      }

      // 检查标签变化
      if (!triggered && conditions.tagChange) {
        const targetTags = conditions.targetTags || []
        const customerTags = customer.tags ? JSON.parse(customer.tags as string) : []
        triggered = targetTags.some(tag => customerTags.includes(tag))
        reason = triggered ? `客户包含目标标签` : '客户不包含目标标签'
      }

      // 检查新客户状态
      if (!triggered && conditions.newCustomer) {
        const createdTime = new Date(customer.createdTime)
        const daysDiff = (Date.now() - createdTime.getTime()) / (24 * 60 * 60 * 1000)
        triggered = daysDiff <= 7 // 7天内的新客户
        reason = triggered ? `新客户(${Math.round(daysDiff)}天)` : '不是新客户'
      }

      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        triggered,
        confidence: triggered ? 1.0 : 0,
        reason: reason || '条件不满足'
      }
    } catch (error) {
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        triggered: false,
        confidence: 0,
        reason: `客户状态评估失败: ${error.message}`
      }
    }
  }

  /**
   * 执行规则动作
   */
  private async executeRuleAction(
    rule: WeWorkTriggerRule,
    message: WeWorkChatRecord
  ): Promise<TriggerAction> {
    try {
      let result: any = null

      switch (rule.actionType) {
        case 'ai_analysis':
          result = await this.triggerAIAnalysis(message, rule)
          break
        case 'tag_update':
          result = await this.updateCustomerTags(message, rule)
          break
        case 'sales_notification':
          result = await this.sendSalesNotification(message, rule)
          break
        case 'followup_reminder':
          result = await this.createFollowupReminder(message, rule)
          break
        default:
          throw new Error(`未知的动作类型: ${rule.actionType}`)
      }

      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        actionType: rule.actionType,
        executed: true,
        result
      }
    } catch (error) {
      this.logger.error(`执行规则动作失败 ${rule.ruleName}:`, error)
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        actionType: rule.actionType,
        executed: false,
        error: error.message
      }
    }
  }

  /**
   * 触发AI分析
   */
  private async triggerAIAnalysis(message: WeWorkChatRecord, rule: WeWorkTriggerRule): Promise<any> {
    try {
      // 获取最近的聊天记录
      const messageCount = rule.messageCount || 50
      const chatHistory = await this.getRecentChats(message.externalUserId, messageCount)

      if (chatHistory.length === 0) {
        return { message: '无聊天记录可供分析' }
      }

      // 转换为AI分析格式
      const analysisData = this.convertToAIAnalysisFormat(chatHistory)

      // 设置分析状态
      message.aiAnalysisStatus = 'processing'
      await this.chatRecordRepository.save(message)

      // 调用AI分析服务
      const analysisResult = await this.deepSeekService.analyzeCustomerChat(analysisData)

      // 更新分析结果
      message.aiAnalysisResult = analysisResult
      message.aiAnalysisStatus = 'completed'
      await this.chatRecordRepository.save(message)

      // 更新客户洞察
      if (message.customerId) {
        await this.insightUpdater.updateCustomerInsights(message.externalUserId, analysisResult)
      }

      this.logger.log(`AI分析完成: ${message.externalUserId}, 痛点数: ${analysisResult.customerPainPoints?.length || 0}`)

      return {
        success: true,
        analysisResult,
        messageCount: chatHistory.length
      }
    } catch (error) {
      message.aiAnalysisStatus = 'failed'
      await this.chatRecordRepository.save(message)
      throw error
    }
  }

  /**
   * 更新客户标签
   */
  private async updateCustomerTags(message: WeWorkChatRecord, rule: WeWorkTriggerRule): Promise<any> {
    try {
      const customer = await this.findCustomerByExternalUserId(message.externalUserId)
      if (!customer) {
        return { message: '未找到对应客户' }
      }

      const newTags = rule.tags
      if (newTags.length === 0) {
        return { message: '无标签需要更新' }
      }

      // 添加标签
      await this.customerService.addTags(customer.id, newTags)

      // 更新消息状态
      message.autoTagUpdated = true
      await this.chatRecordRepository.save(message)

      this.logger.log(`客户标签更新完成: ${customer.id}, 标签: ${newTags.join(', ')}`)

      return {
        success: true,
        customerId: customer.id,
        addedTags: newTags
      }
    } catch (error) {
      this.logger.error('更新客户标签失败:', error)
      throw error
    }
  }

  /**
   * 发送销售通知
   */
  private async sendSalesNotification(message: WeWorkChatRecord, rule: WeWorkTriggerRule): Promise<any> {
    try {
      const customer = await this.findCustomerByExternalUserId(message.externalUserId)
      if (!customer) {
        return { message: '未找到对应客户' }
      }

      const notificationType = rule.notificationType
      const content = this.generateNotificationContent(customer, message, notificationType)

      // 这里可以集成各种通知渠道
      // 例如：企业微信消息、邮件、短信等
      await this.sendNotification({
        type: notificationType,
        recipient: customer.salesPersonId,
        customerId: customer.id,
        customerName: customer.name,
        content
      })

      // 更新消息状态
      message.salesNotified = true
      await this.chatRecordRepository.save(message)

      this.logger.log(`销售通知发送完成: ${customer.id}, 类型: ${notificationType}`)

      return {
        success: true,
        notificationType,
        customerId: customer.id
      }
    } catch (error) {
      this.logger.error('发送销售通知失败:', error)
      throw error
    }
  }

  /**
   * 创建跟进提醒
   */
  private async createFollowupReminder(message: WeWorkChatRecord, rule: WeWorkTriggerRule): Promise<any> {
    try {
      const customer = await this.findCustomerByExternalUserId(message.externalUserId)
      if (!customer) {
        return { message: '未找到对应客户' }
      }

      const reminderType = rule.reminderType
      const delayHours = rule.delayHours

      // 计算提醒时间
      const reminderTime = new Date()
      reminderTime.setHours(reminderTime.getHours() + delayHours)

      // 创建跟进提醒
      const reminder = await this.createFollowupTask({
        customerId: customer.id,
        salesPersonId: customer.salesPersonId,
        reminderType,
        reminderTime,
        messageId: message.msgid,
        content: this.generateReminderContent(customer, message)
      })

      this.logger.log(`跟进提醒创建完成: ${customer.id}, 时间: ${reminderTime}`)

      return {
        success: true,
        reminderId: reminder.id,
        reminderTime
      }
    } catch (error) {
      this.logger.error('创建跟进提醒失败:', error)
      throw error
    }
  }

  /**
   * 查找最近一次分析
   */
  private async findLastAnalysis(externalUserId: string): Promise<Date | null> {
    try {
      const lastAnalysis = await this.chatRecordRepository.findOne({
        where: {
          externalUserId,
          aiAnalysisStatus: 'completed'
        },
        order: {
          updatedTime: 'DESC'
        }
      })

      return lastAnalysis?.updatedTime || null
    } catch (error) {
      this.logger.error('查找最近分析失败:', error)
      return null
    }
  }

  /**
   * 查找客户
   */
  private async findCustomerByExternalUserId(externalUserId: string) {
    try {
      // 这里需要根据实际的客户表结构来查找
      return await this.customerService.findByWeWorkExternalId(externalUserId)
    } catch (error) {
      this.logger.error('查找客户失败:', error)
      return null
    }
  }

  /**
   * 获取最近聊天记录
   */
  private async getRecentChats(externalUserId: string, count: number): Promise<WeWorkChatRecord[]> {
    try {
      return await this.chatRecordRepository.find({
        where: { externalUserId },
        order: { msgtime: 'DESC' },
        take: count
      })
    } catch (error) {
      this.logger.error('获取最近聊天记录失败:', error)
      return []
    }
  }

  /**
   * 转换为AI分析格式
   */
  private convertToAIAnalysisFormat(chatHistory: WeWorkChatRecord[]): any {
    return {
      chatRecords: chatHistory.map(record => ({
        content: record.textContent,
        timestamp: new Date(record.msgtime).toISOString(),
        sender: record.isFromSales ? 'sales' : 'customer',
        messageType: this.mapMessageType(record.msgtype)
      })),
      analysisOptions: {
        extractPainPoints: true,
        extractInterests: true,
        extractNeeds: true,
        generateInsights: true,
        calculateIntention: true
      }
    }
  }

  /**
   * 映射消息类型
   */
  private mapMessageType(msgtype: string): string {
    const mapping = {
      text: 'text',
      image: 'image',
      voice: 'voice',
      video: 'video',
      file: 'file',
      location: 'location',
      link: 'link'
    }
    return mapping[msgtype] || 'unknown'
  }

  /**
   * 生成通知内容
   */
  private generateNotificationContent(customer: any, message: WeWorkChatRecord, type: string): string {
    switch (type) {
      case 'hot_lead':
        return `高意向客户提醒：${customer.name} 的意向度达到 ${customer.intentionScore || 0} 分，建议立即跟进！`
      case 'high_opportunity':
        return `成交机会提醒：${customer.name} 发送了 ${this.getMessageTypeText(message.msgtype)}，AI分析显示成交机会很高！`
      case 'risk_warning':
        return `客户流失风险提醒：${customer.name} 可能有流失风险，建议立即关怀和跟进！`
      case 'weekly_reminder':
        return `周度客户提醒：${customer.name} 最近一周活跃度较高，建议安排回访！`
      default:
        return `客户动态提醒：${customer.name} 有新的互动记录。`
    }
  }

  /**
   * 生成提醒内容
   */
  private generateReminderContent(customer: any, message: WeWorkChatRecord): string {
    return `跟进提醒：客户 ${customer.name} 于 ${new Date(message.msgtime).toLocaleString()} 发送了${this.getMessageTypeText(message.msgtype)}，建议及时跟进。`
  }

  /**
   * 获取消息类型文本
   */
  private getMessageTypeText(msgtype: string): string {
    const mapping = {
      text: '文本消息',
      image: '图片',
      voice: '语音消息',
      video: '视频',
      file: '文件',
      location: '位置',
      link: '链接'
    }
    return mapping[msgtype] || msgtype
  }

  /**
   * 发送通知
   */
  private async sendNotification(notification: any): Promise<void> {
    // 这里需要集成具体的通知服务
    this.logger.log('发送通知:', notification)
  }

  /**
   * 创建跟进任务
   */
  private async createFollowupTask(taskData: any): Promise<any> {
    // 这里需要集成具体的任务管理服务
    const task = {
      id: Date.now(),
      ...taskData
    }
    this.logger.log('创建跟进任务:', task)
    return task
  }
}