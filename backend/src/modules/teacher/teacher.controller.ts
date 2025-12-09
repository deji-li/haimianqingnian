import { Controller, Get, Post, Body, Put, Delete, Query, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  /**
   * 获取老师列表
   */
  @Get('list')
  async getTeacherList(@Query() query: any) {
    return await this.teacherService.getTeachers(query);
  }

  /**
   * 获取老师排行榜
   */
  @Get('ranking')
  async getTeacherRanking(@Query() query: any) {
    return await this.teacherService.getTeacherRanking({
      type: query.type || 'commission',
      timeRange: query.timeRange,
      campusId: query.campusId ? parseInt(query.campusId) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
  }

  /**
   * 创建老师
   */
  @Post('create')
  async createTeacher(@Body() data: any) {
    return await this.teacherService.createTeacher(data);
  }

  /**
   * 更新老师信息
   */
  @Put(':id')
  async updateTeacher(@Param('id') id: string, @Body() data: any) {
    // 如果包含校区ID数组，先处理校区更新
    if (data.campusIds && Array.isArray(data.campusIds)) {
      await this.teacherService.updateTeacherCampuses(parseInt(id), data.campusIds);
      // 从data中移除campusIds，避免直接更新teacher表
      delete data.campusIds;
    }

    return await this.teacherService.updateTeacher(parseInt(id), data);
  }

  /**
   * 删除老师
   */
  @Delete(':id')
  async deleteTeacher(@Param('id') id: string) {
    return await this.teacherService.deleteTeacher(parseInt(id));
  }

  /**
   * 获取老师详情（包含业绩统计）
   */
  @Get(':id')
  async getTeacherDetail(@Param('id') id: string) {
    return await this.teacherService.getTeacherDetail(parseInt(id));
  }

  /**
   * 同步订单中的老师到老师表
   */
  @Post('sync-teachers')
  async syncTeachersFromOrders() {
    return await this.teacherService.syncTeachersFromOrders();
  }
}