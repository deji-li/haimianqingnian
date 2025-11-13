import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AiPromptConfig } from './ai-prompt-config.entity';

/**
 * AI提示词变量配置实体
 * 表名：ai_prompt_variables
 */
@Entity('ai_prompt_variables')
@Index('uk_prompt_variable', ['promptConfigId', 'variableKey'], { unique: true })
@Index('idx_scenario_key', ['scenarioKey'])
@Index('idx_active', ['isActive'])
export class AiPromptVariable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'prompt_config_id', nullable: false, comment: 'AI提示词配置ID' })
  promptConfigId: number;

  @Column({ name: 'scenario_key', length: 50, nullable: false, comment: '场景标识（冗余字段）' })
  scenarioKey: string;

  @Column({ name: 'variable_key', length: 50, nullable: false, comment: '变量标识' })
  variableKey: string;

  @Column({ name: 'variable_name', length: 100, nullable: false, comment: '变量名称' })
  variableName: string;

  @Column({ name: 'variable_description', type: 'text', nullable: true, comment: '变量说明' })
  variableDescription: string;

  @Column({ name: 'data_type', length: 20, default: 'text', comment: '数据类型' })
  dataType: string;

  @Column({ name: 'is_required', type: 'boolean', default: false, comment: '是否必填' })
  isRequired: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @Column({ name: 'default_value', length: 500, nullable: true, comment: '默认值' })
  defaultValue: string;

  @Column({ name: 'example_value', type: 'text', nullable: true, comment: '示例值' })
  exampleValue: string;

  @Column({ name: 'validation_rule', length: 500, nullable: true, comment: '验证规则' })
  validationRule: string;

  @Column({ name: 'display_order', type: 'int', default: 0, comment: '显示顺序' })
  displayOrder: number;

  @Column({ name: 'category', length: 50, nullable: true, comment: '变量分类' })
  category: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @ManyToOne(() => AiPromptConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prompt_config_id' })
  promptConfig: AiPromptConfig;
}
