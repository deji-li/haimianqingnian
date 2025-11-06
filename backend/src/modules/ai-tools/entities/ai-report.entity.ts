import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_reports')
export class AiReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  reportType: string; // 周报/月报/季度报告

  @Column({ length: 50 })
  reportPeriod: string; // 2025-W01/2025-01/2025-Q1

  @Column({ length: 50, nullable: true })
  targetType: string; // 个人/团队/全公司

  @Column({ nullable: true })
  targetId: number;

  @Column({ type: 'json', nullable: true })
  reportData: any; // 报告数据（结构化）

  @Column({ type: 'json', nullable: true })
  keyMetrics: any; // 关键指标

  @Column({ type: 'json', nullable: true })
  aiInsights: string[]; // AI洞察发现

  @Column({ type: 'json', nullable: true })
  problems: string[]; // 问题诊断

  @Column({ type: 'json', nullable: true })
  recommendations: string[]; // 改进建议

  @Column({
    type: 'enum',
    enum: ['生成中', '已完成', '失败'],
    default: '生成中',
  })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  generateTime: Date;

  @Column({ length: 50, default: 'AI自动生成' })
  generator: string;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;
}
