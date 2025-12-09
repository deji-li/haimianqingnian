import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AiMarketingHistory } from './ai-marketing-history.entity';

@Entity('ai_marketing_feedback')
export class AiMarketingFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'history_id', comment: '历史记录ID' })
  historyId: number;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ type: 'tinyint', nullable: true, comment: '评分：1-点踩，2-点赞' })
  rating: number;

  @Column({ name: 'feedback_type', length: 50, nullable: true, comment: '反馈类型' })
  feedbackType: string;

  @Column({ type: 'text', nullable: true, comment: '优化建议' })
  suggestion: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AiMarketingHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'history_id' })
  history: AiMarketingHistory;
}
