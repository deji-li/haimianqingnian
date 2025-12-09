import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkChatRecord } from '../entities/wework-chat-record.entity'
import { WeWorkArchiveConfig } from '../entities/wework-archive-config.entity'
import * as crypto from 'crypto'
import { WeWorkMessageProcessor } from '../chat/message-processor.service'
import { WeWorkAITriggerEngine } from '../ai/trigger-engine.service'

export interface WebhookEvent {
  timestamp: number
  nonce: string
  encrypt: string
  msg_signature: string
}

export interface DecryptedMessage {
  msgid: string
  action: string
  msg: Record<string, any>
}

@Injectable()
export class WeWorkWebhookService implements OnModuleInit {
  private readonly logger = new Logger(WeWorkWebhookService.name)
  private activeConfigs: Map<string, WeWorkArchiveConfig> = new Map()

  constructor(
    @InjectRepository(WeWorkArchiveConfig)
    private readonly archiveConfigRepository: Repository<WeWorkArchiveConfig>,
    @InjectRepository(WeWorkChatRecord)
    private readonly chatRecordRepository: Repository<WeWorkChatRecord>,
    private readonly messageProcessor: WeWorkMessageProcessor,
    private readonly triggerEngine: WeWorkAITriggerEngine,
  ) {}

  async onModuleInit() {
    // 加载活跃的存档配置
    await this.loadActiveConfigs()

    // 定时刷新配置
    setInterval(() => this.loadActiveConfigs(), 5 * 60 * 1000) // 5分钟刷新一次
  }

  /**
   * 加载活跃的存档配置
   */
  private async loadActiveConfigs(): Promise<void> {
    try {
      const configs = await this.archiveConfigRepository.find({
        where: { isActive: true, syncEnabled: true }
      })

      this.activeConfigs.clear()
      configs.forEach(config => {
        this.activeConfigs.set(config.corpId, config)
      })

      this.logger.log(`已加载 ${configs.length} 个活跃的企业微信存档配置`)
    } catch (error) {
      this.logger.error('加载存档配置失败:', error)
    }
  }

  /**
   * 验证Webhook消息签名
   */
  validateWebhookSignature(
    timestamp: string,
    nonce: string,
    encrypt: string,
    msgSignature: string,
    token: string
  ): boolean {
    try {
      // 排序参数
      const params = [token, timestamp, nonce, encrypt].sort()

      // 计算SHA1摘要
      const hash = crypto.createHash('sha1')
      hash.update(params.join(''))
      const calculatedSignature = hash.digest('hex')

      return calculatedSignature === msgSignature
    } catch (error) {
      this.logger.error('验证Webhook签名失败:', error)
      return false
    }
  }

  /**
   * 解密Webhook消息
   */
  decryptWebhookMessage(encrypt: string, aesKey: string): DecryptedMessage {
    try {
      // Base64解码
      const encryptedBuffer = Buffer.from(encrypt, 'base64')

      // AES-256-CBC解密
      const key = Buffer.from(aesKey + '=', 'base64')
      const iv = key.slice(0, 16)

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

      let decrypted = decipher.update(encryptedBuffer)
      decrypted = Buffer.concat([decrypted, decipher.final()])

      // 移除补位字符
      const pad = decrypted[decrypted.length - 1]
      if (pad) {
        decrypted = decrypted.slice(0, -pad)
      }

      // 解析JSON
      const messageStr = decrypted.toString('utf8', 16) // 跳过前16位随机字符串
      const message = JSON.parse(messageStr)

      return message
    } catch (error) {
      this.logger.error('解密Webhook消息失败:', error)
      throw new Error('消息解密失败')
    }
  }

  /**
   * 处理Webhook事件
   */
  async handleWebhookEvent(event: WebhookEvent, corpId: string): Promise<any> {
    try {
      // 获取企业配置
      const config = this.activeConfigs.get(corpId)
      if (!config) {
        throw new Error(`未找到企业 ${corpId} 的活跃配置`)
      }

      // 验证签名
      if (!this.validateWebhookSignature(
        event.timestamp.toString(),
        event.nonce,
        event.encrypt,
        event.msg_signature,
        config.webhookToken
      )) {
        throw new Error('Webhook签名验证失败')
      }

      // 解密消息
      const decryptedMessage = this.decryptWebhookMessage(event.encrypt, config.webhookAesKey)

      this.logger.log(`收到Webhook事件: ${decryptedMessage.action}`, decryptedMessage)

      // 处理不同类型的消息
      switch (decryptedMessage.action) {
        case 'send_msg':
          await this.handleSendMessage(decryptedMessage.msg, config)
          break
        case 'chat_audit':
          await this.handleChatAudit(decryptedMessage.msg, config)
          break
        case 'msg_audit':
          await this.handleMessageAudit(decryptedMessage.msg, config)
          break
        default:
          this.logger.warn(`未知的消息类型: ${decryptedMessage.action}`)
      }

      return { success: true, message: '处理成功' }
    } catch (error) {
      this.logger.error('处理Webhook事件失败:', error)
      throw error
    }
  }

