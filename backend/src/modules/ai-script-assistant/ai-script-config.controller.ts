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
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { AiScriptConfigService } from './ai-script-config.service';
import {
  CreatePromptConfigDto,
  UpdatePromptConfigDto,
  QueryPromptConfigDto,
} from './dto/prompt-config.dto';

@ApiTags('AI话术配置管理')
@ApiBearerAuth()
@Controller('ai-script-assistant/config')
@UseGuards(JwtAuthGuard)
export class AiScriptConfigController {
  constructor(private readonly aiScriptConfigService: AiScriptConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建AI配置' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  async createConfig(@Request() req, @Body() dto: CreatePromptConfigDto) {
    return this.aiScriptConfigService.createConfig(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取配置列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getConfigs(@Query() query: QueryPromptConfigDto) {
    return this.aiScriptConfigService.getConfigs(query);
  }

  @Get('default/:functionType')
  @ApiOperation({ summary: '获取默认配置' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getDefaultConfig(
    @Param('functionType') functionType: string,
    @Query('scenarioId') scenarioId?: number,
    @Query('techniqueId') techniqueId?: number,
  ) {
    return this.aiScriptConfigService.getDefaultConfig(
      functionType,
      scenarioId,
      techniqueId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取配置详情' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getConfig(@Param('id', ParseIntPipe) id: number) {
    return this.aiScriptConfigService.getConfigById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新配置' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  async updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: UpdatePromptConfigDto
  ) {
    return this.aiScriptConfigService.updateConfig(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配置' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  async deleteConfig(@Param('id', ParseIntPipe) id: number) {
    return this.aiScriptConfigService.deleteConfig(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: '复制配置' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.OK, description: '复制成功' })
  async duplicateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('newName') newName?: string
  ) {
    return this.aiScriptConfigService.duplicateConfig(id, req.user.id, newName);
  }

  @Get('variables/supported')
  @ApiOperation({ summary: '获取支持的变量列表' })
  @RequirePermissions('ai:script:view')
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getSupportedVariables() {
    return this.aiScriptConfigService.getSupportedVariables();
  }

  @Post('initialize-defaults')
  @ApiOperation({ summary: '初始化默认配置' })
  @RequirePermissions('ai:script:manage')
  @ApiResponse({ status: HttpStatus.OK, description: '初始化成功' })
  async initializeDefaults(@Request() req) {
    await this.aiScriptConfigService.initializeDefaultConfigs(req.user.id);
    return { message: '默认配置初始化成功' };
  }
}