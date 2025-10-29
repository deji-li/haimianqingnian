import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('key_result')
export class KeyResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'okr_id', comment: 'OKR ID' })
  okrId: number;

  @Column({ length: 200, comment: '关键结果描述' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'target_value',
    comment: '目标值',
  })
  targetValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'current_value',
    default: 0,
    comment: '当前值',
  })
  currentValue: number;

  @Column({ length: 20, nullable: true, comment: '单位' })
  unit: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '完成度（0-100）',
  })
  progress: number;

  @Column({ type: 'int', default: 0, comment: '权重（用于计算总进度）' })
  weight: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
