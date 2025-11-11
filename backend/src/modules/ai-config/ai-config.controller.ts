import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AiConfigService } from './ai-config.service';
import { CreateAiPromptConfigDto } from './dto/create-ai-prompt-config.dto';
import { UpdateAiPromptConfigDto } from './dto/update-ai-prompt-config.dto';
import { QueryAiPromptConfigDto } from './dto/query-ai-prompt-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI配置管理')
@Controller('ai-config')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建AI提示词配置' })
  @RequirePermissions('system:ai-config')
  async create(@Body() createDto: CreateAiPromptConfigDto) {
    return this.aiConfigService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询AI配置列表' })
  @RequirePermissions('system:ai-config')
  async findAll(@Query() query: QueryAiPromptConfigDto) {
    return this.aiConfigService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有场景分类' })
  @RequirePermissions('system:ai-config')
  async getCategories() {
    return this.aiConfigService.getCategories();
  }

  @Get('by-scenario/:scenarioKey/:modelProvider')
  @ApiOperation({ summary: '根据场景和供应商获取配置' })
  @ApiParam({ name: 'scenarioKey', description: '场景标识' })
  @ApiParam({ name: 'modelProvider', description: 'AI供应商' })
  async getByScenario(
    @Param('scenarioKey') scenarioKey: string,
    @Param('modelProvider') modelProvider: string,
  ) {
    return this.aiConfigService.getPromptConfig(scenarioKey, modelProvider);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询配置' })
  @RequirePermissions('system:ai-config')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aiConfigService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新AI配置' })
  @RequirePermissions('system:ai-config')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAiPromptConfigDto,
  ) {
    return this.aiConfigService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除AI配置' })
  @RequirePermissions('system:ai-config')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.aiConfigService.remove(id);
    return { message: '删除成功' };
  }
}
