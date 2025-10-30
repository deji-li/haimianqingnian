import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Customer } from '../customer/entities/customer.entity';
import { Order } from '../order/entities/order.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { OperationDailyRecord } from '../operation/entities/operation-daily-record.entity';
import { OperationCommissionRecord } from '../operation/entities/operation-commission-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Order,
      CustomerFollowRecord,
      OperationDailyRecord,
      OperationCommissionRecord,
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
