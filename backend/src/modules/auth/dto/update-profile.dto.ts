import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: '真实姓名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  realName?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
