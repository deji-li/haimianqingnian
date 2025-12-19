import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiScriptScenario } from './ai-script-scenario.entity';
import { AiScriptTechnique } from './ai-script-technique.entity';
import { User } from '../../user/entities/user.entity';

@Entity('ai_script_prompt_config')
export class AiScriptPromptConfig {
  @PrimaryGeneratedColumn({ comment: '配置ID' })
  id: number;

  @Column({
    type: 'enum',
    enum: ['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'],
    comment: '功能类型'
  })
  functionType: 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines';

  @Column({ name: 'scenario_id', nullable: true, comment: '场景ID' })
  scenarioId: number | null;

  @Column({ name: 'technique_id', nullable: true, comment: '技巧ID' })
  techniqueId: number | null;

  @Column({ type: 'varchar', length: 100, comment: '配置名称' })
  configName: string;

  @Column({ type: 'text', nullable: true, comment: '系统提示词' })
  systemPrompt: string | null;

  @Column({ type: 'text', nullable: true, name: 'user_prompt_template', comment: '用户提示词模板' })
  userPromptTemplate: string | null;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.7,
    name: 'temperature',
    comment: '温度值'
  })
  temperature: number;

  @Column({ type: 'int', default: 2000, name: 'max_tokens', comment: '最大Token数' })
  maxTokens: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.7,
    name: 'knowledge_weight',
    comment: '知识库权重'
  })
  knowledgeWeight: number;

  @Column({ type: 'json', nullable: true, comment: '支持变量' })
  variables: string[] | null;

  @Column({ type: 'tinyint', width: 1, default: 1, comment: '是否启用' })
  isActive: boolean;

  @Column({ name: 'created_by', comment: '创建人' })
  createdBy: number;

  @Column({ name: 'updated_by', nullable: true, comment: '更新人' })
  updatedBy: number | null;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => AiScriptScenario, { nullable: true })
  @JoinColumn({ name: 'scenario_id' })
  scenario: AiScriptScenario | null;

  @ManyToOne(() => AiScriptTechnique, { nullable: true })
  @JoinColumn({ name: 'technique_id' })
  technique: AiScriptTechnique | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User | null;
}