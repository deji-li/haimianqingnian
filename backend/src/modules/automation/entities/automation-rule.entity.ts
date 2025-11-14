import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RuleType {
  AUTO_ASSIGN = 'auto_assign', // 自动分配
  AUTO_REMIND = 'auto_remind', // 自动提醒
  AUTO_TAG = 'auto_tag', // 自动打标签
}

export enum RuleStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export enum TriggerType {
  NEW_CUSTOMER = 'new_customer', // 新客户创建时
  FOLLOW_TIME = 'follow_time', // 到达回访时间
  NO_FOLLOW = 'no_follow', // 长时间未跟进
  INTENT_CHANGE = 'intent_change', // 意向变化
}

@Entity('automation_rules')
export class AutomationRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: '规则名称' })
  name: string;

  @Column({
    type: 'enum',
    enum: RuleType,
    comment: '规则类型',
  })
  ruleType: RuleType;

  @Column({
    type: 'enum',
    enum: TriggerType,
    comment: '触发类型',
  })
  triggerType: TriggerType;

  @Column({
    type: 'json',
    nullable: true,
    comment: '触发条件（JSON格式）',
  })
  triggerConditions: Record<string, any>;

  @Column({
    type: 'json',
    comment: '执行动作（JSON格式）',
  })
  actions: Record<string, any>;

  @Column({
    type: 'enum',
    enum: RuleStatus,
    default: RuleStatus.ENABLED,
    comment: '规则状态',
  })
  status: RuleStatus;

  @Column({ type: 'int', default: 0, comment: '优先级（数字越大优先级越高）' })
  priority: number;

  @Column({ type: 'int', default: 0, comment: '执行次数' })
  executionCount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_execution_time',
    comment: '最后执行时间',
  })
  lastExecutionTime: Date;

  @Column({ type: 'text', nullable: true, comment: '规则描述' })
  description: string;

  @Column({ name: 'created_by', nullable: true, comment: '创建人ID' })
  createdBy: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
