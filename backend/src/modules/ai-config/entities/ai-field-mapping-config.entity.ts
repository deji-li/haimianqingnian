import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AI字段映射配置实体
 * 表名：ai_field_mapping_configs（复数+下划线）
 */
@Entity('ai_field_mapping_configs')
@Index('uk_scenario_source', ['mappingScenario', 'sourceField'], { unique: true })
@Index('idx_scenario', ['mappingScenario'])
@Index('idx_active', ['isActive'])
export class AiFieldMappingConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'mapping_scenario',
    length: 50,
    nullable: false,
    comment: '映射场景key',
  })
  mappingScenario: string;

  @Column({
    name: 'scenario_name',
    length: 100,
    nullable: false,
    comment: '场景名称',
  })
  scenarioName: string;

  @Column({
    name: 'source_field',
    length: 100,
    nullable: false,
    comment: '源字段名',
  })
  sourceField: string;

  @Column({
    name: 'target_field',
    length: 100,
    nullable: false,
    comment: '目标字段名',
  })
  targetField: string;

  @Column({
    name: 'mapping_type',
    type: 'enum',
    enum: ['direct', 'transform', 'ai_extract'],
    default: 'direct',
    comment: '映射类型：direct-直接映射, transform-转换映射, ai_extract-AI提取',
  })
  mappingType: string;

  @Column({
    name: 'transform_rule',
    type: 'text',
    nullable: true,
    comment: '转换规则（JS表达式或AI场景key）',
  })
  transformRule: string;

  @Column({
    name: 'data_type',
    length: 50,
    nullable: true,
    comment: '数据类型',
  })
  dataType: string;

  @Column({
    name: 'default_value',
    length: 500,
    nullable: true,
    comment: '默认值',
  })
  defaultValue: string;

  @Column({
    name: 'is_required',
    type: 'boolean',
    default: false,
    comment: '是否必填',
  })
  isRequired: boolean;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    name: 'display_order',
    type: 'int',
    default: 0,
    comment: '显示顺序',
  })
  displayOrder: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注说明',
  })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
