import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderSyncController } from './order-sync.controller';
import { OrderSyncService } from './order-sync.service';
import { HaimianApiService } from './haimian-api.service';
import { OrderSyncScheduler } from './order-sync.scheduler';
import { OrderSyncLog } from './entities/order-sync-log.entity';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Campus } from '../system/entities/campus.entity';
import { BusinessConfigModule } from '../business-config/business-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderSyncLog, Order, Customer, Campus]),
    BusinessConfigModule,
  ],
  controllers: [OrderSyncController],
  providers: [OrderSyncService, HaimianApiService, OrderSyncScheduler],
  exports: [OrderSyncService],
})
export class OrderSyncModule {}
