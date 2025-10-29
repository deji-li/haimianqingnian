import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dictionary')
export class Dictionary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dict_type', length: 100, comment: '字典类型' })
  dictType: string;

  @Column({ name: 'dict_label', length: 100, comment: '字典标签' })
  dictLabel: string;

  @Column({ name: 'dict_value', length: 100, comment: '字典值' })
  dictValue: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
