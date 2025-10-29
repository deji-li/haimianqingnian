import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';
import { CommissionScheme } from './entities/commission-scheme.entity';
import { CommissionCalculation } from './entities/commission-calculation.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommissionScheme,
      CommissionCalculation,
      Order,
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
