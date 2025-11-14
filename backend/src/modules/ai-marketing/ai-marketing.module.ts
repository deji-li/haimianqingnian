import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContentService } from './marketing-content.service';
import { AiMarketingScenario } from './entities/ai-marketing-scenario.entity';
import { AiMarketingContent } from './entities/ai-marketing-content.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiMarketingScenario, AiMarketingContent]),
    AiConfigModule,
  ],
  controllers: [AiMarketingController, MarketingContentController],
  providers: [AiMarketingService, MarketingContentService, DeepseekAnalysisService],
  exports: [AiMarketingService, MarketingContentService],
})
export class AiMarketingModule {}
