import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  departmentName: string;

  @ApiProperty({ description: '上级部门ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '部门负责人ID', required: false })
  @IsOptional()
  @IsNumber()
  managerId?: number;

  @ApiProperty({ description: '部门描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;
}
