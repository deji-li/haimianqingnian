import { PartialType } from '@nestjs/swagger';
import { CreateCommissionDto } from './create-commission.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {
  @ApiProperty({ description: '提成状态', required: false })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled'])
  status?: string;

  @ApiProperty({ description: '结算月份', required: false })
  @IsOptional()
  @IsString()
  settlementMonth?: string;
}
