import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiScriptAssistantController } from './ai-script-assistant.controller';
import { AiScriptAssistantService } from './ai-script-assistant.service';
import { AiScriptConfigService } from './ai-script-config.service';
import { AiScriptConfigController } from './ai-script-config.controller';
import {
  AiScriptConversation,
  AiScriptMessage,
  AiScriptScenario,
  AiScriptTechnique,
  AiScriptFeedback,
  AiScriptRecommendation,
  AiScriptPromptConfig,
} from './entities/index';
import { Customer } from '../customer/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { AiSharedModule } from '../../common/services/ai/ai-shared.module';
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiScriptConversation,
      AiScriptMessage,
      AiScriptScenario,
      AiScriptTechnique,
      AiScriptFeedback,
      AiScriptRecommendation,
      AiScriptPromptConfig,
      Customer,
      User,
    ]),
    AiSharedModule,
    forwardRef(() => EnterpriseKnowledgeModule),
  ],
  controllers: [AiScriptAssistantController, AiScriptConfigController],
  providers: [AiScriptAssistantService, AiScriptConfigService],
  exports: [AiScriptAssistantService, AiScriptConfigService],
})
export class AiScriptAssistantModule {}