  /**
   * 处理发送消息事件
   */
  private async handleSendMessage(message: any, config: WeWorkArchiveConfig): Promise<void> {
    try {
      const chatRecord = await this.messageProcessor.processMessage(message, config)

      if (chatRecord) {
        // 保存聊天记录
        await this.chatRecordRepository.save(chatRecord)

        // 触发AI分析
        await this.triggerEngine.processMessageTrigger(chatRecord)

        this.logger.log(`处理发送消息成功: ${chatRecord.msgid}`)
      }
    } catch (error) {
      this.logger.error('处理发送消息失败:', error)
    }
  }

  /**
   * 处理会话审计事件
   */
  private async handleChatAudit(message: any, config: WeWorkArchiveConfig): Promise<void> {
    try {
      this.logger.log('处理会话审计事件:', message)

      // 这里可以根据具体需求实现会话级别的审计逻辑
      // 例如：统计会话时长、参与人数、消息类型分布等
    } catch (error) {
      this.logger.error('处理会话审计失败:', error)
    }
  }

  /**
   * 处理消息审计事件
   */
  private async handleMessageAudit(message: any, config: WeWorkArchiveConfig): Promise<void> {
    try {
      this.logger.log('处理消息审计事件:', message)

      // 这里可以实现更详细的消息审计逻辑
      // 例如：敏感词检测、合规检查、风险预警等
    } catch (error) {
      this.logger.error('处理消息审计失败:', error)
    }
  }

  /**
   * 生成响应消息
   */
  generateResponseMessage(nonce: string, timestamp: string, encrypt: string): string {
    const response = {
      msgid: crypto.randomUUID(),
      timestamp,
      nonce,
      encrypt
    }

    return JSON.stringify(response)
  }

  /**
   * 加密响应消息
   */
  encryptResponseMessage(message: string, aesKey: string): string {
    try {
      // 生成随机字符串
      const randomStr = crypto.randomBytes(16).toString('hex').substring(0, 16)

      // 消息长度
      const msgLen = Buffer.byteLength(message, 'utf8')
      const msgLenBuffer = Buffer.alloc(4)
      msgLenBuffer.writeUInt32BE(msgLen, 0)

      // 组合数据
      const data = randomStr + msgLenBuffer.toString() + message

      // AES-256-CBC加密
      const key = Buffer.from(aesKey + '=', 'base64')
      const iv = key.slice(0, 16)

      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

      let encrypted = cipher.update(data, 'utf8')
      encrypted = Buffer.concat([encrypted, cipher.final()])

      return encrypted.toString('base64')
    } catch (error) {
      this.logger.error('加密响应消息失败:', error)
      throw new Error('消息加密失败')
    }
  }

  /**
   * 处理心跳检测
   */
  async handleHeartbeat(corpId: string): Promise<{ status: string; timestamp: number }> {
    const config = this.activeConfigs.get(corpId)
    if (!config) {
      throw new Error(`未找到企业 ${corpId} 的活跃配置`)
    }

    // 更新最后同步时间
    config.lastSyncTime = new Date()
    await this.archiveConfigRepository.save(config)

    return {
      status: 'ok',
      timestamp: Date.now()
    }
  }

  /**
   * 获取Webhook状态
   */
  async getWebhookStatus(corpId: string): Promise<{
    isActive: boolean
    lastSyncTime?: Date
    messageCount: number
  }> {
    const config = this.activeConfigs.get(corpId)
    if (!config) {
      return {
        isActive: false,
        messageCount: 0
      }
    }

    // 获取最近24小时的消息数量
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const messageCount = await this.chatRecordRepository.count({
      where: {
        webhookReceivedTime: yesterday
      }
    })

    return {
      isActive: config.isActiveSync,
      lastSyncTime: config.lastSyncTime,
      messageCount
    }
  }
}