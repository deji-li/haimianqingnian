import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('wework_sync_logs')
export class WeWorkSyncLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'sync_type', length: 50, comment: '同步类型：contact/chat/config' })
  syncType: string

  @Column({ name: 'sync_direction', length: 20, comment: '同步方向：crm_to_wework/wework_to_crm' })
  syncDirection: string

  @Column({ name: 'total_count', type: 'int', default: 0, comment: '总记录数' })
  totalCount: number

  @Column({ name: 'success_count', type: 'int', default: 0, comment: '成功记录数' })
  successCount: number

  @Column({ name: 'failed_count', type: 'int', default: 0, comment: '失败记录数' })
  failedCount: number

  @Column({ name: 'sync_status', length: 20, default: 'running', comment: '同步状态：running/completed/failed' })
  syncStatus: string

  @Column({ name: 'start_time', type: 'datetime', nullable: true, comment: '开始时间' })
  startTime?: Date

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '结束时间' })
  endTime?: Date

  @Column({ name: 'duration_seconds', type: 'int', nullable: true, comment: '耗时（秒）' })
  durationSeconds?: number

  @Column({ name: 'error_message', type: 'text', nullable: true, comment: '错误信息' })
  errorMessage?: string

  @Column({ name: 'sync_details', type: 'json', nullable: true, comment: '同步详情' })
  syncDetails?: any

  @Column({ name: 'trigger_type', length: 20, nullable: true, comment: '触发类型：manual/scheduled/webhook' })
  triggerType?: string

  @Column({ name: 'trigger_user_id', length: 64, nullable: true, comment: '触发用户ID' })
  triggerUserId?: string

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date
}