import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { WeWorkChatRecord } from './wework-chat-record.entity'

export type TriggerType = 'keyword' | 'message_type' | 'time_interval' | 'customer_status'
export type ActionType = 'ai_analysis' | 'tag_update' | 'sales_notification' | 'followup_reminder'

@Entity('wework_ai_trigger_rules')
@Index('idx_trigger_type', ['triggerType'])
@Index('idx_is_active', ['isActive'])
@Index('idx_priority', ['priority'])
export class WeWorkTriggerRule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, name: 'rule_name' })
  ruleName: string

  @Column({
    type: 'enum',
    enum: ['keyword', 'message_type', 'time_interval', 'customer_status'],
    name: 'trigger_type'
  })
  triggerType: TriggerType

  @Column({ type: 'json', name: 'trigger_conditions' })
  triggerConditions: Record<string, any>

  @Column({
    type: 'enum',
    enum: ['ai_analysis', 'tag_update', 'sales_notification', 'followup_reminder'],
    name: 'action_type'
  })
  actionType: ActionType

  @Column({ type: 'json', name: 'action_config' })
  actionConfig: Record<string, any>

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean

  @Column({ type: 'int', default: 0, name: 'priority' })
  priority: number

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 64, name: 'created_by', nullable: true })
  createdBy: string

  @Column({ type: 'varchar', length: 64, name: 'updated_by', nullable: true })
  updatedBy: string

  // 关联关系
  @ManyToOne(() => WeWorkChatRecord, { nullable: true })
  @JoinColumn({ name: 'chat_record_id' })
  chatRecord: WeWorkChatRecord

  @CreateDateColumn({ name: 'created_time' })
  createdTime: Date

  @UpdateDateColumn({ name: 'updated_time' })
  updatedTime: Date

  // 业务方法
  get keywords(): string[] {
    return this.triggerConditions?.keywords || []
  }

  get messageTypes(): string[] {
    return this.triggerConditions?.messageTypes || []
  }

  get intervalHours(): number {
    return this.triggerConditions?.intervalHours || 24
  }

  get notificationType(): string {
    return this.actionConfig?.notificationType || 'general'
  }

  get reminderType(): string {
    return this.actionConfig?.reminderType || 'followup'
  }

  get delayHours(): number {
    return this.actionConfig?.delayHours || 0
  }

  get messageCount(): number {
    return this.actionConfig?.messageCount || 50
  }

  get tags(): string[] {
    return this.actionConfig?.tags || []
  }
}