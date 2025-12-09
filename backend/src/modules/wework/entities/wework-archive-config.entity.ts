import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export type ArchiveType = 'all' | 'department' | 'user'

@Entity('wework_archive_configs')
@Index('idx_corp_id', ['corpId'])
@Index('idx_is_active', ['isActive'])
export class WeWorkArchiveConfig {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 64, name: 'corp_id' })
  corpId: string

  @Column({ type: 'int', name: 'archive_id' })
  archiveId: number

  @Column({ type: 'varchar', length: 255, name: 'archive_name' })
  archiveName: string

  @Column({
    type: 'enum',
    enum: ['all', 'department', 'user'],
    default: 'all',
    name: 'archive_type'
  })
  archiveType: ArchiveType

  @Column({ type: 'json', name: 'department_ids', nullable: true })
  departmentIds: number[]

  @Column({ type: 'json', name: 'user_ids', nullable: true })
  userIds: string[]

  @Column({ type: 'datetime', name: 'archive_start_time', nullable: true })
  archiveStartTime: Date

  @Column({ type: 'datetime', name: 'archive_end_time', nullable: true })
  archiveEndTime: Date

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean

  @Column({ type: 'boolean', default: true, name: 'sync_enabled' })
  syncEnabled: boolean

  @Column({ type: 'boolean', default: true, name: 'ai_analysis_enabled' })
  aiAnalysisEnabled: boolean

  // Webhook配置
  @Column({ type: 'varchar', length: 500, name: 'webhook_url', nullable: true })
  webhookUrl: string

  @Column({ type: 'varchar', length: 255, name: 'webhook_token', nullable: true })
  webhookToken: string

  @Column({ type: 'varchar', length: 255, name: 'webhook_aes_key', nullable: true })
  webhookAesKey: string

  // 同步配置
  @Column({ type: 'int', default: 60, name: 'sync_interval_minutes' })
  syncIntervalMinutes: number

  @Column({ type: 'datetime', name: 'last_sync_time', nullable: true })
  lastSyncTime: Date

  @Column({ type: 'varchar', length: 64, name: 'created_by', nullable: true })
  createdBy: string

  @Column({ type: 'varchar', length: 64, name: 'updated_by', nullable: true })
  updatedBy: string

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date

  @UpdateDateColumn({ name: 'updated_time' })
  updatedTime: Date

  // 业务方法
  get isActiveSync(): boolean {
    return this.isActive && this.syncEnabled
  }

  get isActiveAI(): boolean {
    return this.isActive && this.aiAnalysisEnabled
  }

  get hasWebhook(): boolean {
    return !!(this.webhookUrl && this.webhookToken && this.webhookAesKey)
  }

  get syncIntervalMilliseconds(): number {
    return this.syncIntervalMinutes * 60 * 1000
  }

  get archiveTimeRange(): { start?: Date; end?: Date } {
    return {
      start: this.archiveStartTime,
      end: this.archiveEndTime
    }
  }
}