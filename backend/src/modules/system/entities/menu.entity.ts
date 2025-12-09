import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // 菜单名称（路由name）

  @Column({ length: 100 })
  title: string; // 菜单标题（显示名称）

  @Column({ length: 200, nullable: true })
  path: string; // 路由路径

  @Column({ length: 200, nullable: true })
  component: string; // 组件路径

  @Column({ length: 50, nullable: true })
  icon: string; // 图标名称

  @Column({ name: 'parent_id', nullable: true })
  parentId: number; // 父菜单ID

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number; // 排序顺序

  @Column({ type: 'boolean', default: true })
  visible: boolean; // 是否可见

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 状态：1启用 0禁用

  @Column({ name: 'permission_code', length: 100, nullable: true })
  permissionCode: string; // 关联的权限代码

  @Column({ length: 200, nullable: true })
  redirect: string; // 重定向路径

  @Column({ name: 'always_show', type: 'boolean', default: false })
  alwaysShow: boolean; // 是否总是显示根菜单

  @Column({ type: 'boolean', default: false })
  hidden: boolean; // 是否隐藏（不显示在菜单中）

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
