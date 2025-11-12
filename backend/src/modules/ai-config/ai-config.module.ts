import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfigController } from './ai-config.controller';
import { AiConfigService } from './ai-config.service';
import { AiPromptConfig } from './entities/ai-prompt-config.entity';
import { AiApiKeyController } from './ai-api-key.controller';
import { AiApiKeyService } from './ai-api-key.service';
import { AiApiKey } from './entities/ai-api-key.entity';
import { RolePermission } from '../system/entities/role-permission.entity';
import { Permission } from '../system/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiPromptConfig, AiApiKey, RolePermission, Permission])],
  controllers: [AiConfigController, AiApiKeyController],
  providers: [AiConfigService, AiApiKeyService],
  exports: [AiConfigService, AiApiKeyService], // 导出供其他模块使用
})
export class AiConfigModule {}
