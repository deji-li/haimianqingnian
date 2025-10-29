import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumber } from 'class-validator';

// 团队成员业绩DTO
export class TeamMemberPerformanceDto {
  userId: number;
  userName: string;
  realName: string;
  avatar?: string;
  departmentName?: string;
  campusName?: string;

  // 业绩数据
  totalAmount: number; // 总销售额
  orderCount: number; // 订单数
  customerCount: number; // 客户数
  newCustomerCount: number; // 新增客户数
  followCount: number; // 跟进次数

  // 目标完成情况
  targetAmount?: number; // 目标金额
  targetCompletion?: number; // 目标完成率

  // 排名
  rank?: number;
}

// 团队整体统计DTO
export class TeamOverviewDto {
  totalMembers: number; // 团队总人数
  totalAmount: number; // 团队总销售额
  totalOrders: number; // 团队总订单数
  totalCustomers: number; // 团队总客户数

  // 平均值
  avgAmountPerMember: number; // 人均销售额
  avgOrdersPerMember: number; // 人均订单数

  // 同比/环比
  amountGrowthRate?: number; // 销售额增长率
  orderGrowthRate?: number; // 订单增长率
}

// 部门业绩对比DTO
export class DepartmentPerformanceDto {
  departmentId: number;
  departmentName: string;
  memberCount: number; // 成员数
  totalAmount: number; // 总销售额
  orderCount: number; // 订单数
  customerCount: number; // 客户数
  avgAmountPerMember: number; // 人均销售额
}

// 校区业绩对比DTO
export class CampusPerformanceDto {
  campusId: number;
  campusName: string;
  memberCount: number;
  totalAmount: number;
  orderCount: number;
  customerCount: number;
  avgAmountPerMember: number;
}

// 查询参数DTO
export class TeamStatsQueryDto {
  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({ description: '校区ID' })
  @IsOptional()
  @IsNumber()
  campusId?: number;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  sortBy?: string; // totalAmount | orderCount | customerCount

  @ApiPropertyOptional({ description: '排名数量限制' })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
