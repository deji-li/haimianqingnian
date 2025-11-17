import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseKnowledgeController } from './enterprise-knowledge.controller';
import { EnterpriseKnowledgeService } from './enterprise-knowledge.service';
import { InitKnowledgeController } from './init-knowledge.controller';
import { InitKnowledgeService } from './init-knowledge.service';
import { MiningKnowledgeController } from './mining-knowledge.controller';
import { MiningKnowledgeService } from './mining-knowledge.service';
import { FeedbackKnowledgeController } from './feedback-knowledge.controller';
import { FeedbackKnowledgeService } from './feedback-knowledge.service';
import { IndustryQuestionController } from './industry-question.controller';
import { IndustryQuestionService } from './industry-question.service';
import { KnowledgeUsageService } from './knowledge-usage.service';
import { KnowledgeIntegrationService } from './knowledge-integration.service';
import {
  EnterpriseKnowledgeBase,
  KnowledgeFeedback,
  KnowledgePendingReview,
  EnterpriseBasicInfo,
  IndustryQuestionLibrary,
  KnowledgeUsageLog,
} from './entities/index';
import { AiSharedModule } from '../../common/services/ai/ai-shared.module';
import { AiChatRecord } from '../ai-chat/entities/ai-chat-record.entity';
import { Customer } from '../customer/entities/customer.entity';

/**
 * 企业知识库模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnterpriseKnowledgeBase,
      KnowledgeFeedback,
      KnowledgePendingReview,
      EnterpriseBasicInfo,
      IndustryQuestionLibrary,
      KnowledgeUsageLog,
      AiChatRecord, // 用于AI挖掘
      Customer, // 用于关联客户信息
    ]),
    AiSharedModule, // 导入AI共享模块(AiConfigCallerService, FieldMappingService)
  ],
  controllers: [
    EnterpriseKnowledgeController,
    InitKnowledgeController,
    MiningKnowledgeController,
    FeedbackKnowledgeController,
    IndustryQuestionController,
  ],
  providers: [
    EnterpriseKnowledgeService,
    InitKnowledgeService,
    MiningKnowledgeService,
    FeedbackKnowledgeService,
    IndustryQuestionService,
    KnowledgeUsageService,
    KnowledgeIntegrationService,
  ],
  exports: [
    EnterpriseKnowledgeService,
    InitKnowledgeService,
    MiningKnowledgeService,
    FeedbackKnowledgeService,
    IndustryQuestionService,
    KnowledgeUsageService,
    KnowledgeIntegrationService,
  ],
})
export class EnterpriseKnowledgeModule {}
