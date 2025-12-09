import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WeWorkEntities } from './entities'

// Phase 1-2 控制器和服务
import { WeWorkController } from './wework.controller'
import { WeWorkService } from './wework.service'
import { WeWorkApiService } from './api/wework-api.service'
import { WeWorkConfigService } from './config/wework-config.service'

// Phase 3 服务
import { WeWorkWebhookService } from './api/webhook.service'
import { WeWorkMessageProcessor } from './chat/message-processor.service'
import { WeWorkVoiceToTextService } from './chat/voice-to-text.service'
import { WeWorkAITriggerEngine } from './ai/trigger-engine.service'
import { WeWorkInsightUpdater } from './ai/insight-updater.service'

// Phase 2 同步服务
import { WeWorkSyncService } from './sync/wework-sync.service'
import { WeWorkSchedulerService } from './sync/scheduler.service'

@Module({
  imports: [
    TypeOrmModule.forFeature(WeWorkEntities),
  ],
  controllers: [WeWorkController],
  providers: [
    // Phase 1-2 服务
    WeWorkService,
    WeWorkApiService,
    WeWorkConfigService,

    // Phase 2 同步服务
    WeWorkSyncService,
    WeWorkSchedulerService,

    // Phase 3 服务
    WeWorkWebhookService,
    WeWorkMessageProcessor,
    WeWorkVoiceToTextService,
    WeWorkAITriggerEngine,
    WeWorkInsightUpdater,
  ],
  exports: [
    WeWorkService,
    WeWorkApiService,
    WeWorkConfigService,
    WeWorkSyncService,
    WeWorkSchedulerService,
    WeWorkWebhookService,
    WeWorkMessageProcessor,
    WeWorkVoiceToTextService,
    WeWorkAITriggerEngine,
    WeWorkInsightUpdater,
    TypeOrmModule.forFeature(WeWorkEntities),
  ],
})
export class WeWorkModule {}