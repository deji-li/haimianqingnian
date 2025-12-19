import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  content: string;

  @IsOptional()
  @IsString({ message: '客户姓名必须是字符串' })
  customerName?: string;

  @IsOptional()
  @IsString({ message: '客户画像必须是字符串' })
  customerProfile?: string;

  @IsOptional()
  @IsString({ message: '场景描述必须是字符串' })
  scenario?: string;

  @IsOptional()
  @IsString({ message: '技巧说明必须是字符串' })
  technique?: string;

  @IsOptional()
  @IsArray({ message: '知识库内容必须是数组' })
  knowledgeContent?: string[];

  @IsOptional()
  @IsArray({ message: '对话历史必须是数组' })
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}