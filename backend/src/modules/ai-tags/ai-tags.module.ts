import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTagsController } from './ai-tags.controller';
import { AiTagsService } from './ai-tags.service';
import { AiCustomerTag } from './entities/ai-customer-tag.entity';
import { RolePermission } from '../system/entities/role-permission.entity';
import { Permission } from '../system/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiCustomerTag, RolePermission, Permission])],
  controllers: [AiTagsController],
  providers: [AiTagsService],
  exports: [AiTagsService],
})
export class AiTagsModule {}
