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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { CreateAutomationRuleDto } from './dto/create-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { RuleType } from './entities/automation-rule.entity';

@ApiTags('自动化工作流')
@Controller('automation')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('rules')
  @ApiOperation({ summary: '创建自动化规则' })
  @RequirePermissions('automation:create')
  async createRule(
    @Body() dto: CreateAutomationRuleDto,
    @Request() req,
  ) {
    return this.automationService.createRule(dto, req.user.id);
  }

  @Get('rules')
  @ApiOperation({ summary: '获取规则列表' })
  @RequirePermissions('automation:view')
  async getRules(@Query('ruleType') ruleType?: RuleType) {
    return this.automationService.getRules(ruleType);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: '获取规则详情' })
  @RequirePermissions('automation:view')
  async getRule(@Param('id') id: number) {
    return this.automationService.getRule(id);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '更新规则' })
  @RequirePermissions('automation:update')
  async updateRule(
    @Param('id') id: number,
    @Body() dto: UpdateAutomationRuleDto,
  ) {
    return this.automationService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除规则' })
  @RequirePermissions('automation:delete')
  async deleteRule(@Param('id') id: number) {
    return this.automationService.deleteRule(id);
  }

  @Post('rules/:id/toggle')
  @ApiOperation({ summary: '启用/禁用规则' })
  @RequirePermissions('automation:update')
  async toggleRule(@Param('id') id: number) {
    return this.automationService.toggleRuleStatus(id);
  }

  @Get('logs')
  @ApiOperation({ summary: '获取执行日志' })
  @RequirePermissions('automation:view')
  async getLogs(
    @Query('ruleId') ruleId?: number,
    @Query('limit') limit?: number,
  ) {
    return this.automationService.getLogs(ruleId, limit);
  }

  @Post('test/assign/:customerId')
  @ApiOperation({ summary: '测试自动分配' })
  @RequirePermissions('automation:test')
  async testAutoAssign(@Param('customerId') customerId: number) {
    const result = await this.automationService.autoAssignCustomer(customerId);
    return {
      success: result !== null,
      assignedSalesId: result,
    };
  }
}
