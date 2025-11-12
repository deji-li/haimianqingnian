import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AiApiKeyService } from './ai-api-key.service';
import { CreateAiApiKeyDto, UpdateAiApiKeyDto } from './dto/ai-api-key.dto';

@ApiTags('AI API密钥管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('ai-api-keys')
export class AiApiKeyController {
  constructor(private readonly aiApiKeyService: AiApiKeyService) {}

  @Post()
  @ApiOperation({ summary: '创建API密钥配置' })
  @RequirePermissions('system:ai:config')
  create(@Body() createDto: CreateAiApiKeyDto) {
    return this.aiApiKeyService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有API密钥配置' })
  @RequirePermissions('system:ai:config')
  findAll() {
    return this.aiApiKeyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取API密钥配置' })
  @RequirePermissions('system:ai:config')
  findOne(@Param('id') id: string) {
    return this.aiApiKeyService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新API密钥配置' })
  @RequirePermissions('system:ai:config')
  update(@Param('id') id: string, @Body() updateDto: UpdateAiApiKeyDto) {
    return this.aiApiKeyService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除API密钥配置' })
  @RequirePermissions('system:ai:config')
  async remove(@Param('id') id: string) {
    await this.aiApiKeyService.remove(+id);
    return { message: '删除成功' };
  }
}
