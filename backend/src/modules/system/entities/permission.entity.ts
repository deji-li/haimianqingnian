import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  code: string; // 权限代码，如：customer:create, customer:batch:update

  @Column({ length: 100 })
  name: string; // 权限名称

  @Column({ length: 50 })
  module: string; // 所属模块：customer, order, user, dashboard 等

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number; // 父权限ID，用于权限分组

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
