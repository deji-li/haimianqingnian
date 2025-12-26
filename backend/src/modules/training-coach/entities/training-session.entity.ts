import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingScript } from './training-script.entity';
import { CustomerPersona } from './customer-persona.entity';

@Entity('training_sessions')
export class TrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  script_id: number;

  @Column({ type: 'int' })
  customer_persona_id: number;

  // 关系定义
  @ManyToOne(() => TrainingScript)
  @JoinColumn({ name: 'script_id' })
  script: TrainingScript;

  @ManyToOne(() => CustomerPersona)
  @JoinColumn({ name: 'customer_persona_id' })
  customer_persona: CustomerPersona;

  @Column({ type: 'varchar', length: 200, nullable: true })
  session_name: string;

  @Column({
    type: 'enum',
    enum: ['preparing', 'active', 'paused', 'completed', 'abandoned'],
    default: 'preparing'
  })
  session_status: string;

  @Column({ type: 'json', nullable: true })
  training_goals: Record<string, any>;

  @Column({ type: 'int', default: 5 })
  max_rounds: number;

  @Column({ type: 'int', default: 0 })
  current_round: number;

  @Column({ type: 'json', nullable: true })
  conversation_history: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  session_metrics: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  final_score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  goal_achievement_rate: number;

  @Column({
    type: 'enum',
    enum: ['success', 'failure', 'partial'],
    nullable: true
  })
  completion_status: string;

  @Column({ type: 'datetime', nullable: true })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ type: 'datetime', nullable: true })
  last_activity_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}