import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiMarketingController } from './ai-marketing.controller';
import { AiMarketingService } from './ai-marketing.service';
import { AiMarketingScenario } from './entities/ai-marketing-scenario.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiMarketingScenario]),
    AiConfigModule,
  ],
  controllers: [AiMarketingController],
  providers: [AiMarketingService, DeepseekAnalysisService],
  exports: [AiMarketingService],
})
export class AiMarketingModule {}
