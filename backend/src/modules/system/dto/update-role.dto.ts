import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '角色标识', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '角色描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '状态：1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
}
