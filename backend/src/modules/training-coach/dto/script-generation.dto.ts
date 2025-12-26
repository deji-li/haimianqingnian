import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 中文场景类型到英文的映射
export const SCENARIO_TYPE_MAP = {
  '首次接触': 'first_contact',
  '价格谈判': 'price_negotiation',
  '异议处理': 'objection_handling',
  '关系维护': 'relationship_building',
  '成交缔结': 'closing_deal',
  '产品介绍': 'product_introduction'
};

// 中文难度到数字的映射
export const DIFFICULTY_MAP = {
  '简单': 2,
  '普通': 3,
  '困难': 4,
  '专家': 5
};

export class GenerateScriptFromChatDto {
  @ApiProperty({ description: '剧本标题', example: '优秀话术剧本' })
  @IsString()
  title: string;

  @ApiProperty({ description: '聊天记录内容', example: '客服: 您好，我是XX公司的...' })
  @IsString()
  chat_content: string;

  @ApiProperty({ description: '场景类型', enum: ['首次接触', '价格谈判', '异议处理', '关系维护', '成交缔结'], example: '首次接触' })
  @IsEnum(['首次接触', '价格谈判', '异议处理', '关系维护', '成交缔结', '产品介绍'])
  scenario: string;

  @ApiPropertyOptional({ description: '难度等级', enum: ['简单', '普通', '困难', '专家'], example: '普通' })
  @IsOptional()
  @IsEnum(['简单', '普通', '困难', '专家'])
  difficulty?: string;
}

export class GenerateScriptFromKnowledgeDto {
  @ApiProperty({ description: '剧本标题', example: '产品介绍剧本' })
  @IsString()
  title: string;

  @ApiProperty({ description: '知识库ID', example: '1' })
  @IsString()
  knowledge_base_id: string;

  @ApiProperty({ description: '关键词（逗号分隔）', example: '产品介绍,价格,优惠' })
  @IsString()
  keywords: string;

  @ApiProperty({ description: '场景类型', enum: ['首次接触', '价格谈判', '异议处理', '关系维护', '产品介绍'], example: '首次接触' })
  @IsEnum(['首次接触', '价格谈判', '异议处理', '关系维护', '成交缔结', '产品介绍'])
  scenario: string;

  @ApiPropertyOptional({ description: '难度等级', enum: ['简单', '普通', '困难', '专家'], example: '普通' })
  @IsOptional()
  @IsEnum(['简单', '普通', '困难', '专家'])
  difficulty?: string;
}

export class GenerateScriptWithAIDto {
  @ApiProperty({ description: '剧本标题', example: '大客户谈判技巧培训' })
  @IsString()
  title: string;

  @ApiProperty({ description: '场景类型', enum: ['首次接触', '价格谈判', '异议处理', '关系维护', '成交缔结'], example: '价格谈判' })
  @IsEnum(['首次接触', '价格谈判', '异议处理', '关系维护', '成交缔结', '产品介绍'])
  scenario: string;

  @ApiProperty({ description: '客户背景描述', example: '30岁女性，职场白领，对早教产品感兴趣，注重性价比' })
  @IsString()
  customer_background: string;

  @ApiProperty({ description: '培训目标', example: '掌握开场白技巧，建立初步信任，了解客户真实需求' })
  @IsString()
  training_goal: string;

  @ApiPropertyOptional({ description: '难度等级', enum: ['简单', '普通', '困难', '专家'], example: '普通' })
  @IsOptional()
  @IsEnum(['简单', '普通', '困难', '专家'])
  difficulty?: string;
}

export class ScriptGenerationRequirements {
  @ApiProperty({ description: '场景类型' })
  scenario_type: string;

  @ApiProperty({ description: '客户角色ID' })
  customer_persona_id: number;

  @ApiProperty({ description: '难度等级' })
  difficulty_level: number;

  @ApiProperty({ description: '培训目标列表' })
  training_goals: string[];

  @ApiPropertyOptional({ description: '参考数据' })
  reference_data?: Record<string, any>;

  @ApiPropertyOptional({ description: '产品信息' })
  product_info?: Record<string, any>;

  @ApiPropertyOptional({ description: '行业信息' })
  industry_info?: Record<string, any>;
}
