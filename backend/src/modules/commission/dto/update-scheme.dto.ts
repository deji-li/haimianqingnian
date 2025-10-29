import { PartialType } from '@nestjs/mapped-types';
import { CreateSchemeDto } from './create-scheme.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSchemeDto extends PartialType(CreateSchemeDto) {
  @IsNumber()
  @IsOptional()
  status?: number;
}
