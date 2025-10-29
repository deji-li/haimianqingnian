import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TeamStatsService } from './team-stats.service';
import { TeamStatsQueryDto } from './dto/team-stats.dto';

@ApiTags('团队数据统计')
@Controller('team-stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamStatsController {
  constructor(private readonly teamStatsService: TeamStatsService) {}

  @Get('member-performance')
  @ApiOperation({ summary: '获取团队成员业绩排行榜' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'departmentId', required: false, description: '部门ID' })
  @ApiQuery({ name: 'campusId', required: false, description: '校区ID' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段：totalAmount | orderCount | customerCount' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认50' })
  getMemberPerformance(@Query() query: TeamStatsQueryDto) {
    return this.teamStatsService.getTeamMemberPerformance(query);
  }

  @Get('overview')
  @ApiOperation({ summary: '获取团队整体统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'departmentId', required: false, description: '部门ID' })
  @ApiQuery({ name: 'campusId', required: false, description: '校区ID' })
  getOverview(@Query() query: TeamStatsQueryDto) {
    return this.teamStatsService.getTeamOverview(query);
  }

  @Get('department-comparison')
  @ApiOperation({ summary: '获取部门业绩对比' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'campusId', required: false, description: '校区ID' })
  getDepartmentComparison(@Query() query: TeamStatsQueryDto) {
    return this.teamStatsService.getDepartmentComparison(query);
  }

  @Get('campus-comparison')
  @ApiOperation({ summary: '获取校区业绩对比' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期（YYYY-MM-DD）' })
  @ApiQuery({ name: 'departmentId', required: false, description: '部门ID' })
  getCampusComparison(@Query() query: TeamStatsQueryDto) {
    return this.teamStatsService.getCampusComparison(query);
  }
}
