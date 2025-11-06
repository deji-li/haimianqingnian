import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({ description: '知识分类', example: '课程介绍' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: '知识标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '知识内容' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '关键词（逗号分隔）', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '优先级', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateKnowledgeDto {
  @ApiProperty({ description: '知识分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '知识标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '知识内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '关键词（逗号分隔）', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsNumber()
  isActive?: number;
}

export class QueryKnowledgeDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  limit?: number;

  @ApiProperty({ description: '知识分类', required: false })
  category?: string;

  @ApiProperty({ description: '关键词搜索', required: false })
  keyword?: string;

  @ApiProperty({ description: '是否启用', required: false })
  isActive?: number;
}

export class SearchKnowledgeDto {
  @ApiProperty({ description: '搜索问题' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: '返回数量', required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
