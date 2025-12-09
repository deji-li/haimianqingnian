import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBusinessConfigDto {
  @ApiProperty({ description: '配置键' })
  @IsString()
  @IsNotEmpty()
  configKey: string;

  @ApiProperty({ description: '配置值' })
  configValue: any;
}
