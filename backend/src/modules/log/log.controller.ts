import { Controller, Get, Query, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogService, QueryLogDto } from './log.service';

@ApiTags('操作日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: '获取操作日志列表' })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Get('modules')
  @ApiOperation({ summary: '获取操作模块列表' })
  getModules() {
    return this.logService.getModules();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取日志详情' })
  findOne(@Param('id') id: number) {
    return this.logService.findOne(id);
  }

  @Delete('clean')
  @ApiOperation({ summary: '清理30天前的日志' })
  async clean() {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - 30);

    const count = await this.logService.deleteByTime(beforeDate);
    return {
      message: `已清理 ${count} 条日志记录`,
      count,
    };
  }
}
