/**
 * 客户相关类型定义
 */

import type { IDField, Timestamps } from './common'

// 客户生命周期阶段
export type LifecycleStage = '线索' | '意向' | '报价' | '谈判' | '成交' | '流失'

// 客户意向等级
export type CustomerIntent = '高' | '中' | '低'

// 客户质量等级
export type QualityLevel = 'A' | 'B' | 'C' | 'D'

// 家庭经济水平
export type EconomicLevel = '高' | '中' | '低'

// 流量平台
export type TrafficPlatform = '小红书' | '抖音' | '视频号'

// 流量城市
export type TrafficCity = '广州' | '上海' | '深圳' | '北京'

// 客户实体
export interface Customer extends IDField, Timestamps {
  // 基本信息
  wechatNickname?: string
  wechatId: string
  phone?: string
  realName?: string

  // 来源信息
  trafficSource?: string
  trafficPlatform?: TrafficPlatform
  trafficCity?: TrafficCity

  // 负责人信息
  operatorId?: number
  salesId: number
  salesWechat?: string

  // 客户状态
  customerIntent: CustomerIntent
  lifecycleStage?: LifecycleStage
  nextFollowTime?: string

  // 学生信息
  studentGrade?: string
  studentAge?: number

  // 家庭信息
  familyEconomicLevel?: EconomicLevel
  decisionMakerRole?: string
  parentRole?: string
  location?: string

  // AI分析
  estimatedValue?: number
  qualityLevel?: QualityLevel
  aiProfile?: Record<string, any>
  lastAiAnalysisTime?: string

  // 其他
  remark?: string
}

// 创建客户DTO
export interface CreateCustomerDto {
  wechatId: string
  wechatNickname?: string
  phone?: string
  realName?: string
  trafficSource?: string
  trafficPlatform?: TrafficPlatform
  trafficCity?: TrafficCity
  studentGrade?: string
  studentAge?: number
  familyEconomicLevel?: EconomicLevel
  parentRole?: string
  location?: string
  customerIntent?: CustomerIntent
  remark?: string
}

// 更新客户DTO
export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  lifecycleStage?: LifecycleStage
  nextFollowTime?: string
}

// 客户查询参数
export interface CustomerQuery {
  page?: number
  pageSize?: number
  lifecycleStage?: LifecycleStage
  customerIntent?: CustomerIntent
  qualityLevel?: QualityLevel
  salesId?: number
  keyword?: string
}
