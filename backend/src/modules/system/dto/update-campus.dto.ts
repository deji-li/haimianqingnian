import { PartialType } from '@nestjs/swagger';
import { CreateCampusDto } from './create-campus.dto';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCampusDto extends PartialType(CreateCampusDto) {
  @ApiProperty({ description: '状态：1-启用，0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  status?: number;
}
