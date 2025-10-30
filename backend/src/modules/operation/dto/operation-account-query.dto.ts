import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OperationAccountQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  pageSize?: number;

  @IsOptional()
  @IsEnum(['小红书', '抖音', '视频号'], { message: '平台类型只能是：小红书、抖音、视频号' })
  platformType?: string;

  @IsOptional()
  @IsEnum(['广州', '上海', '深圳', '北京'], { message: '城市只能是：广州、上海、深圳、北京' })
  city?: string;

  @IsOptional()
  @IsEnum(['正常', '风险', '封号', '掉号'], { message: '状态只能是：正常、风险、封号、掉号' })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '运营人员ID必须是整数' })
  operatorId?: number;

  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  keyword?: string;
}
