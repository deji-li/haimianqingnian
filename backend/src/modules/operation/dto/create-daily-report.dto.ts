import { IsNotEmpty, IsInt, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class CreateDailyReportDto {
  @IsNotEmpty({ message: '日报日期不能为空' })
  @IsDateString({}, { message: '日报日期格式不正确' })
  reportDate: string;

  @IsNotEmpty({ message: '账号ID不能为空' })
  @IsInt({ message: '账号ID必须是整数' })
  accountId: number;

  @IsNotEmpty({ message: '运营人员ID不能为空' })
  @IsInt({ message: '运营人员ID必须是整数' })
  operatorId: number;

  @IsOptional()
  @IsInt({ message: '更新次数必须是整数' })
  updateCount?: number;

  @IsOptional()
  @IsString({ message: '内容标签必须是字符串' })
  contentTags?: string;

  @IsOptional()
  @IsInt({ message: '浏览量最小值必须是整数' })
  viewMin?: number;

  @IsOptional()
  @IsInt({ message: '浏览量最大值必须是整数' })
  viewMax?: number;

  @IsOptional()
  @IsInt({ message: '播放量最小值必须是整数' })
  playMin?: number;

  @IsOptional()
  @IsInt({ message: '播放量最大值必须是整数' })
  playMax?: number;

  @IsOptional()
  @IsInt({ message: '评论数最小值必须是整数' })
  commentMin?: number;

  @IsOptional()
  @IsInt({ message: '评论数最大值必须是整数' })
  commentMax?: number;

  @IsOptional()
  @IsInt({ message: '私信数最小值必须是整数' })
  messageMin?: number;

  @IsOptional()
  @IsInt({ message: '私信数最大值必须是整数' })
  messageMax?: number;

  @IsOptional()
  @IsInt({ message: '账号状态变化标识必须是0或1' })
  accountStatusChanged?: number;

  @IsOptional()
  @IsString({ message: '新状态必须是字符串' })
  newStatus?: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
