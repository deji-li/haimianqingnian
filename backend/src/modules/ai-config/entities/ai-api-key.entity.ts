import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * AI API密钥配置实体
 * 表名：ai_api_keys（复数+下划线）
 */
@Entity('ai_api_keys')
@Index('uk_provider', ['provider'], { unique: true })
export class AiApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['deepseek', 'doubao', 'baidu_ocr'],
    nullable: false,
    comment: 'AI供应商',
  })
  provider: string;

  @Column({ name: 'api_key', length: 500, nullable: false, comment: 'API密钥' })
  apiKey: string;

  @Column({ name: 'api_url', length: 500, nullable: false, comment: 'API地址' })
  apiUrl: string;

  @Column({
    name: 'endpoint_id',
    length: 200,
    nullable: true,
    comment: '端点ID（豆包专用）',
  })
  endpointId: string;

  @Column({
    name: 'model_name',
    length: 100,
    nullable: true,
    comment: '默认模型名称',
  })
  modelName: string;

  @Column({
    name: 'secret_key',
    length: 500,
    nullable: true,
    comment: 'Secret Key（百度OCR专用）',
  })
  secretKey: string;

  @Column({
    name: 'app_id',
    length: 200,
    nullable: true,
    comment: 'App ID（百度OCR专用）',
  })
  appId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true, comment: '备注说明' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
