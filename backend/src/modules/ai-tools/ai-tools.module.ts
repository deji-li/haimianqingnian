import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiToolsController } from './ai-tools.controller';
import { AiToolsService } from './ai-tools.service';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './entities/index';
import { Customer } from '../customer/entities/customer.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiScript, AiRiskAlert, AiTrainingRecord, AiReport, Customer]),
    ConfigModule,
  ],
  controllers: [AiToolsController],
  providers: [AiToolsService, DeepseekAnalysisService],
  exports: [AiToolsService],
})
export class AiToolsModule {}
