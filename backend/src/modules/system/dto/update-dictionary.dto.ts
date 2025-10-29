import { PartialType } from '@nestjs/swagger';
import { CreateDictionaryDto } from './create-dictionary.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateDictionaryDto extends PartialType(CreateDictionaryDto) {
  @ApiProperty({ description: '状态：1-启用，0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  status?: number;
}
