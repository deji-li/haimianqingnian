import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('okr')
export class Okr {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, comment: 'OKR标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: 'OKR描述' })
  description: string;

  @Column({ name: 'owner_id', comment: '负责人ID' })
  ownerId: number;

  @Column({
    type: 'enum',
    enum: ['individual', 'team', 'company'],
    comment: 'OKR类型：individual-个人, team-团队, company-公司',
  })
  type: string;

  @Column({ name: 'start_date', type: 'date', comment: '开始日期' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', comment: '结束日期' })
  endDate: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
    comment: '状态：draft-草稿, active-进行中, completed-已完成, cancelled-已取消',
  })
  status: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '完成度（0-100）',
  })
  progress: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
