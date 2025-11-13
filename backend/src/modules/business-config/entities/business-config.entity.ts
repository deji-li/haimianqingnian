import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('business_config')
export class BusinessConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_key', length: 100, unique: true })
  configKey: string;

  @Column({ name: 'config_value', type: 'json' })
  configValue: any;

  @Column({ name: 'config_category', length: 50 })
  configCategory: string;

  @Column({ name: 'description', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
