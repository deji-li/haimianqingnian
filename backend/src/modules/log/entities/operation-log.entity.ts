import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('operation_log')
export class OperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '操作用户ID' })
  userId: number;

  @Column({ name: 'username', length: 100, comment: '用户名' })
  username: string;

  @Column({ length: 50, comment: '操作模块' })
  module: string;

  @Column({ length: 50, comment: '操作类型' })
  action: string;

  @Column({ type: 'text', nullable: true, comment: '操作详情' })
  detail: string;

  @Column({ name: 'ip_address', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column({ type: 'int', default: 1, comment: '状态：1-成功，0-失败' })
  status: number;

  @Column({ name: 'error_msg', type: 'text', nullable: true, comment: '错误信息' })
  errorMsg: string;

  @CreateDateColumn({ name: 'create_time', comment: '操作时间' })
  createTime: Date;
}
