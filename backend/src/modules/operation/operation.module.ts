import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationController } from './operation.controller';
import { OperationService } from './operation.service';
import { OperationExtendedController } from './operation-extended.controller';
import { OperationExtendedService } from './operation-extended.service';
import { ConversionTrackingService } from './conversion-tracking.service';
import { OperationAccount } from './entities/operation-account.entity';
import { OperationDailyRecord } from './entities/operation-daily-record.entity';
import { OperationCommissionRecord } from './entities/operation-commission-record.entity';
import { OperationCustomerConversion } from './entities/operation-customer-conversion.entity';
import { OperationNotification } from './entities/operation-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperationAccount,
      OperationDailyRecord,
      OperationCommissionRecord,
      OperationCustomerConversion,
      OperationNotification,
    ]),
  ],
  controllers: [OperationController, OperationExtendedController],
  providers: [OperationService, OperationExtendedService, ConversionTrackingService],
  exports: [OperationService, OperationExtendedService, ConversionTrackingService],
})
export class OperationModule {}
