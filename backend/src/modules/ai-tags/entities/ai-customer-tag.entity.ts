import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_customer_tags')
export class AiCustomerTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'tag_category', length: 50, comment: '标签分类' })
  tagCategory: string;

  @Column({ name: 'tag_name', length: 100, comment: '标签名称' })
  tagName: string;

  @Column({ name: 'tag_value', length: 255, nullable: true, comment: '标签值' })
  tagValue: string;

  @Column({
    type: 'enum',
    enum: ['AI自动', '人工添加'],
    default: 'AI自动',
  })
  source: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence: number;

  @Column({ name: 'from_chat_record_id', nullable: true })
  fromChatRecordId: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
