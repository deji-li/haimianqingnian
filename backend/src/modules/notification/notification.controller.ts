import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationService, QueryNotificationDto } from './notification.service';

@ApiTags('消息通知')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  findByUser(@Request() req, @Query() query: QueryNotificationDto) {
    // 只能查询自己的通知
    query.userId = req.user.id;
    return this.notificationService.findByUser(query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记为已读' })
  async markAsRead(@Param('id') id: number) {
    await this.notificationService.markAsRead(id);
    return { message: '已标记为已读' };
  }

  @Post('read-all')
  @ApiOperation({ summary: '全部标记为已读' })
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { message: '已全部标记为已读' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  async remove(@Param('id') id: number) {
    await this.notificationService.remove(id);
    return { message: '删除成功' };
  }

  @Delete('clear/read')
  @ApiOperation({ summary: '清空已读通知' })
  async removeRead(@Request() req) {
    const count = await this.notificationService.removeRead(req.user.id);
    return { message: `已清空 ${count} 条已读通知` };
  }

  @Post('system')
  @ApiOperation({ summary: '发送系统通知（管理员）' })
  async createSystemNotification(
    @Body() body: {
      userIds: number[];
      title: string;
      content: string;
    }
  ) {
    await this.notificationService.createSystemNotification(
      body.userIds,
      body.title,
      body.content
    );
    return { message: '系统通知已发送' };
  }

  @Post('test')
  @ApiOperation({ summary: '创建测试通知（开发用）' })
  async createTestNotification(@Request() req) {
    await this.notificationService.create({
      userId: req.user.id,
      type: 'system',
      title: '测试通知',
      content: '这是一条测试通知消息，用于测试未读消息提醒功能。',
    });
    return { message: '测试通知创建成功' };
  }
}
