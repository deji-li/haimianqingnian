import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSalesTargetDto {
  @ApiProperty({ description: '用户ID（销售人员）', example: 1 })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '目标类型', example: 'monthly', enum: ['monthly', 'quarterly', 'yearly'] })
  @IsNotEmpty({ message: '目标类型不能为空' })
  @IsString()
  targetType: string;

  @ApiProperty({ description: '目标金额', example: 100000 })
  @IsNotEmpty({ message: '目标金额不能为空' })
  @IsNumber()
  targetAmount: number;

  @ApiProperty({ description: '目标订单数', example: 50 })
  @IsNotEmpty({ message: '目标订单数不能为空' })
  @IsNumber()
  targetCount: number;

  @ApiProperty({ description: '开始日期', example: '2024-01-01' })
  @IsNotEmpty({ message: '开始日期不能为空' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期', example: '2024-01-31' })
  @IsNotEmpty({ message: '结束日期不能为空' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSalesTargetDto {
  @ApiPropertyOptional({ description: '目标金额' })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiPropertyOptional({ description: '目标订单数' })
  @IsOptional()
  @IsNumber()
  targetCount?: number;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class SalesTargetDto {
  id: number;
  userId: number;
  userName: string;
  targetType: string;
  targetAmount: number;
  actualAmount: number;
  targetCount: number;
  actualCount: number;
  startDate: string;
  endDate: string;
  status: number;
  remark: string;
  amountProgress: number; // 金额完成进度（百分比）
  countProgress: number; // 订单数完成进度（百分比）
  createTime: Date;
  updateTime: Date;
}

export class TargetProgressDto {
  targetId: number;
  userId: number;
  userName: string;
  targetType: string;
  targetAmount: number;
  actualAmount: number;
  targetCount: number;
  actualCount: number;
  amountProgress: number;
  countProgress: number;
  remainingDays: number; // 剩余天数
  startDate: string;
  endDate: string;
}
