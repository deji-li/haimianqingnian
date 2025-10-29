import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../system/entities/role.entity';
import { UserCampus } from './user-campus.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'real_name', length: 50 })
  realName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'superior_id', nullable: true })
  superiorId: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @Column({ name: 'campus_id', nullable: true })
  campusId: number;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'last_login_time', type: 'datetime', nullable: true })
  lastLoginTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // 多对多关系：用户可以绑定多个校区
  @OneToMany(() => UserCampus, (userCampus) => userCampus.user)
  campuses: UserCampus[];

  // 关联的角色代码（从 roles 表查询后设置）
  roleCode?: string;
  roleName?: string;
  campusIds?: number[];
}
