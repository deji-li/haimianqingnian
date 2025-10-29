import { IsArray, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchUpdateCustomerDto {
  @ApiProperty({ description: '客户ID列表', example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({ description: '销售人员ID', required: false })
  @IsOptional()
  @IsNumber()
  salesId?: number;

  @ApiProperty({ description: '客户意向', required: false })
  @IsOptional()
  customerIntent?: string;

  @ApiProperty({ description: '运营人员ID', required: false })
  @IsOptional()
  @IsNumber()
  operatorId?: number;
}
