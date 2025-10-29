import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { CustomerModule } from '../customer/customer.module';
import { TargetModule } from '../target/target.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [CustomerModule, TargetModule, NotificationModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
