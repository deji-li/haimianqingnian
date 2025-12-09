import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_violation_rules')
export class AiViolationRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rule_name', length: 100, comment: '违规规则名称' })
  ruleName: string;

  @Column({ name: 'violation_type', length: 50, comment: '违规类型' })
  violationType: string;

  @Column({ name: 'keywords', type: 'json', comment: '违规关键词' })
  keywords: string[];

  @Column({
    name: 'severity',
    type: 'enum',
    enum: ['低', '中', '高'],
    default: '中',
    comment: '严重程度',
  })
  severity: string;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '规则说明' })
  description: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
