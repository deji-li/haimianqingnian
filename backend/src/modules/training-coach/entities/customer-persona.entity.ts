import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customer_personas')
export class CustomerPersona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['hesitant', 'comparative', 'impatient', 'professional', 'price_sensitive']
  })
  personality_type: string;

  @Column({ type: 'json' })
  characteristics: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['formal', 'casual', 'technical', 'direct']
  })
  communication_style: string;

  @Column({
    type: 'enum',
    enum: ['analytical', 'emotional', 'collaborative', 'authoritative']
  })
  decision_making_style: string;

  @Column({ type: 'json' })
  typical_objections: string[];

  @Column({ type: 'json' })
  response_patterns: Record<string, any>;

  @Column({ type: 'json' })
  difficulty_settings: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}