import { PartialType } from '@nestjs/swagger';
import { CreateOkrDto } from './create-okr.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export class UpdateOkrDto extends PartialType(CreateOkrDto) {
  @ApiProperty({
    description: '状态',
    enum: ['draft', 'active', 'completed', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ description: '完成度（0-100）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}
