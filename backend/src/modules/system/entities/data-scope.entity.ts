import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('data_scopes')
export class DataScope {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ length: 50 })
  module: string; // 模块名称：customer, order, user 等

  @Column({ name: 'scope_type', length: 20, default: 'all' })
  scopeType: string; // all: 全部, dept: 本部门, self: 仅自己, campus: 本校区, custom: 自定义

  @Column({ name: 'scope_value', type: 'json', nullable: true })
  scopeValue: any; // 自定义范围配置，如指定部门ID、校区ID等

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
