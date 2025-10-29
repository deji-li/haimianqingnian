import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TeamStatsService } from './team-stats.service';
import { TeamStatsController } from './team-stats.controller';
import { User } from './entities/user.entity';
import { UserCampus } from './entities/user-campus.entity';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerFollowRecord } from '../customer/entities/customer-follow-record.entity';
import { SalesTarget } from '../target/entities/sales-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserCampus,
      Order,
      Customer,
      CustomerFollowRecord,
      SalesTarget,
    ]),
  ],
  providers: [UserService, TeamStatsService],
  controllers: [UserController, TeamStatsController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
