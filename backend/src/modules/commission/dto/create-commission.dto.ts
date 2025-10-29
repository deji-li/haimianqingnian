import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCommissionDto {
  @ApiProperty({ description: '订单ID' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ description: '员工ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '订单金额' })
  @IsNumber()
  @Min(0)
  orderAmount: number;

  @ApiProperty({ description: '提成比例(%)' })
  @IsNumber()
  @Min(0)
  commissionRate: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
