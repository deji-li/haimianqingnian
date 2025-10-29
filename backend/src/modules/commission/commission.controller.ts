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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommissionService } from './commission.service';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@Controller('commission')
@UseGuards(JwtAuthGuard)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Post('schemes')
  async createScheme(@Body() createDto: CreateSchemeDto, @Request() req) {
    return await this.commissionService.createScheme(createDto, req.user.id);
  }

  @Get('schemes')
  async getAllSchemes(@Query('includeDisabled') includeDisabled?: string) {
    const include = includeDisabled === 'true';
    return await this.commissionService.findAllSchemes(include);
  }

  @Get('schemes/:id')
  async getSchemeById(@Param('id') id: number) {
    return await this.commissionService.findSchemeById(id);
  }

  @Put('schemes/:id')
  async updateScheme(@Param('id') id: number, @Body() updateDto: UpdateSchemeDto) {
    return await this.commissionService.updateScheme(id, updateDto);
  }

  @Delete('schemes/:id')
  async deleteScheme(@Param('id') id: number) {
    await this.commissionService.deleteScheme(id);
    return { message: '删除成功' };
  }

  @Post('calculate/:orderId')
  async calculateCommission(@Param('orderId') orderId: number) {
    return await this.commissionService.calculateCommission(orderId);
  }

  @Get('preview')
  async previewCommission(
    @Query('orderAmount') orderAmount: number,
    @Query('orderTag') orderTag?: string,
    @Query('courseName') courseName?: string,
  ) {
    return await this.commissionService.previewCommission(
      Number(orderAmount),
      orderTag,
      courseName,
    );
  }

  @Get('list')
  async getCommissionList(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
    @Query('salesId') salesId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.commissionService.findAll({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      status,
      salesId: salesId ? Number(salesId) : undefined,
      startDate,
      endDate,
    });
  }

  @Put(':id')
  async updateCommission(@Param('id') id: number, @Body() data: any) {
    return await this.commissionService.updateCommission(Number(id), data);
  }

  @Post('batch-settle')
  async batchSettle(@Body('ids') ids: number[]) {
    await this.commissionService.batchSettle(ids);
    return { message: '批量结算成功' };
  }

  @Get('statistics')
  async getStatistics(
    @Query('salesId') salesId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.commissionService.getStatistics({
      salesId: salesId ? Number(salesId) : undefined,
      startDate,
      endDate,
    });
  }

  @Get('summary/user')
  async getSummaryByUser(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.commissionService.getSummaryByUser({
      startDate,
      endDate,
    });
  }

  @Get('summary/month')
  async getSummaryByMonth(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.commissionService.getSummaryByMonth({
      startDate,
      endDate,
    });
  }
}
