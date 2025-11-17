import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiToolsController } from './ai-tools.controller';
import { AiToolsService } from './ai-tools.service';
import { AiScript, AiRiskAlert, AiTrainingRecord, AiReport } from './entities/index';
import { Customer } from '../customer/entities/customer.entity';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { EnterpriseKnowledgeBase } from '../enterprise-knowledge/entities/enterprise-knowledge-base.entity';
// import { AiMarketingContent } from '../ai-marketing/entities/ai-marketing-content.entity'; // TODO: Module deleted
import { User } from '../user/entities/user.entity';
// import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service'; // TODO: Service deleted
// import { AiConfigModule } from '../ai-config/ai-config.module'; // TODO: Module deleted
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
      EnterpriseKnowledgeBase,
      // AiMarketingContent, // TODO: Module deleted
      User,
    ]),
    ConfigModule,
    // AiConfigModule, // TODO: Module deleted
    EnterpriseKnowledgeModule,
  ],
  controllers: [AiToolsController],
  providers: [AiToolsService], // DeepseekAnalysisService removed - service deleted
  exports: [AiToolsService],
})
export class AiToolsModule {}
