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
import { Campus } from '../../system/entities/campus.entity';

@Entity('operation_accounts')
export class OperationAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'platform_type',
    type: 'enum',
    enum: ['小红书', '抖音', '视频号'],
    comment: '平台类型',
  })
  platformType: string;

  @Column({ name: 'account_name', length: 100, comment: '账号名称' })
  accountName: string;

  @Column({ name: 'account_id', length: 100, nullable: true, comment: '账号ID/链接' })
  accountId: string;

  @Column({ name: 'campus_id', comment: '关联校区ID' })
  campusId: number;

  @Column({ name: 'operator_id', comment: '负责运营人员ID' })
  operatorId: number;

  @Column({
    name: 'account_type',
    length: 50,
    default: '专业号',
    comment: '账号类型',
  })
  accountType: string;

  @Column({
    type: 'enum',
    enum: ['正常', '风险', '封号', '掉号'],
    default: '正常',
    comment: '账号状态',
  })
  status: string;

  @Column({ name: 'fans_count', type: 'int', default: 0, comment: '粉丝量' })
  fansCount: number;

  @Column({ name: 'total_likes', type: 'int', default: 0, comment: '总点赞量' })
  totalLikes: number;

  @Column({
    name: 'last_update_time',
    type: 'datetime',
    nullable: true,
    comment: '数据最后更新时间',
  })
  lastUpdateTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  // 关联
  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @ManyToOne(() => Campus)
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  // 虚拟字段
  operatorName?: string;
  campusName?: string;
}
