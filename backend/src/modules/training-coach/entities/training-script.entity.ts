import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('training_scripts')
export class TrainingScript {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  scenario: string;

  @Column({
    type: 'enum',
    enum: ['简单', '普通', '困难'],
    default: '普通'
  })
  difficulty: string;

  @Column({
    type: 'enum',
    enum: ['AI生成', '手动创建', '聊天记录'],
    default: 'AI生成'
  })
  source_type: string;

  @Column({ type: 'int', nullable: true })
  source_chat_id: number;

  @Column({ type: 'text' })
  customer_background: string;

  @Column({ type: 'text' })
  training_goal: string;

  @Column({ type: 'json', nullable: true })
  key_objections: string[];

  @Column({ type: 'json', nullable: true })
  standard_scripts: string[];

  @Column({ type: 'json', nullable: true })
  dialogue_flow: Record<string, any>;

  @Column({ type: 'int', default: 10 })
  max_rounds: number;

  @Column({ type: 'int', default: 0 })
  objection_count: number;

  @Column({
    type: 'enum',
    enum: ['草稿', '已发布', '已下架'],
    default: '草稿'
  })
  status: string;

  @Column({ type: 'int', nullable: true })
  creator_id: number;

  @Column({ type: 'varchar', length: 50, default: '系统' })
  creator_type: string;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  avg_score: number;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;
}