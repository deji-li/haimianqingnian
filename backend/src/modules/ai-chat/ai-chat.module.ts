import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatRecord } from './entities/ai-chat-record.entity';
import { Customer } from '../customer/entities/customer.entity';
import { DoubaoOcrService } from '../../common/services/ai/doubao-ocr.service';
import { DeepseekAnalysisService } from '../../common/services/ai/deepseek-analysis.service';
import { AiCacheService } from '../../common/services/ai/ai-cache.service';
import { AiTagsModule } from '../ai-tags/ai-tags.module';
import { AiToolsModule } from '../ai-tools/ai-tools.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiChatRecord, Customer]),
    ConfigModule,
    AiTagsModule,
    AiToolsModule,
  ],
  controllers: [AiChatController],
  providers: [
    AiChatService,
    DoubaoOcrService,
    DeepseekAnalysisService,
    AiCacheService,
  ],
  exports: [AiChatService],
})
export class AiChatModule {}
