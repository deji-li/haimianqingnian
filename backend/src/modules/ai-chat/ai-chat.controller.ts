import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';
import { UploadChatDto, QueryChatRecordsDto } from './dto/upload-chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('AI聊天记录分析')
@ApiBearerAuth()
@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传聊天截图并分析' })
  @ApiResponse({ status: 201, description: '上传成功，AI分析中' })
  @RequirePermissions('ai:chat:upload')
  async upload(@Body() uploadDto: UploadChatDto, @Request() req) {
    return this.aiChatService.uploadAndAnalyze(uploadDto, req.user.id);
  }

  @Get('list')
  @ApiOperation({ summary: '获取聊天记录列表' })
  @RequirePermissions('ai:chat:view')
  async findAll(@Query() query: QueryChatRecordsDto, @Request() req) {
    return this.aiChatService.findAll(
      query,
      req.user.id,
      req.user.roleCode,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取统计数据' })
  @RequirePermissions('ai:chat:view')
  async getStatistics(@Request() req) {
    return this.aiChatService.getStatistics(
      req.user.id,
      req.user.roleCode,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取聊天记录详情' })
  @RequirePermissions('ai:chat:view')
  async findOne(@Param('id') id: number) {
    return this.aiChatService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除聊天记录' })
  @RequirePermissions('ai:chat:delete')
  async remove(@Param('id') id: number) {
    return this.aiChatService.remove(id);
  }
}
