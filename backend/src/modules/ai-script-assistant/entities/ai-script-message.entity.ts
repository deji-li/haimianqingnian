import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiScriptConversation } from './ai-script-conversation.entity';

@Entity('ai_script_message')
export class AiScriptMessage {
  @PrimaryGeneratedColumn({ comment: '消息ID' })
  id: number;

  @Column({ name: 'conversation_id', comment: '对话ID' })
  conversationId: number;

  @Column({
    type: 'enum',
    enum: ['user', 'assistant'],
    comment: '角色'
  })
  role: 'user' | 'assistant';

  @Column({ type: 'text', comment: '消息内容' })
  content: string;

  @Column({ type: 'text', nullable: true, name: 'thinking_process', comment: 'AI思考过程' })
  thinkingProcess: string | null;

  @Column({ type: 'json', nullable: true, name: 'knowledge_source', comment: '知识来源（知识库ID、标题等）' })
  knowledgeSource: any | null;

  @Column({
    type: 'enum',
    enum: ['knowledge_direct', 'knowledge_hybrid', 'ai_generate'],
    nullable: true,
    name: 'source_type',
    comment: '来源类型'
  })
  sourceType: 'knowledge_direct' | 'knowledge_hybrid' | 'ai_generate' | null;

  @Column({ type: 'json', nullable: true, name: 'suggestions', comment: '改进方向建议' })
  suggestions: any | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'confidence_score', comment: 'AI置信度' })
  confidenceScore: number | null;

  @Column({ type: 'int', nullable: true, name: 'processing_time', comment: '处理时间(毫秒)' })
  processingTime: number | null;

  @Column({ type: 'int', default: 0, name: 'usage_count', comment: '使用次数' })
  usageCount: number;

  @Column({ type: 'int', default: 0, name: 'success_usage_count', comment: '成功使用次数' })
  successUsageCount: number;

  @Column({ type: 'boolean', default: false, name: 'is_featured', comment: '是否为精选话术' })
  isFeatured: boolean;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  // 关联关系
  @ManyToOne(() => AiScriptConversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiScriptConversation;

}