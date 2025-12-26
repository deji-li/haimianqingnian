import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermissions } from '../../common/decorators/permission.decorator'
import { WeWorkBasicService } from './wework-basic.service'

@ApiTags('企业微信管理')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('wework')
export class WeWorkBasicController {
  constructor(private readonly weworkService: WeWorkBasicService) {}

  @Get('config')
  @ApiOperation({ summary: '获取企业微信配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @RequirePermissions('wework:config:view')
  async getConfig() {
    return this.weworkService.getConfig()
  }

  @Post('config')
  @ApiOperation({ summary: '保存企业微信配置' })
  @ApiResponse({ status: 200, description: '保存成功' })
  @RequirePermissions('wework:config:update')
  async saveConfig(@Body() configData: any) {
    return this.weworkService.saveConfig(configData)
  }

  @Post('test-connection')
  @ApiOperation({ summary: '测试企业微信API连接' })
  @ApiResponse({ status: 200, description: '测试成功' })
  @RequirePermissions('wework:config:view')
  async testConnection() {
    return this.weworkService.testConnection()
  }
}