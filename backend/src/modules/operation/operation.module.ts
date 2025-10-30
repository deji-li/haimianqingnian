import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationController } from './operation.controller';
import { OperationService } from './operation.service';
import { OperationAccount } from './entities/operation-account.entity';
import { OperationDailyRecord } from './entities/operation-daily-record.entity';
import { OperationCommissionRecord } from './entities/operation-commission-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperationAccount,
      OperationDailyRecord,
      OperationCommissionRecord,
    ]),
  ],
  controllers: [OperationController],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
