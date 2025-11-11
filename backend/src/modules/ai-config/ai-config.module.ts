import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfigController } from './ai-config.controller';
import { AiConfigService } from './ai-config.service';
import { AiPromptConfig } from './entities/ai-prompt-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiPromptConfig])],
  controllers: [AiConfigController],
  providers: [AiConfigService],
  exports: [AiConfigService], // 导出供其他模块使用
})
export class AiConfigModule {}
