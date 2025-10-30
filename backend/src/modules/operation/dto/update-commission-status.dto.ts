import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString, IsInt } from 'class-validator';

export class UpdateCommissionStatusDto {
  @IsNotEmpty({ message: '状态不能为空' })
  @IsEnum(['待发放', '已发放', '已拒绝'], { message: '状态只能是：待发放、已发放、已拒绝' })
  status: string;

  @IsOptional()
  @IsDateString({}, { message: '发放日期格式不正确' })
  paymentDate?: string;

  @IsOptional()
  @IsInt({ message: '审核人ID必须是整数' })
  approverId?: number;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
