import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('order_sync_logs')
export class OrderSyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sync_batch_id', length: 50, nullable: true })
  @Index()
  syncBatchId: string;

  @Column({ name: 'order_no', length: 50 })
  @Index()
  orderNo: string;

  @Column({ name: 'sync_type', length: 20, comment: '同步类型：create-新建, update-更新, skip-跳过, delete-删除' })
  syncType: string;

  @Column({ name: 'old_status', length: 50, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', length: 50, nullable: true })
  newStatus: string;

  @Column({ name: 'changes', type: 'json', nullable: true, comment: '变更字段详情' })
  changes: any;

  @Column({ name: 'external_data', type: 'json', nullable: true, comment: '海绵原始数据快照' })
  externalData: any;

  @CreateDateColumn({ name: 'sync_time' })
  @Index()
  syncTime: Date;

  @Column({ name: 'result', length: 20, comment: '同步结果：success-成功, failed-失败' })
  @Index()
  result: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'execution_time', nullable: true, comment: '执行耗时（毫秒）' })
  executionTime: number;
}
