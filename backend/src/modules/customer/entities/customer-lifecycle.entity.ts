import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer_lifecycle')
export class CustomerLifecycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ length: 50 })
  stage: string;

  @Column({ type: 'text', nullable: true, name: 'change_reason' })
  changeReason: string;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
