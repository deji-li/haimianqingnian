import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('follow_up_reminder_config')
export class FollowUpReminderConfig {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: '配置ID'
  })
  id: number;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 1,
    comment: '是否启用系统提醒：0-禁用，1-启用'
  })
  enabled: boolean;

  @Column({
    type: 'json',
    comment: '各意向等级的配置JSON'
  })
  config: Record<string, {
    rounds: Array<{
      intervalDays: number;
      message: string;
    }>;
    reminderMethods: string[];
  }>;

  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    comment: '更新时间'
  })
  updated_at: Date;
}
