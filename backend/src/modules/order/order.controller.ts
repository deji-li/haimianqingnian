import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('订单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DataScopeGuard, PermissionGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RequirePermissions('order:create')
  @ApiOperation({ summary: '创建订单' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @RequirePermissions('order:view')
  @ApiOperation({ summary: '获取订单列表' })
  findAll(@Query() queryDto: QueryOrderDto, @Request() req) {
    return this.orderService.findAll(queryDto, req.dataScope);
  }

  @Get('statistics')
  @RequirePermissions('order:view')
  @ApiOperation({ summary: '获取订单统计数据' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    return this.orderService.getStatistics(startDate, endDate, req.dataScope);
  }

  @Get('customer/:customerId')
  @RequirePermissions('order:view')
  @ApiOperation({ summary: '获取客户订单历史' })
  getCustomerOrders(@Param('customerId') customerId: string) {
    return this.orderService.getCustomerOrders(+customerId);
  }

  @Get(':id')
  @RequirePermissions('order:view')
  @ApiOperation({ summary: '获取订单详情' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('order:update')
  @ApiOperation({ summary: '更新订单' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @RequirePermissions('order:delete')
  @ApiOperation({ summary: '删除订单' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Post('import')
  @RequirePermissions('order:import')
  @ApiOperation({ summary: '批量导入订单' })
  importOrders(@Body() orders: CreateOrderDto[]) {
    return this.orderService.importOrders(orders);
  }
}
