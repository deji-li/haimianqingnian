import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_knowledge_base')
export class AiKnowledgeBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: '知识分类' })
  category: string;

  @Column({ length: 200, comment: '知识标题' })
  title: string;

  @Column({ type: 'text', comment: '知识内容' })
  content: string;

  @Column({ length: 500, nullable: true, comment: '关键词（逗号分隔）' })
  keywords: string;

  @Column({ type: 'int', default: 0, comment: '优先级' })
  priority: number;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'creator_id', nullable: true })
  creatorId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
