import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingCoachController } from './training-coach.controller';
import { ScriptGeneratorService } from './services/script-generator.service';
import { TrainingSessionService } from './services/training-session.service';
import { EvaluationService } from './services/evaluation.service';
import { TrainingStatsService } from './services/training-stats.service';
import { TrainingConfigService } from './services/training-config.service';
import { TrainingScript } from './entities/training-script.entity';
import { CustomerPersona } from './entities/customer-persona.entity';
import { TrainingSession } from './entities/training-session.entity';
import { BusinessConfig } from '../business-config/entities/business-config.entity';
import { AiConfigCallerService } from '@/common/services/ai/ai-config-caller.service';
import { AiSharedModule } from '@/common/services/ai/ai-shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingScript,
      CustomerPersona,
      TrainingSession,
      BusinessConfig,
    ]),
    AiSharedModule,
  ],
  controllers: [TrainingCoachController],
  providers: [
    ScriptGeneratorService,
    TrainingSessionService,
    EvaluationService,
    TrainingStatsService,
    TrainingConfigService,
  ],
  exports: [
    ScriptGeneratorService,
    TrainingSessionService,
    EvaluationService,
    TrainingStatsService,
    TrainingConfigService,
  ],
})
export class TrainingCoachModule {}