import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { LifecycleController } from './lifecycle.controller';
import { LifecycleService } from './lifecycle.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Customer } from './entities/customer.entity';
import { CustomerFollowRecord } from './entities/customer-follow-record.entity';
import { CustomerLifecycle } from './entities/customer-lifecycle.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerFollowRecord, CustomerLifecycle, Order]),
  ],
  controllers: [CustomerController, LifecycleController, AnalyticsController],
  providers: [CustomerService, LifecycleService, AnalyticsService],
  exports: [CustomerService, LifecycleService, AnalyticsService, TypeOrmModule],
})
export class CustomerModule {}
