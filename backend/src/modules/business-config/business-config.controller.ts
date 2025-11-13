import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessConfigService } from './business-config.service';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';

@ApiTags('业务配置')
@Controller('business-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessConfigController {
  constructor(private readonly businessConfigService: BusinessConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  async findAll(@Query('category') category?: string) {
    return this.businessConfigService.findAll(category);
  }

  @Get(':configKey')
  @ApiOperation({ summary: '获取指定配置' })
  async getConfig(@Param('configKey') configKey: string) {
    const value = await this.businessConfigService.getConfig(configKey);
    return { configKey, configValue: value };
  }

  @Put()
  @ApiOperation({ summary: '更新配置' })
  async updateConfig(@Body() updateDto: UpdateBusinessConfigDto) {
    return this.businessConfigService.updateConfig(
      updateDto.configKey,
      updateDto.configValue,
    );
  }
}
