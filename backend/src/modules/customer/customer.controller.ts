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
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BatchUpdateCustomerDto } from './dto/batch-update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowRecordDto } from './dto/create-follow-record.dto';
import { SmartCreateCustomerDto } from './dto/smart-create-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DataScopeGuard } from '../../common/guards/data-scope.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@ApiTags('客户管理')
@Controller('customer')
@UseGuards(JwtAuthGuard, DataScopeGuard, PermissionGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: '创建客户' })
  @RequirePermissions('customer:create')
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Post('smart-create')
  @ApiOperation({ summary: 'AI智能识别创建客户' })
  @RequirePermissions('customer:create')
  async smartCreate(
    @Body() smartCreateDto: SmartCreateCustomerDto,
    @Request() req,
  ) {
    return this.customerService.smartCreateCustomer(smartCreateDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '获取客户列表' })
  @RequirePermissions('customer:view')
  async findAll(@Query() queryDto: QueryCustomerDto, @Request() req) {
    return this.customerService.findAll(queryDto, req.dataScope);
  }

  @Get('search')
  @ApiOperation({ summary: '快速搜索客户' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词' })
  @RequirePermissions('customer:view')
  async search(@Query('keyword') keyword: string) {
    return this.customerService.searchCustomers(keyword);
  }

  @Put('batch/update')
  @ApiOperation({ summary: '批量更新客户' })
  @RequirePermissions('customer:batch:update')
  async batchUpdate(@Body() batchUpdateDto: BatchUpdateCustomerDto) {
    return this.customerService.batchUpdate(batchUpdateDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  @RequirePermissions('customer:view')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  @RequirePermissions('customer:update')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @RequirePermissions('customer:delete')
  async remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }

  @Post('follow-record')
  @ApiOperation({ summary: '创建跟进记录' })
  @RequirePermissions('customer:follow')
  async createFollowRecord(
    @Body() createFollowRecordDto: CreateFollowRecordDto,
    @Request() req,
  ) {
    return this.customerService.createFollowRecord(
      createFollowRecordDto,
      req.user.id,
    );
  }

  @Get(':id/follow-records')
  @ApiOperation({ summary: '获取客户跟进记录' })
  async getFollowRecords(@Param('id') id: string) {
    return this.customerService.getFollowRecords(+id);
  }

  @Get('pending-followups/list')
  @ApiOperation({ summary: '获取待回访客户列表' })
  async getPendingFollowUps(@Request() req) {
    // 使用dataScope进行数据权限过滤，如果不存在则使用空对象
    return this.customerService.getPendingFollowUps(req.dataScope || {});
  }

  @Get('follow/today')
  @ApiOperation({ summary: '获取今日待跟进列表' })
  async getTodayFollowList(@Request() req) {
    return this.customerService.getPendingFollowUps(req.dataScope || {});
  }

  @Get('follow/statistics')
  @ApiOperation({ summary: '获取跟进统计数据' })
  async getFollowStatistics(@Request() req) {
    return this.customerService.getFollowStatistics(req.dataScope || {});
  }

  @Get('export/excel')
  @ApiOperation({ summary: '导出客户数据为Excel' })
  @RequirePermissions('customer:export')
  async exportToExcel(@Query() queryDto: QueryCustomerDto, @Request() req, @Res() res: Response) {
    const buffer = await this.customerService.exportToExcel(queryDto, req.dataScope);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="customers_${new Date().getTime()}.xlsx"`,
    });

    res.send(buffer);
  }

  @Get('import/template')
  @ApiOperation({ summary: '下载客户导入模板' })
  @RequirePermissions('customer:import')
  async downloadImportTemplate(@Res() res: Response) {
    const buffer = await this.customerService.generateImportTemplate();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="customer_import_template.xlsx"`,
    });

    res.send(buffer);
  }

  @Post('import/excel')
  @ApiOperation({ summary: '批量导入客户数据' })
  @RequirePermissions('customer:import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.customerService.importFromExcel(file, req.user);
  }
}
