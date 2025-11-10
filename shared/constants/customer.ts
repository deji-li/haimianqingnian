/**
 * 客户相关常量定义
 */

import type { LifecycleStage, CustomerIntent, QualityLevel, TrafficPlatform, TrafficCity, EconomicLevel } from '../types'

/**
 * 客户生命周期阶段选项
 */
export const LIFECYCLE_STAGES: Array<{
  label: LifecycleStage
  value: LifecycleStage
  color: string
}> = [
  { label: '线索', value: '线索', color: '#909399' },
  { label: '意向', value: '意向', color: '#409EFF' },
  { label: '报价', value: '报价', color: '#E6A23C' },
  { label: '谈判', value: '谈判', color: '#F56C6C' },
  { label: '成交', value: '成交', color: '#67C23A' },
  { label: '流失', value: '流失', color: '#C0C4CC' },
]

/**
 * 客户意向等级选项
 */
export const CUSTOMER_INTENT_LEVELS: Array<{
  label: CustomerIntent
  value: CustomerIntent
  color: string
}> = [
  { label: '高', value: '高', color: '#F56C6C' },
  { label: '中', value: '中', color: '#E6A23C' },
  { label: '低', value: '低', color: '#909399' },
]

/**
 * 客户质量等级选项
 */
export const QUALITY_LEVELS: Array<{
  label: QualityLevel
  value: QualityLevel
  color: string
  desc: string
}> = [
  { label: 'A', value: 'A', color: '#F56C6C', desc: '优质客户' },
  { label: 'B', value: 'B', color: '#E6A23C', desc: '良好客户' },
  { label: 'C', value: 'C', color: '#409EFF', desc: '一般客户' },
  { label: 'D', value: 'D', color: '#909399', desc: '低价值客户' },
]

/**
 * 流量平台选项
 */
export const TRAFFIC_PLATFORMS: Array<{
  label: string
  value: TrafficPlatform
}> = [
  { label: '小红书', value: '小红书' },
  { label: '抖音', value: '抖音' },
  { label: '视频号', value: '视频号' },
]

/**
 * 流量城市选项
 */
export const TRAFFIC_CITIES: Array<{
  label: string
  value: TrafficCity
}> = [
  { label: '广州', value: '广州' },
  { label: '上海', value: '上海' },
  { label: '深圳', value: '深圳' },
  { label: '北京', value: '北京' },
]

/**
 * 家庭经济水平选项
 */
export const ECONOMIC_LEVELS: Array<{
  label: EconomicLevel
  value: EconomicLevel
}> = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

/**
 * 学生年级选项
 */
export const STUDENT_GRADES = [
  '幼儿园',
  '小学一年级',
  '小学二年级',
  '小学三年级',
  '小学四年级',
  '小学五年级',
  '小学六年级',
  '初中一年级',
  '初中二年级',
  '初中三年级',
  '高中一年级',
  '高中二年级',
  '高中三年级',
  '大学',
  '其他',
]

/**
 * 家长角色选项
 */
export const PARENT_ROLES = [
  '父亲',
  '母亲',
  '爷爷',
  '奶奶',
  '外公',
  '外婆',
  '其他监护人',
]

/**
 * 决策人角色选项
 */
export const DECISION_MAKER_ROLES = [
  '父亲',
  '母亲',
  '共同决策',
  '爷爷奶奶',
  '外公外婆',
  '学生本人',
]
