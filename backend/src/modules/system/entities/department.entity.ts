import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('department')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_name', length: 100, comment: '部门名称' })
  departmentName: string;

  @Column({ name: 'parent_id', nullable: true, comment: '上级部门ID' })
  parentId: number;

  @Column({ name: 'manager_id', nullable: true, comment: '部门负责人ID' })
  managerId: number;

  @Column({ type: 'text', nullable: true, comment: '部门描述' })
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
