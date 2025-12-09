import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';
import { MarketingAssistantController } from './marketing-assistant.controller';
import { MarketingAssistantService } from './marketing-assistant.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContentService } from './marketing-content.service';
import { AiMarketingScenario } from './entities/ai-marketing-scenario.entity';
import { AiMarketingContent } from './entities/ai-marketing-content.entity';
import { AiMarketingHistory } from './entities/ai-marketing-history.entity';
import { AiMarketingFeedback } from './entities/ai-marketing-feedback.entity';
import { AiCustomerInsights } from './entities/ai-customer-insights.entity';
import { Customer } from '../customer/entities/customer.entity';
import { EnterpriseKnowledgeBase } from '../enterprise-knowledge/entities/enterprise-knowledge-base.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigModule } from '../ai-config/ai-config.module';
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';
import { KnowledgeIntegrationService } from './knowledge-integration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiMarketingScenario,
      AiMarketingContent,
      AiMarketingHistory,
      AiMarketingFeedback,
      AiCustomerInsights,
      Customer,
      EnterpriseKnowledgeBase
    ]),
    AiConfigModule,
    EnterpriseKnowledgeModule,
  ],
  controllers: [AiMarketingController, MarketingAssistantController, MarketingContentController],
  providers: [AiMarketingService, MarketingAssistantService, MarketingContentService, DeepseekAnalysisService, KnowledgeIntegrationService],
  exports: [AiMarketingService, MarketingContentService, KnowledgeIntegrationService],
})
export class AiMarketingModule {}
