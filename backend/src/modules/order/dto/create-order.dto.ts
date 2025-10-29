import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: '订单号', example: 'ORD202510280001' })
  @IsNotEmpty({ message: '订单号不能为空' })
  @IsString()
  orderNo: string;

  @ApiPropertyOptional({ description: '客户ID', example: 1 })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ description: '微信号', example: 'wx_user001' })
  @IsOptional()
  @IsString()
  wechatId?: string;

  @ApiPropertyOptional({ description: '微信昵称', example: '张三' })
  @IsOptional()
  @IsString()
  wechatNickname?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '销售ID', example: 2 })
  @IsNotEmpty({ message: '销售ID不能为空' })
  @IsInt()
  salesId: number;

  @ApiPropertyOptional({ description: '校区ID', example: 1 })
  @IsOptional()
  @IsInt()
  campusId?: number;

  @ApiProperty({ description: '课程名称', example: '少儿编程基础班' })
  @IsNotEmpty({ message: '课程名称不能为空' })
  @IsString()
  courseName: string;

  @ApiProperty({ description: '付款金额', example: 3980 })
  @IsNotEmpty({ message: '付款金额不能为空' })
  @IsNumber()
  paymentAmount: number;

  @ApiProperty({
    description: '支付时间',
    example: '2025-10-28 10:00:00',
  })
  @IsNotEmpty({ message: '支付时间不能为空' })
  @IsDateString()
  paymentTime: Date;

  @ApiPropertyOptional({
    description: '订单状态',
    enum: ['待上课', '上课中', '已完成', '已退款'],
    example: '待上课',
  })
  @IsOptional()
  @IsEnum(['待上课', '上课中', '已完成', '已退款'])
  orderStatus?: string;

  @ApiPropertyOptional({ description: '授课老师', example: '刘老师' })
  @IsOptional()
  @IsString()
  teacherName?: string;

  @ApiPropertyOptional({ description: '所属地区', example: '北京' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '分销销售' })
  @IsOptional()
  @IsString()
  distributorSales?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({
    description: '数据来源',
    enum: ['手工录入', '小程序导入'],
    example: '手工录入',
  })
  @IsOptional()
  @IsEnum(['手工录入', '小程序导入'])
  dataSource?: string;
}
