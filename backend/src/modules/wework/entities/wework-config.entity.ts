import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('wework_configs')
export class WeWorkConfig {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'corp_id', length: 64, comment: '企业ID' })
  corpId: string

  @Column({ name: 'app_secret', length: 255, comment: '应用Secret' })
  appSecret: string

  @Column({ name: 'token', length: 255, nullable: true, comment: '回调Token' })
  token?: string

  @Column({ name: 'aes_key', length: 255, nullable: true, comment: '回调AESKey' })
  aesKey?: string

  @Column({ name: 'webhook_url', length: 500, nullable: true, comment: 'Webhook回调地址' })
  webhookUrl?: string

  @Column({ name: 'api_access_token', type: 'text', nullable: true, comment: 'API访问令牌缓存' })
  apiAccessToken?: string

  @Column({ name: 'token_expire_time', type: 'datetime', nullable: true, comment: 'Token过期时间' })
  tokenExpireTime?: Date

  @Column({ name: 'sync_strategy', type: 'json', nullable: true, comment: '同步策略配置' })
  syncStrategy?: any

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date
}