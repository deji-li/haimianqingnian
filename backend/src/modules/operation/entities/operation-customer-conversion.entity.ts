import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('operation_customer_conversions')
export class OperationCustomerConversion {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ comment: '客户ID' })
  @Index()
  customerId: number

  @Column({ comment: '运营人员ID' })
  @Index()
  operatorId: number

  @Column({ length: 50, nullable: true, comment: '流量平台（小红书、抖音、视频号）' })
  trafficPlatform: string

  @Column({ length: 50, nullable: true, comment: '流量城市' })
  trafficCity: string

  @Column({
    length: 50,
    default: '引流',
    comment: '转化阶段（引流、初步接触、深度咨询、试听体验、成交转化）'
  })
  @Index()
  conversionStage: string

  @Column({ type: 'datetime', nullable: true, comment: '转化时间' })
  conversionTime: Date

  @Column({ type: 'text', nullable: true, comment: '备注' })
  notes: string

  @CreateDateColumn({ comment: '创建时间' })
  @Index()
  createdAt: Date

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date
}