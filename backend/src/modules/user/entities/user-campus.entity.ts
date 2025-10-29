import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_campus')
export class UserCampus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'campus_id' })
  campusId: number;

  @Column({ name: 'is_primary', type: 'tinyint', default: 0 })
  isPrimary: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @ManyToOne(() => User, (user) => user.campuses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
