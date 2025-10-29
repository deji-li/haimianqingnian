import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { SalesTarget } from './entities/sales-target.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesTarget])],
  controllers: [TargetController],
  providers: [TargetService],
  exports: [TargetService, TypeOrmModule],
})
export class TargetModule {}
