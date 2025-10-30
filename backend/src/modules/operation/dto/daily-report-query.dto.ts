import { IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class DailyReportQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  pageSize?: number;

  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '账号ID必须是整数' })
  accountId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '运营人员ID必须是整数' })
  operatorId?: number;

  @IsOptional()
  @IsEnum(['小红书', '抖音', '视频号'], { message: '平台类型只能是：小红书、抖音、视频号' })
  platformType?: string;

  @IsOptional()
  @IsEnum(['广州', '上海', '深圳', '北京'], { message: '城市只能是：广州、上海、深圳、北京' })
  city?: string;
}
