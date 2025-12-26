import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: '剧本ID', example: 1 })
  @IsNumber()
  script_id: number;

  @ApiProperty({ description: '客户角色ID', example: 1 })
  @IsNumber()
  customer_persona_id: number;

  @ApiPropertyOptional({ description: '会话名称', example: '首次接触培训 - 犹豫客户' })
  @IsOptional()
  @IsString()
  session_name?: string;

  @ApiPropertyOptional({
    description: '培训目标',
    example: ['建立初步信任', '了解��户真实需求', '获得下次沟通机会'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  training_goals?: string[];

  @ApiPropertyOptional({ description: '最大对话轮次', example: 6 })
  @IsOptional()
  @IsNumber()
  max_rounds?: number;

  @ApiPropertyOptional({
    description: '自定义难度设置',
    example: { response_delay: 'normal', objection_intensity: 0.7 }
  })
  @IsOptional()
  @IsObject()
  custom_difficulty?: Record<string, any>;
}

export class SendMessageDto {
  @ApiProperty({ description: '消息内容', example: '您好，我是XX公司的销售顾问，想了解一下您的需求' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '是否结束会话', example: false })
  @IsOptional()
  end_session?: boolean;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: '会话状态', enum: ['preparing', 'active', 'paused', 'completed', 'abandoned'] })
  @IsOptional()
  @IsEnum(['preparing', 'active', 'paused', 'completed', 'abandoned'])
  session_status?: string;

  @ApiPropertyOptional({ description: '当前轮次', example: 3 })
  @IsOptional()
  @IsNumber()
  current_round?: number;

  @ApiPropertyOptional({ description: '对话历史', example: { messages: [] } })
  @IsOptional()
  @IsObject()
  conversation_history?: Record<string, any>;

  @ApiPropertyOptional({ description: '会话指标', example: { duration: 300, response_speed: 2.5 } })
  @IsOptional()
  @IsObject()
  session_metrics?: Record<string, any>;
}