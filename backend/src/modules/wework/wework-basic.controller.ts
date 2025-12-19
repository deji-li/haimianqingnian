import { Controller, Get, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WeWorkBasicService } from './wework-basic.service'

@ApiTags('企业微信管理')
@Controller('wework')
export class WeWorkBasicController {
  constructor(private readonly weworkService: WeWorkBasicService) {}

  @Get('config')
  @ApiOperation({ summary: '获取企业微信配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConfig() {
    return this.weworkService.getConfig()
  }

  @Post('config')
  @ApiOperation({ summary: '保存企业微信配置' })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveConfig(@Body() configData: any) {
    return this.weworkService.saveConfig(configData)
  }

  @Post('test-connection')
  @ApiOperation({ summary: '测试企业微信API连接' })
  @ApiResponse({ status: 200, description: '测试成功' })
  async testConnection() {
    return this.weworkService.testConnection()
  }
}