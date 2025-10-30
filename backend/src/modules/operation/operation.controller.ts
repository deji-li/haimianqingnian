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
import { OperationService } from './operation.service';
import {
  CreateOperationAccountDto,
  UpdateOperationAccountDto,
  OperationAccountQueryDto,
  CreateDailyReportDto,
  UpdateDailyReportDto,
  DailyReportQueryDto,
  CommissionRecordQueryDto,
  UpdateCommissionStatusDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';

@Controller('operation')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  // ==================== 账号管理 ====================

  @Post('accounts')
  @RequirePermissions('operation:account:create')
  async createAccount(@Body() dto: CreateOperationAccountDto) {
    return await this.operationService.createAccount(dto);
  }

  @Get('accounts')
  @RequirePermissions('operation:account:view')
  async findAllAccounts(@Query() query: OperationAccountQueryDto, @Request() req) {
    // 如果不是主管或管理员，只能查看自己的账号
    if (
      !req.user.permissions.includes('operation:analytics:all') &&
      !req.user.permissions.includes('admin:all')
    ) {
      query.operatorId = req.user.userId;
    }
    return await this.operationService.findAllAccounts(query);
  }

  @Get('accounts/:id')
  @RequirePermissions('operation:account:view')
  async findAccountById(@Param('id') id: number) {
    return await this.operationService.findAccountById(id);
  }

  @Put('accounts/:id')
  @RequirePermissions('operation:account:update')
  async updateAccount(@Param('id') id: number, @Body() dto: UpdateOperationAccountDto) {
    return await this.operationService.updateAccount(id, dto);
  }

  @Delete('accounts/:id')
  @RequirePermissions('operation:account:delete')
  async deleteAccount(@Param('id') id: number) {
    return await this.operationService.deleteAccount(id);
  }

  // ==================== 日报管理 ====================

  @Post('daily-reports')
  @RequirePermissions('operation:report:create')
  async createDailyReport(@Body() dto: CreateDailyReportDto, @Request() req) {
    // 普通运营人员只能为自己创建日报
    if (
      !req.user.permissions.includes('operation:analytics:all') &&
      !req.user.permissions.includes('admin:all')
    ) {
      dto.operatorId = req.user.userId;
    }
    return await this.operationService.createDailyReport(dto);
  }

  @Get('daily-reports')
  @RequirePermissions('operation:report:view')
  async findAllDailyReports(@Query() query: DailyReportQueryDto, @Request() req) {
    // 如果不是主管或管理员，只能查看自己的日报
    if (
      !req.user.permissions.includes('operation:analytics:all') &&
      !req.user.permissions.includes('admin:all')
    ) {
      query.operatorId = req.user.userId;
    }
    return await this.operationService.findAllDailyReports(query);
  }

  @Get('daily-reports/:id')
  @RequirePermissions('operation:report:view')
  async findDailyReportById(@Param('id') id: number) {
    return await this.operationService.findDailyReportById(id);
  }

  @Put('daily-reports/:id')
  @RequirePermissions('operation:report:update')
  async updateDailyReport(@Param('id') id: number, @Body() dto: UpdateDailyReportDto) {
    return await this.operationService.updateDailyReport(id, dto);
  }

  @Delete('daily-reports/:id')
  @RequirePermissions('operation:report:update')
  async deleteDailyReport(@Param('id') id: number) {
    return await this.operationService.deleteDailyReport(id);
  }

  // ==================== 提成管理 ====================

  @Get('commissions')
  @RequirePermissions('operation:commission:view')
  async findAllCommissions(@Query() query: CommissionRecordQueryDto, @Request() req) {
    // 如果不是主管或管理员，只能查看自己的提成
    if (
      !req.user.permissions.includes('operation:analytics:all') &&
      !req.user.permissions.includes('admin:all')
    ) {
      query.operatorId = req.user.userId;
    }
    return await this.operationService.findAllCommissions(query);
  }

  @Put('commissions/:id/status')
  @RequirePermissions('operation:commission:approve')
  async updateCommissionStatus(
    @Param('id') id: number,
    @Body() dto: UpdateCommissionStatusDto,
    @Request() req,
  ) {
    // 记录审核人
    dto.approverId = req.user.userId;
    return await this.operationService.updateCommissionStatus(id, dto);
  }

  // ==================== 统计数据 ====================

  @Get('stats/:operatorId')
  @RequirePermissions('operation:analytics:view')
  async getOperatorStats(
    @Param('operatorId') operatorId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    // 普通运营人员只能查看自己的统计
    if (
      !req.user.permissions.includes('operation:analytics:all') &&
      !req.user.permissions.includes('admin:all') &&
      req.user.userId !== operatorId
    ) {
      operatorId = req.user.userId;
    }
    return await this.operationService.getOperatorStats(operatorId, startDate, endDate);
  }
}
