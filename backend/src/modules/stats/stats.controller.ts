import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';

@ApiTags('统计数据')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DataScopeGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('home')
  @ApiOperation({ summary: '获取首页统计数据' })
  async getHomeStats(@Request() req) {
    return this.statsService.getHomeStats(req.dataScope || {}, req.user.id);
  }
}
