import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LifecycleService } from './lifecycle.service';
import { CreateLifecycleDto } from './dto/lifecycle.dto';

@ApiTags('客户生命周期')
@Controller('lifecycle')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Post()
  @ApiOperation({ summary: '创建生命周期记录' })
  create(@Body() createLifecycleDto: CreateLifecycleDto) {
    return this.lifecycleService.create(createLifecycleDto);
  }

  @Get('history/:customerId')
  @ApiOperation({ summary: '获取客户生命周期历史' })
  getHistory(@Param('customerId') customerId: string) {
    return this.lifecycleService.getHistory(+customerId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取生命周期统计数据' })
  getStatistics() {
    return this.lifecycleService.getStatistics();
  }

  @Get('stage/:stage')
  @ApiOperation({ summary: '获取指定阶段的客户列表' })
  getCustomersByStage(@Param('stage') stage: string) {
    return this.lifecycleService.getCustomersByStage(stage);
  }

  @Post('batch-update')
  @ApiOperation({ summary: '批量更新生命周期阶段' })
  batchUpdate(@Body() data: { customerIds: number[]; stage: string; changeReason?: string; operatorId: number }) {
    return this.lifecycleService.batchUpdateStage(
      data.customerIds,
      data.stage,
      data.operatorId,
      data.changeReason,
    );
  }
}
