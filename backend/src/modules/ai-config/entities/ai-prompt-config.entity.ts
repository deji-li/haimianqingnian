import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AI提示词配置实体
 * 表名：ai_prompt_configs（复数+下划线）
 */
@Entity('ai_prompt_configs')
@Index('uk_scenario_provider', ['scenarioKey', 'modelProvider'], { unique: true })
@Index('idx_category', ['scenarioCategory'])
@Index('idx_active', ['isActive'])
export class AiPromptConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scenario_key', length: 50, nullable: false, comment: '场景唯一标识' })
  scenarioKey: string;

  @Column({ name: 'scenario_name', length: 100, nullable: false, comment: '场景名称' })
  scenarioName: string;

  @Column({ name: 'scenario_category', length: 50, nullable: false, comment: '场景分类' })
  scenarioCategory: string;

  @Column({
    name: 'model_provider',
    type: 'enum',
    enum: ['deepseek', 'doubao'],
    nullable: false,
    comment: 'AI供应商',
  })
  modelProvider: string;

  @Column({ name: 'model_name', length: 100, nullable: true, comment: '具体模型名称' })
  modelName: string;

  @Column({ name: 'prompt_content', type: 'text', nullable: false, comment: '提示词内容' })
  promptContent: string;

  @Column({ name: 'system_prompt', type: 'text', nullable: true, comment: '系统提示词' })
  systemPrompt: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.3,
    nullable: true,
    comment: '温度参数',
  })
  temperature: number;

  @Column({ name: 'max_tokens', type: 'int', default: 2000, nullable: true, comment: '最大token数' })
  maxTokens: number;

  @Column({ type: 'json', nullable: true, comment: '支持的变量列表' })
  variables: string[];

  @Column({ name: 'variable_description', type: 'text', nullable: true, comment: '变量说明' })
  variableDescription: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'int', default: 1, comment: '版本号' })
  version: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
