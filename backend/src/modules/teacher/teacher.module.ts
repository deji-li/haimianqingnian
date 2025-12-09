import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher } from './entities/teacher.entity';
import { TeacherCampus } from './entities/teacher-campus.entity';
import { Campus } from '../system/entities/campus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, TeacherCampus, Campus])
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}