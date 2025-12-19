import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { AiScriptMessage } from './ai-script-message.entity';
import { AiScriptScenario } from './ai-script-scenario.entity';
import { AiScriptTechnique } from './ai-script-technique.entity';

@Entity('ai_script_conversation')
export class AiScriptConversation {
  @PrimaryGeneratedColumn({ comment: '对话ID' })
  id: number;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'int', nullable: true, name: 'customer_id', comment: '客户ID（可选）' })
  customerId: number | null;

  @Column({
    type: 'enum',
    enum: ['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'],
    name: 'function_type',
    comment: '功能类型'
  })
  functionType: 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines';

  @Column({ type: 'int', nullable: true, name: 'scenario_id', comment: '场景ID' })
  scenarioId: number | null;

  @Column({ type: 'int', nullable: true, name: 'technique_id', comment: '技巧ID' })
  techniqueId: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'title', comment: '对话标题（AI生成摘要）' })
  title: string | null;

  @Column({ type: 'datetime', nullable: true, name: 'last_message_time', comment: '最后消息时间' })
  lastMessageTime: Date | null;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否活跃' })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer, customer => customer.id)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @ManyToOne(() => AiScriptScenario, { nullable: true })
  @JoinColumn({ name: 'scenario_id' })
  scenario: AiScriptScenario | null;

  @ManyToOne(() => AiScriptTechnique, { nullable: true })
  @JoinColumn({ name: 'technique_id' })
  technique: AiScriptTechnique | null;

  @OneToMany(() => AiScriptMessage, message => message.conversation)
  messages: AiScriptMessage[];

}