import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  ValidateIf,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiPropertyOptional({ description: '微信昵称', example: '张三' })
  @IsOptional()
  @IsString()
  wechatNickname?: string;

  @ApiProperty({ description: '微信号', example: 'wx_zhangsan' })
  @IsNotEmpty({ message: '微信号不能为空' })
  @IsString()
  wechatId: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '真实姓名', example: '张三' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({
    description: '流量来源',
    example: '抖音',
  })
  @IsOptional()
  @IsString()
  trafficSource?: string;

  @ApiPropertyOptional({ description: '运营人员ID', example: 1 })
  @IsOptional()
  @IsInt()
  operatorId?: number;

  @ApiProperty({ description: '销售ID', example: 2 })
  @IsNotEmpty({ message: '销售ID不能为空' })
  @IsInt()
  salesId: number;

  @ApiPropertyOptional({ description: '销售微信号', example: 'sales_wx' })
  @IsOptional()
  @IsString()
  salesWechat?: string;

  @ApiPropertyOptional({
    description: '客户意向度',
    example: '高',
  })
  @IsOptional()
  @IsString()
  customerIntent?: string;

  @ApiPropertyOptional({
    description: '下次回访时间',
    example: '2025-10-28 10:00:00',
  })
  @IsOptional()
  nextFollowTime?: Date;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
