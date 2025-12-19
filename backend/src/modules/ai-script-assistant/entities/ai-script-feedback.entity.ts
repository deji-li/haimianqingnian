import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AiScriptMessage } from './ai-script-message.entity';

@Entity('ai_script_feedback')
export class AiScriptFeedback {
  @PrimaryGeneratedColumn({ comment: '反馈ID' })
  id: number;

  @Column({ name: 'message_id', comment: '消息ID' })
  messageId: number;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['like', 'dislike'],
    name: 'feedback_type',
    comment: '反馈类型'
  })
  feedbackType: 'like' | 'dislike';

  @Column({ type: 'text', nullable: true, name: 'feedback_reason', comment: '反馈原因' })
  feedbackReason: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_learned', comment: '是否已学习到知识库' })
  isLearned: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  // 关联关系
  @ManyToOne(() => AiScriptMessage, message => message.id)
  @JoinColumn({ name: 'message_id' })
  message: AiScriptMessage;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

}