import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SchemeType = 'fixed' | 'percentage' | 'tiered' | 'custom';

export interface FixedRule {
  amount: number; // 固定金额
}

export interface PercentageRule {
  percentage: number; // 百分比
  minAmount?: number; // 最小订单金额
  maxAmount?: number; // 最大订单金额
}

export interface TieredRule {
  tiers: Array<{
    minAmount: number;
    maxAmount: number | null;
    percentage: number;
  }>;
}

export interface CustomRule {
  formula: string; // 自定义公式
  variables: Record<string, any>; // 变量
}

export type SchemeRule =
  | FixedRule
  | PercentageRule
  | TieredRule
  | CustomRule;

export interface SchemeConditions {
  orderTags?: string[]; // 匹配的订单标签
  courses?: string[]; // 匹配的课程名称
  minOrderAmount?: number; // 最小订单金额
  maxOrderAmount?: number; // 最大订单金额
  campusIds?: number[]; // 匹配的校区ID
  departmentIds?: number[]; // 匹配的部门ID
}

@Entity('commission_schemes')
export class CommissionScheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['fixed', 'percentage', 'tiered', 'custom'],
    default: 'fixed',
  })
  type: SchemeType;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  rules: SchemeRule;

  @Column({ type: 'json', nullable: true })
  conditions: SchemeConditions;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
