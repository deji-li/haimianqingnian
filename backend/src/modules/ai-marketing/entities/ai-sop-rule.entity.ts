import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_sop_rules')
export class AiSopRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rule_name', length: 100, comment: '规则名称' })
  ruleName: string;

  @Column({ name: 'rule_description', type: 'text', nullable: true, comment: '规则描述' })
  ruleDescription: string;

  @Column({ name: 'check_keywords', type: 'json', nullable: true, comment: '检查关键词' })
  checkKeywords: string[];

  @Column({ name: 'rule_category', length: 50, nullable: true, comment: '规则分类' })
  ruleCategory: string;

  @Column({ name: 'rule_order', type: 'int', default: 0, comment: '规则顺序' })
  ruleOrder: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
