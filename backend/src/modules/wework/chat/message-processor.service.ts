import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WeWorkChatRecord } from '../entities/wework-chat-record.entity'
import { WeWorkArchiveConfig } from '../entities/wework-archive-config.entity'
import { WeWorkVoiceToTextService } from './voice-to-text.service'
import { DoubaoOcrService } from '../../../common/services/ai/doubao-ocr.service'
import { AiCacheService } from '../../../common/services/ai/ai-cache.service'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface WeWorkMessage {
  msgid: string
  action: string
  from?: string
  to?: string
  msgtype: string
  content: Record<string, any>
  timestamp: number
  seq?: number
  roomid?: string
  external_userid?: string
  userid?: string
}

@Injectable()
export class WeWorkMessageProcessor {
  private readonly logger = new Logger(WeWorkMessageProcessor.name)

  constructor(
    @InjectRepository(WeWorkChatRecord)
    private readonly chatRecordRepository: Repository<WeWorkChatRecord>,
    private readonly voiceToTextService: WeWorkVoiceToTextService,
    private readonly ocrService: DoubaoOcrService,
    private readonly cacheService: AiCacheService,
  ) {}

  /**
   * 处理消息
   */
  async processMessage(message: WeWorkMessage, config: WeWorkArchiveConfig): Promise<WeWorkChatRecord | null> {
    try {
      this.logger.log(`处理消息: ${message.msgtype} - ${message.msgid}`)

      // 创建聊天记录实体
      const chatRecord = this.createChatRecord(message)

      // 根据消息类型处理
      switch (message.msgtype) {
        case 'text':
          await this.processTextMessage(chatRecord, message.content)
          break

        case 'image':
          await this.processImageMessage(chatRecord, message.content)
          break

        case 'voice':
          await this.processVoiceMessage(chatRecord, message.content)
          break

        case 'video':
          await this.processVideoMessage(chatRecord, message.content)
          break

        case 'file':
        case 'doc':
          await this.processFileMessage(chatRecord, message.content)
          break

        case 'location':
          await this.processLocationMessage(chatRecord, message.content)
          break

        case 'link':
          await this.processLinkMessage(chatRecord, message.content)
          break

        case 'business_card':
          await this.processBusinessCardMessage(chatRecord, message.content)
          break

        case 'meeting_invite':
          await this.processMeetingInviteMessage(chatRecord, message.content)
          break

        case 'emotion':
          await this.processEmotionMessage(chatRecord, message.content)
          break

        case 'weapp':
          await this.processWeAppMessage(chatRecord, message.content)
          break

        default:
          this.logger.warn(`不支持的消息类型: ${message.msgtype}`)
          return null
      }

      // 设置处理状态
      chatRecord.processingStatus = 'completed'
      chatRecord.archiveSessionId = config.archiveId.toString()
      chatRecord.archiveSequence = message.seq
      chatRecord.archiveTime = new Date(message.timestamp)
      chatRecord.webhookReceivedTime = new Date()

      return chatRecord
    } catch (error) {
      this.logger.error(`处理消息失败 ${message.msgid}:`, error)

      // 创建失败记录
      const chatRecord = this.createChatRecord(message)
      chatRecord.processingStatus = 'failed'
      return chatRecord
    }
  }

  /**
   * 创建聊天记录基础实体
   */
  private createChatRecord(message: WeWorkMessage): WeWorkChatRecord {
    const chatRecord = new WeWorkChatRecord()

    chatRecord.id = uuidv4()
    chatRecord.msgid = message.msgid
    chatRecord.externalUserId = message.external_userid
    chatRecord.userid = message.userid
    chatRecord.msgtype = message.msgtype
    chatRecord.msgcontent = message.content
    chatRecord.msgtime = message.timestamp
    chatRecord.processingStatus = 'processing'

    return chatRecord
  }

