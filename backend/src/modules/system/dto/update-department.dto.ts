import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty({ description: '状态：1-启用，0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  status?: number;
}
