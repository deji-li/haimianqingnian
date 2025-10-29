import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateLifecycleDto {
  @ApiProperty({ description: '客户ID', example: 1 })
  @IsNotEmpty({ message: '客户ID不能为空' })
  @IsInt()
  customerId: number;

  @ApiProperty({
    description: '生命周期阶段',
    example: '意向客户',
    enum: ['线索', '意向客户', '商机', '成交客户', '复购客户', '流失客户'],
  })
  @IsNotEmpty({ message: '生命周期阶段不能为空' })
  @IsString()
  stage: string;

  @ApiPropertyOptional({ description: '阶段变更原因', example: '客户对课程表现出浓厚兴趣' })
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiProperty({ description: '操作人ID', example: 2 })
  @IsNotEmpty({ message: '操作人ID不能为空' })
  @IsInt()
  operatorId: number;
}

export class LifecycleHistoryDto {
  id: number;
  customerId: number;
  stage: string;
  changeReason: string;
  operatorId: number;
  operatorName?: string;
  createTime: Date;
}

export class LifecycleStatisticsDto {
  stage: string;
  count: number;
  percentage: number;
}
