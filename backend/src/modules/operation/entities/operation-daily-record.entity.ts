import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OperationAccount } from './operation-account.entity';

@Entity('operation_daily_records')
export class OperationDailyRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'report_date', type: 'date', comment: '日报日期' })
  reportDate: Date;

  @Column({ name: 'account_id', comment: '账号ID' })
  accountId: number;

  @Column({ name: 'operator_id', comment: '运营人员ID' })
  operatorId: number;

  @Column({ name: 'update_count', type: 'int', default: 0, comment: '更新次数' })
  updateCount: number;

  @Column({
    name: 'content_tags',
    length: 255,
    nullable: true,
    comment: '内容类型标签（逗号分隔）',
  })
  contentTags: string;

  @Column({ name: 'view_min', type: 'int', default: 0, comment: '浏览量最小值' })
  viewMin: number;

  @Column({ name: 'view_max', type: 'int', default: 0, comment: '浏览量最大值' })
  viewMax: number;

  @Column({ name: 'play_min', type: 'int', default: 0, comment: '播放量最小值' })
  playMin: number;

  @Column({ name: 'play_max', type: 'int', default: 0, comment: '播放量最大值' })
  playMax: number;

  @Column({ name: 'comment_min', type: 'int', default: 0, comment: '评论数最小值' })
  commentMin: number;

  @Column({ name: 'comment_max', type: 'int', default: 0, comment: '评论数最大值' })
  commentMax: number;

  @Column({ name: 'message_min', type: 'int', default: 0, comment: '私信数最小值' })
  messageMin: number;

  @Column({ name: 'message_max', type: 'int', default: 0, comment: '私信数最大值' })
  messageMax: number;

  @Column({
    name: 'account_status_changed',
    type: 'tinyint',
    default: 0,
    comment: '账号状态是否变化',
  })
  accountStatusChanged: number;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: ['正常', '风险', '封号', '掉号'],
    nullable: true,
    comment: '新状态',
  })
  newStatus: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联
  @ManyToOne(() => OperationAccount)
  @JoinColumn({ name: 'account_id' })
  account: OperationAccount;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  // 虚拟字段
  accountName?: string;
  operatorName?: string;
  platformType?: string;
  city?: string;
}
