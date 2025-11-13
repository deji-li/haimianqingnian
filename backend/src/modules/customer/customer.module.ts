import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { LifecycleController } from './lifecycle.controller';
import { LifecycleService } from './lifecycle.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Customer } from './entities/customer.entity';
import { CustomerFollowRecord } from './entities/customer-follow-record.entity';
import { CustomerLifecycle } from './entities/customer-lifecycle.entity';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { Order } from '../order/entities/order.entity';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiCacheService } from '../../common/services/ai/ai-cache.service';
import { AiConfigModule } from '../ai-config/ai-config.module';
import { AiTagsModule } from '../ai-tags/ai-tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerFollowRecord, CustomerLifecycle, AiChatRecord, Order]),
    ConfigModule,
    AiConfigModule,
    AiTagsModule,
  ],
  controllers: [CustomerController, LifecycleController, AnalyticsController],
  providers: [
    CustomerService,
    LifecycleService,
    AnalyticsService,
    DoubaoOcrService,
    DeepseekAnalysisService,
    AiCacheService,
  ],
  exports: [CustomerService, LifecycleService, AnalyticsService, TypeOrmModule],
})
export class CustomerModule {}