  /**
   * 处理文本消息
   */
  private async processTextMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      content: content.content || content.text || '',
      ...content
    }
    this.logger.log(`处理文本消息: ${chatRecord.msgcontent.content.substring(0, 100)}`)
  }

  /**
   * 处理图片消息
   */
  private async processImageMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    try {
      const imageUrl = content.url || content.image_url
      const thumbnailUrl = content.thumbnail_url

      chatRecord.msgcontent = {
        url: imageUrl,
        thumbnail_url: thumbnailUrl,
        pic_size: content.pic_size,
        md5: content.md5,
        ...content
      }

      // 下载并处理图片OCR
      if (imageUrl) {
        try {
          const imageBuffer = await this.downloadImage(imageUrl)
          const ocrResult = await this.ocrService.recognizeText(imageBuffer)

          chatRecord.ocrResult = ocrResult.text
          chatRecord.processingStatus = 'completed'

          this.logger.log(`图片OCR识别完成: ${ocrResult.text.substring(0, 100)}`)
        } catch (ocrError) {
          this.logger.error('图片OCR识别失败:', ocrError)
          chatRecord.ocrResult = null
        }
      }
    } catch (error) {
      this.logger.error('处理图片消息失败:', error)
    }
  }

  /**
   * 处理语音消息
   */
  private async processVoiceMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    try {
      const voiceUrl = content.url || content.voice_url
      const duration = content.duration || content.voice_duration

      chatRecord.msgcontent = {
        url: voiceUrl,
        duration: duration,
        size: content.size,
        format: content.format || 'silk',
        ...content
      }

      // 下载并处理语音转文字
      if (voiceUrl) {
        try {
          const voiceBuffer = await this.downloadVoice(voiceUrl)
          const transcription = await this.voiceToTextService.transcribeVoice(voiceBuffer)

          chatRecord.voiceText = transcription.text
          chatRecord.processingStatus = 'completed'

          this.logger.log(`语音转文字完成: ${transcription.text.substring(0, 100)}`)
        } catch (transcribeError) {
          this.logger.error('语音转文字失败:', transcribeError)
          chatRecord.voiceText = null
        }
      }
    } catch (error) {
      this.logger.error('处理语音消息失败:', error)
    }
  }

  /**
   * 处理视频消息
   */
  private async processVideoMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      url: content.url || content.video_url,
      duration: content.duration,
      size: content.size,
      thumbnail_url: content.thumbnail_url,
      ...content
    }
    this.logger.log(`处理视频消息: ${content.duration}秒`)
  }

  /**
   * 处理文件消息
   */
  private async processFileMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    try {
      const fileUrl = content.url || content.file_url
      const fileName = content.filename || content.title

      chatRecord.msgcontent = {
        url: fileUrl,
        filename: fileName,
        size: content.size,
        file_type: content.file_type || content.type,
        ...content
      }

      // 尝试解析文档内容
      if (fileUrl && this.isTextFile(fileName)) {
        try {
          const fileContent = await this.extractTextContent(fileUrl, fileName)
          chatRecord.fileContent = fileContent
          this.logger.log(`文件内容解析完成: ${fileName}`)
        } catch (extractError) {
          this.logger.error(`文件内容解析失败: ${fileName}`, extractError)
          chatRecord.fileContent = null
        }
      }
    } catch (error) {
      this.logger.error('处理文件消息失败:', error)
    }
  }

  /**
   * 处理位置消息
   */
  private async processLocationMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      latitude: content.latitude,
      longitude: content.longitude,
      address: content.address,
      title: content.title,
      ...content
    }
    this.logger.log(`处理位置消息: ${content.address}`)
  }

  /**
   * 处理链接消息
   */
  private async processLinkMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      url: content.url,
      title: content.title,
      description: content.description,
      image_url: content.image_url,
      ...content
    }
    this.logger.log(`处理链接消息: ${content.title}`)
  }

  /**
   * 处理名片消息
   */
  private async processBusinessCardMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      userid: content.userid,
      realname: content.realname,
      avatar: content.avatar,
      corp_name: content.corp_name,
      ...content
    }
    this.logger.log(`处理名片消息: ${content.realname}`)
  }

  /**
   * 处理会议邀请消息
   */
  private async processMeetingInviteMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      meeting_id: content.meeting_id,
      meeting_title: content.meeting_title,
      meeting_time: content.meeting_time,
      meeting_location: content.meeting_location,
      ...content
    }
    this.logger.log(`处理会议邀请: ${content.meeting_title}`)
  }

  /**
   * 处理表情消息
   */
  private async processEmotionMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      emotion_md5: content.emotion_md5,
      emotion_url: content.emotion_url,
      emotion_width: content.emotion_width,
      emotion_height: content.emotion_height,
      ...content
    }
    this.logger.log(`处理表情消息: ${content.emotion_md5}`)
  }

  /**
   * 处理小程序消息
   */
  private async processWeAppMessage(chatRecord: WeWorkChatRecord, content: Record<string, any>): Promise<void> {
    chatRecord.msgcontent = {
      appid: content.appid,
      title: content.title,
      description: content.description,
      pagepath: content.pagepath,
      username: content.username,
      ...content
    }
    this.logger.log(`处理小程序消息: ${content.title}`)
  }

  /**
   * 下载图片
   */
  private async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`)
      }
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      this.logger.error('下载图片失败:', error)
      throw error
    }
  }

  /**
   * 下载语音
   */
  private async downloadVoice(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`下载语音失败: ${response.statusText}`)
      }
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      this.logger.error('下载语音失败:', error)
      throw error
    }
  }

  /**
   * 判断是否为文本文件
   */
  private isTextFile(fileName: string): boolean {
    const textExtensions = ['.txt', '.doc', '.docx', '.pdf', '.rtf']
    const ext = path.extname(fileName).toLowerCase()
    return textExtensions.includes(ext)
  }

  /**
   * 提取文件文本内容
   */
  private async extractTextContent(url: string, fileName: string): Promise<string> {
    try {
      const fileBuffer = await this.downloadFile(url)
      const ext = path.extname(fileName).toLowerCase()

      switch (ext) {
        case '.txt':
          return fileBuffer.toString('utf8')

        case '.pdf':
          // 这里需要集成PDF解析库，如pdf-parse
          // return await this.extractPdfText(fileBuffer)
          return 'PDF文件内容解析功能待实现'

        case '.docx':
          // 这里需要集成Word解析库，如mammoth
          // return await this.extractDocxText(fileBuffer)
          return 'Word文档内容解析功能待实现'

        default:
          return '不支持此文件类型的文本提取'
      }
    } catch (error) {
      this.logger.error('提取文件文本内容失败:', error)
      throw error
    }
  }

  /**
   * 下载文件
   */
  private async downloadFile(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`下载文件失败: ${response.statusText}`)
      }
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      this.logger.error('下载文件失败:', error)
      throw error
    }
  }

  /**
   * 批量处理消息
   */
  async batchProcessMessages(messages: WeWorkMessage[], config: WeWorkArchiveConfig): Promise<{
    success: number
    failed: number
    records: WeWorkChatRecord[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      records: [] as WeWorkChatRecord[]
    }

    for (const message of messages) {
      try {
        const record = await this.processMessage(message, config)
        if (record) {
          results.records.push(record)

          if (record.processingStatus === 'completed') {
            results.success++
          } else {
            results.failed++
          }
        }
      } catch (error) {
        this.logger.error(`批量处理消息失败 ${message.msgid}:`, error)
        results.failed++
      }
    }

    this.logger.log(`批量处理完成: 成功 ${results.success}, 失败 ${results.failed}`)
    return results
  }
}