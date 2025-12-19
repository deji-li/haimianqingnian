import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AiScriptTechnique } from './ai-script-technique.entity';

@Entity('ai_script_scenario')
export class AiScriptScenario {
  @PrimaryGeneratedColumn({ comment: '场景ID' })
  id: number;

  @Column({
    type: 'enum',
    enum: ['deal_assist', 'reply_assist', 'script_polish', 'opening_lines'],
    name: 'function_type',
    comment: '功能类型'
  })
  functionType: 'deal_assist' | 'reply_assist' | 'script_polish' | 'opening_lines';

  @Column({ type: 'varchar', length: 50, name: 'scenario_name', comment: '场景名称' })
  scenarioName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'scene_category', comment: '映射到知识库的sceneCategory' })
  sceneCategory: string | null;

  @Column({ type: 'text', nullable: true, name: 'scenario_desc', comment: '场景描述' })
  scenarioDesc: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序' })
  sortOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @OneToMany(() => AiScriptTechnique, technique => technique.scenario)
  techniques: AiScriptTechnique[];

}