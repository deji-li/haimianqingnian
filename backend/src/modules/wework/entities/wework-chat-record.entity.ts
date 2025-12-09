import { Entity, PrimaryColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Customer } from '../../customer/entities/customer.entity'
import { AiChatRecord } from '../../ai-chat/entities/ai-chat-record.entity'
import { WeWorkTriggerRule } from './wework-trigger-rule.entity'

@Entity('wework_chat_records')
@Index('idx_external_userid', ['externalUserId'])
@Index('idx_customer_id', ['customerId'])
@Index('idx_archive_session', ['archiveSessionId'])
@Index('idx_processing_status', ['processingStatus'])
@Index('idx_ai_analysis_status', ['aiAnalysisStatus'])
@Index('idx_msgtime', ['msgtime'])
export class WeWorkChatRecord {
  @PrimaryColumn({ type: 'varchar', length: 64, name: 'id' })
  id: string

  @Column({ type: 'varchar', length: 64, name: 'msgid', unique: true })
  msgid: string

  @Column({ type: 'varchar', length: 64, name: 'external_userid', nullable: true })
  externalUserId: string

  @Column({ type: 'varchar', length: 64, name: 'userid', nullable: true })
  userid: string

  @Column({ type: 'varchar', length: 32, name: 'msgtype' })
  msgtype: string

  @Column({ type: 'json', name: 'msgcontent' })
  msgcontent: Record<string, any>

  @Column({ type: 'bigint', name: 'msgtime' })
  msgtime: number

  // 消息处理状态
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    name: 'processing_status'
  })
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'

  @Column({ type: 'text', name: 'ocr_result', nullable: true })
  ocrResult: string

  @Column({ type: 'text', name: 'voice_text', nullable: true })
  voiceText: string

  @Column({ type: 'text', name: 'file_content', nullable: true })
  fileContent: string

  // AI分析相关
  @Column({ type: 'int', name: 'customer_id', nullable: true })
  customerId: number

  @Column({ type: 'int', name: 'ai_chat_record_id', nullable: true })
  aiChatRecordId: number

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    name: 'ai_analysis_status'
  })
  aiAnalysisStatus: 'pending' | 'processing' | 'completed' | 'failed'

  @Column({ type: 'json', name: 'ai_analysis_result', nullable: true })
  aiAnalysisResult: Record<string, any>

  @Column({ type: 'json', name: 'ai_insights', nullable: true })
  aiInsights: Record<string, any>

  // 会话内容存档相关
  @Column({ type: 'varchar', length: 64, name: 'archive_session_id', nullable: true })
  archiveSessionId: string

  @Column({ type: 'bigint', name: 'archive_sequence', nullable: true })
  archiveSequence: number

  @Column({ type: 'datetime', name: 'archive_time', nullable: true })
  archiveTime: Date

  @Column({ type: 'datetime', name: 'webhook_received_time', nullable: true })
  webhookReceivedTime: Date

  // 智能触发相关
  @Column({ type: 'boolean', default: false, name: 'trigger_analysis' })
  triggerAnalysis: boolean

  @Column({ type: 'boolean', default: false, name: 'auto_tag_updated' })
  autoTagUpdated: boolean

  @Column({ type: 'boolean', default: false, name: 'sales_notified' })
  salesNotified: boolean

  // 关联关系
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer

  @ManyToOne(() => AiChatRecord, { nullable: true })
  @JoinColumn({ name: 'ai_chat_record_id' })
  aiChatRecord: AiChatRecord

  @OneToMany(() => WeWorkTriggerRule, rule => rule.chatRecord)
  triggerRules: WeWorkTriggerRule[]

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date

  @UpdateDateColumn({ name: 'updated_time' })
  updatedTime: Date

  // 虚拟字段 - 方便访问文本内容
  get textContent(): string {
    if (this.msgtype === 'text') {
      return this.msgcontent?.content || ''
    }

    if (this.ocrResult && this.msgtype === 'image') {
      return this.ocrResult
    }

    if (this.voiceText && this.msgtype === 'voice') {
      return this.voiceText
    }

    if (this.fileContent && ['file', 'doc'].includes(this.msgtype)) {
      return this.fileContent
    }

    return ''
  }

  // 获取消息发送时间
  get messageTime(): Date {
    return new Date(this.msgtime)
  }

  // 是否为发送方
  get isFromSales(): boolean {
    return this.userid !== undefined && this.userid !== null
  }

  // 是否为接收方
  get isFromCustomer(): boolean {
    return this.externalUserId !== undefined && this.externalUserId !== null
  }

  // 获取文件URL（如果有）
  get fileUrl(): string | null {
    return this.msgcontent?.url || null
  }

  // 获取缩略图URL（如果有）
  get thumbnailUrl(): string | null {
    return this.msgcontent?.thumbnail_url || null
  }

  // 获取媒体时长（语音/视频）
  get duration(): number | null {
    return this.msgcontent?.duration || null
  }

  // 获取文件大小
  get fileSize(): number | null {
    return this.msgcontent?.filesize || null
  }

  // 获取文件名
  get fileName(): string | null {
    return this.msgcontent?.filename || null
  }
}