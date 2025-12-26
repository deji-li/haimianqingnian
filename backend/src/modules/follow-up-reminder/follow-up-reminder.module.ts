import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { FollowUpReminderController } from './follow-up-reminder.controller';
import { FollowUpReminderConfig } from './entities/follow-up-config.entity';
import { FollowUpReminderTask } from './entities/follow-up-task.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Notification } from '../notification/entities/notification.entity';
import { FollowUpReminderScheduler } from './follow-up-reminder.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FollowUpReminderConfig,
      FollowUpReminderTask,
      Customer,
      Notification,
    ]),
  ],
  controllers: [FollowUpReminderController],
  providers: [FollowUpReminderService, FollowUpReminderScheduler],
  exports: [FollowUpReminderService],
})
export class FollowUpReminderModule {}
