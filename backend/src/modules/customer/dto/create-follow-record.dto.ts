import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateFollowRecordDto {
  @ApiProperty({ description: '客户ID', example: 1 })
  @IsNotEmpty({ message: '客户ID不能为空' })
  @IsInt()
  customerId: number;

  @ApiProperty({ description: '跟进内容', example: '电话沟通，客户表示有兴趣' })
  @IsNotEmpty({ message: '跟进内容不能为空' })
  @IsString()
  followContent: string;

  @ApiPropertyOptional({
    description: '下次跟进时间',
    example: '2025-10-30 10:00:00',
  })
  @IsOptional()
  nextFollowTime?: Date;
}
