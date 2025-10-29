import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('campus')
export class Campus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'campus_name', length: 100, comment: '校区名称' })
  campusName: string;

  @Column({ name: 'campus_code', length: 50, unique: true, comment: '校区编码' })
  campusCode: string;

  @Column({ length: 255, nullable: true, comment: '校区地址' })
  address: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'manager_id', nullable: true, comment: '校区负责人ID' })
  managerId: number;

  @Column({ type: 'text', nullable: true, comment: '校区描述' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}
