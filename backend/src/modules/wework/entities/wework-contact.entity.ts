import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { Customer } from '../../customer/entities/customer.entity'

@Entity('wework_contacts')
@Index(['external_userid'])
@Index(['customer_id'])
@Index(['sync_status'])
export class WeWorkContact {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'external_userid', length: 64, unique: true, comment: '外部联系人ID' })
  externalUserId: string

  @Column({ name: 'name', length: 100, nullable: true, comment: '客户姓名' })
  name?: string

  @Column({ name: 'avatar', length: 500, nullable: true, comment: '头像URL' })
  avatar?: string

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['single', 'external'],
    default: 'external',
    comment: '联系人类型'
  })
  type: 'single' | 'external'

  @Column({
    name: 'gender',
    type: 'enum',
    enum: ['unknown', 'male', 'female'],
    default: 'unknown',
    comment: '性别'
  })
  gender: 'unknown' | 'male' | 'female'

  @Column({ name: 'position', length: 100, nullable: true, comment: '职位' })
  position?: string

  @Column({ name: 'corp_name', length: 255, nullable: true, comment: '企业名称' })
  corpName?: string

  @Column({ name: 'external_profile', type: 'json', nullable: true, comment: '对外资料信息' })
  externalProfile?: any

  @Column({ name: 'follow_user_id', length: 64, nullable: true, comment: '添加了此外部联系人的企业成员userid' })
  followUserId?: string

  @Column({ name: 'remark', length: 255, nullable: true, comment: '备注' })
  remark?: string

  @Column({ name: 'add_time', type: 'datetime', nullable: true, comment: '添加时间' })
  addTime?: Date

  @Column({ name: 'tags', type: 'json', nullable: true, comment: '客户标签' })
  tags?: string[]

  @Column({ name: 'customer_id', nullable: true, comment: '关联CRM客户ID' })
  customerId?: number

  @Column({ name: 'sync_time', type: 'datetime', nullable: true, comment: '最后同步时间' })
  syncTime?: Date

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: ['pending', 'synced', 'failed'],
    default: 'pending',
    comment: '同步状态'
  })
  syncStatus: 'pending' | 'synced' | 'failed'

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除' })
  isDeleted: boolean

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date

  // 关联关系
  // @ManyToOne(() => Customer, customer => customer.weworkContacts)
  // @JoinColumn({ name: 'customer_id' })
  // customer?: Customer
}