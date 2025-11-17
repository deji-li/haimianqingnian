import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiToolsController } from './ai-tools.controller';
import { AiToolsService } from './ai-tools.service';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './entities/index';
import { Customer } from '../customer/entities/customer.entity';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { AiKnowledgeBase } from '../ai-knowledge/entities/ai-knowledge-base.entity';
import { AiMarketingContent } from '../ai-marketing/entities/ai-marketing-content.entity';
import { User } from '../user/entities/user.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigModule } from '../ai-config/ai-config.module';
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiScript,
      AiRiskAlert,
      AiTrainingRecord,
      AiReport,
      Customer,
      AiChatRecord,
      AiKnowledgeBase,
      AiMarketingContent,
      User,
    ]),
    ConfigModule,
    AiConfigModule,
    EnterpriseKnowledgeModule,
  ],
  controllers: [AiToolsController],
  providers: [AiToolsService, DeepseekAnalysisService],
  exports: [AiToolsService],
})
export class AiToolsModule {}
