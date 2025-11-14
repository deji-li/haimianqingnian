import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutomationRule } from './automation-rule.entity';

export enum ExecutionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('automation_logs')
export class AutomationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rule_id', comment: '规则ID' })
  ruleId: number;

  @ManyToOne(() => AutomationRule)
  @JoinColumn({ name: 'rule_id' })
  rule: AutomationRule;

  @Column({ name: 'target_type', length: 50, comment: '目标类型（customer/order）' })
  targetType: string;

  @Column({ name: 'target_id', comment: '目标ID' })
  targetId: number;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    comment: '执行状态',
  })
  status: ExecutionStatus;

  @Column({ type: 'json', nullable: true, comment: '执行结果详情' })
  result: Record<string, any>;

  @Column({ type: 'text', nullable: true, name: 'error_message', comment: '错误信息' })
  errorMessage: string;

  @Column({ type: 'int', default: 0, name: 'execution_time', comment: '执行耗时（毫秒）' })
  executionTime: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
