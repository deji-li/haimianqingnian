import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AiChatRecord } from './entities/ai-chat-record.entity';
import { Customer } from '../customer/entities/customer.entity';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiCacheService } from '../../common/services/ai/ai-cache.service';
import { AiTagsModule } from '../ai-tags/ai-tags.module';
import { AiToolsModule } from '../ai-tools/ai-tools.module';
import { AiConfigModule } from '../ai-config/ai-config.module';
import { AiMarketingModule } from '../ai-marketing/ai-marketing.module';
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiChatRecord, Customer]),
    ConfigModule,
    AiTagsModule,
    AiToolsModule,
    AiConfigModule,
    AiMarketingModule,
    EnterpriseKnowledgeModule, // 导入企业知识库模块
  ],
  controllers: [AiChatController, AiAssistantController],
  providers: [
    AiChatService,
    AiAssistantService,
    DoubaoOcrService,
    DeepseekAnalysisService,
    AiCacheService,
  ],
  exports: [AiChatService, AiAssistantService],
})
export class AiChatModule {}
