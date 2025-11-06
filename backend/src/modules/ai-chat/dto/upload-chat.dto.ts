import { IsNotEmpty, IsString, IsDateString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadChatDto {
  @ApiProperty({ description: '客户微信号（销售手动补充）' })
  @IsNotEmpty({ message: '客户微信号不能为空' })
  @IsString()
  wechatId: string;

  @ApiProperty({ description: '聊天日期', example: '2025-01-15' })
  @IsNotEmpty({ message: '聊天日期不能为空' })
  @IsDateString({}, { message: '日期格式不正确' })
  chatDate: string;

  @ApiProperty({ description: '聊天截图URL数组', type: [String] })
  @IsNotEmpty({ message: '截图不能为空' })
  @IsArray({ message: '截图必须是数组' })
  @ArrayMinSize(1, { message: '至少上传1张截图' })
  images: string[];
}

export class QueryChatRecordsDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  limit?: number;

  @ApiProperty({ description: '客户ID', required: false })
  customerId?: number;

  @ApiProperty({ description: '质量等级', required: false, enum: ['A', 'B', 'C', 'D'] })
  qualityLevel?: string;

  @ApiProperty({ description: '风险等级', required: false, enum: ['无风险', '低', '中', '高'] })
  riskLevel?: string;

  @ApiProperty({ description: '开始日期', required: false })
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  endDate?: string;
}
