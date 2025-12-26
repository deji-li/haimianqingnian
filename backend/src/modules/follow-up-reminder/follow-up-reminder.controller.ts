import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FollowUpReminderService } from './follow-up-reminder.service';
import { UpdateFollowUpConfigDto, TaskQueryDto } from './dto/follow-up-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@Controller('system/follow-up-reminder')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FollowUpReminderController {
  constructor(private readonly followUpReminderService: FollowUpReminderService) {}

  /**
   * 获取跟进配置
   */
  @Get('config')
  @RequirePermissions('system:follow-up:view')
  async getConfig() {
    return await this.followUpReminderService.getConfig();
  }

  /**
   * 更新跟进配置
   */
  @Post('config')
  @RequirePermissions('system:follow-up:update')
  async updateConfig(@Body() dto: UpdateFollowUpConfigDto) {
    return await this.followUpReminderService.updateConfig(dto);
  }

  /**
   * 获取提醒任务列表
   */
  @Get('tasks')
  @RequirePermissions('system:follow-up:view')
  async getTasks(
    @Req() req,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // 非管理员只能查看自己的任务
    const userId = req.user.role_id === 1 ? undefined : req.user.id;

    return await this.followUpReminderService.getTasks(
      userId,
      status,
      startDate,
      endDate,
      page || 1,
      limit || 20,
    );
  }

  /**
   * 生成当日提醒任务（手动触发）
   */
  @Post('generate-tasks')
  @RequirePermissions('system:follow-up:manage')
  async generateTasks() {
    const count = await this.followUpReminderService.generateDailyTasks();

    return {
      success: true,
      message: `成功生成 ${count} 条提醒任务`,
      count,
    };
  }

  /**
   * 标记任务为已发送
   */
  @Put('tasks/:id/sent')
  @RequirePermissions('system:follow-up:manage')
  async markAsSent(@Param('id') id: string) {
    await this.followUpReminderService.markAsSent(Number(id));

    return {
      success: true,
      message: '任务已标记为已发送',
    };
  }

  /**
   * 标记任务为已完成
   */
  @Put('tasks/:id/completed')
  @RequirePermissions('system:follow-up:manage')
  async markAsCompleted(@Param('id') id: string) {
    await this.followUpReminderService.markAsCompleted(Number(id));

    return {
      success: true,
      message: '任务已标记为已完成',
    };
  }

  /**
   * 取消任务
   */
  @Delete('tasks/:id')
  @RequirePermissions('system:follow-up:manage')
  async cancelTask(@Param('id') id: string) {
    await this.followUpReminderService.cancelTask(Number(id));

    return {
      success: true,
      message: '任务已取消',
    };
  }
}
