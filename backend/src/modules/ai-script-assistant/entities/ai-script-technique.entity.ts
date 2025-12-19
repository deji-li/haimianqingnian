import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiScriptScenario } from './ai-script-scenario.entity';

@Entity('ai_script_technique')
export class AiScriptTechnique {
  @PrimaryGeneratedColumn({ comment: '技巧ID' })
  id: number;

  @Column({ name: 'scenario_id', comment: '场景ID' })
  scenarioId: number;

  @Column({ type: 'varchar', length: 100, name: 'technique_name', comment: '技巧名称' })
  techniqueName: string;

  @Column({ type: 'text', nullable: true, name: 'technique_desc', comment: '技巧描述' })
  techniqueDesc: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'keywords', comment: '用于知识库匹配的关键词（逗号分隔）' })
  keywords: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序' })
  sortOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联关系
  @ManyToOne(() => AiScriptScenario, scenario => scenario.techniques)
  @JoinColumn({ name: 'scenario_id' })
  scenario: AiScriptScenario;

}