import { IsOptional, IsArray, IsNumber, IsString, IsObject } from 'class-validator';

/**
 * 智能创建客户请求DTO
 */
export class SmartCreateCustomerDto {
  /**
   * 聊天截图的文件ID列表（已上传到系统的文件）
   */
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  imageFileIds?: number[];

  /**
   * 聊天截图的URL列表（外部URL或临时URL）
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  /**
   * 聊天截图的base64列表（用于Ctrl+V粘贴场景）
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageBase64List?: string[];

  /**
   * 已知的客户基本信息（wechatId必填，其他可选）
   */
  @IsOptional()
  @IsObject()
  knownInfo?: {
    wechatId?: string; // 微信号（必填）
    wechatNickname?: string;
    phone?: string;
  };
}

/**
 * 智能创建客户响应DTO
 */
export class SmartCreateCustomerResponseDto {
  /**
   * 基础信息
   */
  basicInfo: {
    realName?: string; // 真实姓名
    wechatNickname?: string; // 微信昵称
    phone?: string; // 手机号
    gender?: string; // 性别
    location?: string; // 所在地区
    studentGrade?: string; // 学生年级
    studentAge?: number; // 学生年龄
  };

  /**
   * 意向信息
   */
  intentInfo: {
    customerIntent?: string; // 意向等级：高意向/中意向/低意向/无意向
    intentionScore?: number; // 意向分数 0-100
    customerStage?: string; // 客户阶段：初次接触/需求确认/方案沟通/报价/成交
    estimatedValue?: number; // 预估成交金额
    estimatedCycle?: string; // 预估成交周期
    dealOpportunity?: string; // 成交机会：高/中/低
  };

  /**
   * 标签画像
   */
  tags: {
    aiTags: string[]; // AI生成的标签
    profile: {
      parentRole?: string; // 家长角色
      familyEconomicLevel?: string; // 家庭经济水平
      educationAttitude?: string; // 教育重视程度
      decisionMakerRole?: string; // 决策者角色
      communicationStyle?: string; // 沟通风格
      trustLevel?: string; // 信任程度
    };
  };

  /**
   * 跟进建议
   */
  followUpAdvice: {
    nextSteps: string[]; // 下一步行动建议
    salesStrategy?: string; // 销售策略
    riskFactors: string[]; // 风险因素
    customerNeeds: string[]; // 客户需求
    customerPainPoints: string[]; // 客户痛点
    customerObjections: string[]; // 客户异议
  };

  /**
   * 原始聊天文本（OCR识别结果）
   */
  chatText: string;

  /**
   * AI分析原始结果（完整的20+维度数据）
   */
  rawAnalysisResult: any;
}
