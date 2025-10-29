import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TargetService } from './target.service';
import { CreateSalesTargetDto, UpdateSalesTargetDto } from './dto/sales-target.dto';

@ApiTags('销售目标管理')
@Controller('target')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Post()
  @ApiOperation({ summary: '创建销售目标' })
  create(@Body() createTargetDto: CreateSalesTargetDto) {
    return this.targetService.create(createTargetDto);
  }

  @Get()
  @ApiOperation({ summary: '获取销售目标列表' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID（可选，不传则查询所有）' })
  findAll(@Query('userId') userId?: string) {
    return this.targetService.findAll(userId ? +userId : undefined);
  }

  @Get('progress/:userId')
  @ApiOperation({ summary: '获取用户目标进度（工作台用）' })
  getProgress(@Param('userId') userId: string) {
    return this.targetService.getProgress(+userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取销售目标详情' })
  findOne(@Param('id') id: string) {
    return this.targetService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新销售目标' })
  update(@Param('id') id: string, @Body() updateTargetDto: UpdateSalesTargetDto) {
    return this.targetService.update(+id, updateTargetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除销售目标' })
  remove(@Param('id') id: string) {
    return this.targetService.remove(+id);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: '刷新目标的实际完成数据（从订单统计）' })
  refreshActual(@Param('id') id: string) {
    return this.targetService.updateActualFromOrders(+id);
  }

  @Post('refresh-all')
  @ApiOperation({ summary: '批量刷新所有活跃目标的实际完成数据' })
  refreshAllActual() {
    return this.targetService.updateAllActualFromOrders();
  }
}
