import { IsNotEmpty, IsString, IsDateString, IsArray, ArrayMinSize, IsOptional, IsInt, Min, Max, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UploadType {
  SCREENSHOT = 'screenshot',
  TEXT = 'text',
  FILE = 'file',
}

export class UploadChatDto {
  @ApiProperty({ description: '客户微信号（销售手动补充）' })
  @IsNotEmpty({ message: '客户微信号不能为空' })
  @IsString()
  wechatId: string;

  @ApiProperty({ description: '聊天日期', example: '2025-01-15' })
  @IsNotEmpty({ message: '聊天日期不能为空' })
  @IsDateString({}, { message: '日期格式不正确' })
  chatDate: string;

  @ApiProperty({
    description: '上传类型：screenshot-截图OCR，text-直接文本，file-文件上传',
    enum: UploadType,
    default: UploadType.SCREENSHOT
  })
  @IsOptional()
  @IsEnum(UploadType, { message: '上传类型必须是screenshot、text或file' })
  uploadType?: UploadType = UploadType.SCREENSHOT;

  @ApiProperty({ description: '聊天截图URL数组（uploadType=screenshot时必填）', type: [String], required: false })
  @ValidateIf(o => o.uploadType === UploadType.SCREENSHOT || o.uploadType === undefined)
  @IsNotEmpty({ message: '截图不能为空' })
  @IsArray({ message: '截图必须是数组' })
  @ArrayMinSize(1, { message: '至少上传1张截图' })
  images?: string[];

  @ApiProperty({ description: '聊天文本内容（uploadType=text时必填）', required: false })
  @ValidateIf(o => o.uploadType === UploadType.TEXT)
  @IsNotEmpty({ message: '文本内容不能为空' })
  @IsString()
  rawText?: string;

  @ApiProperty({ description: '文件路径（uploadType=file时必填）', required: false })
  @ValidateIf(o => o.uploadType === UploadType.FILE)
  @IsNotEmpty({ message: '文件路径不能为空' })
  @IsString()
  filePath?: string;
}

export class QueryChatRecordsDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiProperty({ description: '质量等级', required: false, enum: ['A', 'B', 'C', 'D'] })
  @IsOptional()
  @IsString()
  qualityLevel?: string;

  @ApiProperty({ description: '风险等级', required: false, enum: ['无风险', '低', '中', '高'] })
  @IsOptional()
  @IsString()
  riskLevel?: string;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}
