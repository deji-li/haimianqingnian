import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCampusDto {
  @ApiProperty({ description: '校区名称' })
  @IsString()
  campusName: string;

  @ApiProperty({ description: '校区编码' })
  @IsString()
  campusCode: string;

  @ApiProperty({ description: '校区地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: '校区负责人ID', required: false })
  @IsOptional()
  @IsNumber()
  managerId?: number;

  @ApiProperty({ description: '校区描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;
}
