import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('file')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'original_name', length: 255, comment: '原始文件名' })
  originalName: string;

  @Column({ name: 'file_name', length: 255, comment: '存储文件名' })
  fileName: string;

  @Column({ name: 'file_path', length: 500, comment: '文件路径' })
  filePath: string;

  @Column({ name: 'file_size', type: 'int', comment: '文件大小（字节）' })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100, comment: '文件类型' })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: ['avatar', 'customer_attachment', 'order_contract', 'ai_chat', 'other'],
    comment: '文件用途',
  })
  category: string;

  @Column({ name: 'related_id', nullable: true, comment: '关联ID' })
  relatedId: number;

  @Column({ name: 'upload_user_id', comment: '上传用户ID' })
  uploadUserId: number;

  @CreateDateColumn({ name: 'create_time', comment: '上传时间' })
  createTime: Date;
}
