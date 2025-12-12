import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiQualityService } from './ai-quality.service'
import { AiQualityController } from './ai-quality.controller'
import { AiStaffQualityRecord } from '../ai-marketing/entities/ai-staff-quality-record.entity'
import { AiSopRule } from '../ai-marketing/entities/ai-sop-rule.entity'
import { AiViolationRule } from '../ai-marketing/entities/ai-violation-rule.entity'
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service'
import { AiConfigModule } from '../ai-config/ai-config.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiStaffQualityRecord,
      AiSopRule,
      AiViolationRule,
    ]),
    AiConfigModule,
  ],
  controllers: [AiQualityController],
  providers: [
    AiQualityService,
    DeepseekAnalysisService,
  ],
  exports: [AiQualityService],
})
export class AiQualityModule {}