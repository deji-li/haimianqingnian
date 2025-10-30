import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CommissionRecordQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  pageSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '运营人员ID必须是整数' })
  operatorId?: number;

  @IsOptional()
  @IsEnum(['待发放', '已发放', '已拒绝'], { message: '状态只能是：待发放、已发放、已拒绝' })
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;
}
