import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Campus } from '../../system/entities/campus.entity';

@Entity('teacher_campuses')
@Unique(['teacher', 'campus']) // 确保一个老师不能重复关联同一个校区
@Index(['teacher', 'isPrimary']) // 优化查找老师主要校区的查询
@Index(['campus', 'isPrimary']) // 优化查找校区主要老师的查询
export class TeacherCampus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ name: 'campus_id' })
  @ManyToOne(() => Campus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @Column({
    name: 'is_primary',
    type: 'tinyint',
    default: 0,
    comment: '是否为主要校区：0=否，1=是'
  })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // 虚拟字段
  teacherId?: number;
  campusId?: number;
  campusName?: string;
}