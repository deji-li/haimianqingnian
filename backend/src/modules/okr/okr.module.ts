import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OkrService } from './okr.service';
import { OkrController } from './okr.controller';
import { Okr } from './entities/okr.entity';
import { KeyResult } from './entities/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Okr, KeyResult])],
  controllers: [OkrController],
  providers: [OkrService],
  exports: [OkrService],
})
export class OkrModule {}
