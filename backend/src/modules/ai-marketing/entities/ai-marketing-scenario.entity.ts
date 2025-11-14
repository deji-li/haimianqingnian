import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_marketing_scenarios')
@Index('uk_scenario_key', ['scenarioKey'], { unique: true })
@Index('idx_category', ['scenarioCategory'])
@Index('idx_active', ['isActive'])
export class AiMarketingScenario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scenario_key', length: 50, unique: true, comment: '场景标识' })
  scenarioKey: string;

  @Column({ name: 'scenario_name', length: 100, comment: '场景名称' })
  scenarioName: string;

  @Column({ name: 'scenario_category', length: 50, comment: '场景分类' })
  scenarioCategory: string;

  @Column({ type: 'text', nullable: true, comment: '场景描述' })
  description: string;

  @Column({
    name: 'model_provider',
    type: 'enum',
    enum: ['deepseek', 'doubao'],
    default: 'deepseek',
    comment: 'AI供应商',
  })
  modelProvider: string;

  @Column({ name: 'model_name', length: 100, nullable: true, comment: '具体模型名称' })
  modelName: string;

  @Column({ name: 'system_prompt', type: 'text', nullable: true, comment: '系统提示词' })
  systemPrompt: string;

  @Column({ name: 'user_prompt_template', type: 'text', comment: '用户提示词模板' })
  userPromptTemplate: string;

  @Column({ name: 'required_variables', type: 'json', nullable: true, comment: '必需变量列表' })
  requiredVariables: string[];

  @Column({ name: 'optional_variables', type: 'json', nullable: true, comment: '可选变量列表' })
  optionalVariables: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.3, comment: '温度参数' })
  temperature: number;

  @Column({ name: 'max_tokens', type: 'int', default: 2000, comment: '最大token数' })
  maxTokens: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序号' })
  sortOrder: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
