import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateOperationAccountDto {
  @IsNotEmpty({ message: '平台类型不能为空' })
  @IsEnum(['小红书', '抖音', '视频号'], { message: '平台类型只能是：小红书、抖音、视频号' })
  platformType: string;

  @IsNotEmpty({ message: '账号名称不能为空' })
  @IsString({ message: '账号名称必须是字符串' })
  accountName: string;

  @IsOptional()
  @IsString({ message: '账号ID必须是字符串' })
  accountId?: string;

  @IsNotEmpty({ message: '关联校区不能为空' })
  @IsInt({ message: '校区ID必须是整数' })
  campusId: number;

  @IsNotEmpty({ message: '负责运营人员ID不能为空' })
  @IsInt({ message: '运营人员ID必须是整数' })
  operatorId: number;

  @IsOptional()
  @IsString({ message: '账号类型必须是字符串' })
  accountType?: string;

  @IsOptional()
  @IsEnum(['正常', '风险', '封号', '掉号'], { message: '状态只能是：正常、风险、封号、掉号' })
  status?: string;

  @IsOptional()
  @IsInt({ message: '粉丝量必须是整数' })
  fansCount?: number;

  @IsOptional()
  @IsInt({ message: '总点赞量必须是整数' })
  totalLikes?: number;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
