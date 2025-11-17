import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfigCallerService } from './ai-config-caller.service';
import { FieldMappingService } from './field-mapping.service';
import { AiConfigModule } from '../../../modules/ai-config/ai-config.module';
import { AiFieldMappingConfig } from '../../../modules/ai-config/entities/ai-field-mapping-config.entity';

/**
 * AI共享模块
 * 提供统一的AI调用和字段映射服务
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AiFieldMappingConfig]),
    AiConfigModule, // 导入AI配置模块
  ],
  providers: [AiConfigCallerService, FieldMappingService],
  exports: [AiConfigCallerService, FieldMappingService],
})
export class AiSharedModule {}
