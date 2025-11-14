import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_marketing_content_library')
export class AiMarketingContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'content_type', length: 50 })
  contentType: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'pain_points', type: 'json', nullable: true })
  painPoints: string[];

  @Column({ name: 'interest_points', type: 'json', nullable: true })
  interestPoints: string[];

  @Column({ name: 'generation_params', type: 'json', nullable: true })
  generationParams: Record<string, any>;

  @Column({ length: 50, nullable: true })
  purpose: string;

  @Column({ length: 50, nullable: true })
  style: string;

  @Column({ name: 'word_count', length: 50, nullable: true })
  wordCount: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ name: 'use_count', default: 0 })
  useCount: number;

  @Column({ name: 'last_used_time', type: 'datetime', nullable: true })
  lastUsedTime: Date;

  @Column({ name: 'is_favorite', type: 'tinyint', default: 0 })
  isFavorite: number;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
