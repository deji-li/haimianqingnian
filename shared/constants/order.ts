/**
 * 订单相关常量定义
 */

import type { OrderStatus, DataSource } from '../types'

/**
 * 订单状态选项
 */
export const ORDER_STATUSES: Array<{
  label: OrderStatus
  value: OrderStatus
  color: string
}> = [
  { label: '待上课', value: '待上课', color: '#E6A23C' },
  { label: '上课中', value: '上课中', color: '#409EFF' },
  { label: '已完成', value: '已完成', color: '#67C23A' },
  { label: '已退款', value: '已退款', color: '#909399' },
]

/**
 * 数据来源选项
 */
export const DATA_SOURCES: Array<{
  label: string
  value: DataSource
}> = [
  { label: '手工录入', value: '手工录入' },
  { label: '小程序导入', value: '小程序导入' },
]

/**
 * 是否新生选项
 */
export const NEW_STUDENT_OPTIONS = [
  { label: '新生', value: true },
  { label: '老生', value: false },
]

/**
 * 订单标签选项
 */
export const ORDER_TAGS = [
  '暑期班',
  '寒假班',
  '周末班',
  '一对一',
  '小班课',
  '试听课',
  '体验课',
  '续费',
  '推荐',
]

/**
 * 课程类型选项
 */
export const COURSE_TYPES = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '政治',
  '历史',
  '地理',
  '科学',
  '编程',
  '美术',
  '音乐',
  '舞蹈',
  '体育',
  '其他',
]
