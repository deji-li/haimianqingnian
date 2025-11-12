import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiKnowledgeController } from './ai-knowledge.controller';
import { AiKnowledgeService } from './ai-knowledge.service';
import { AiKnowledgeBase } from './entities/ai-knowledge-base.entity';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiKnowledgeBase]),
    ConfigModule,
    AiConfigModule,
  ],
  controllers: [AiKnowledgeController],
  providers: [AiKnowledgeService, DeepseekAnalysisService],
  exports: [AiKnowledgeService],
})
export class AiKnowledgeModule {}
