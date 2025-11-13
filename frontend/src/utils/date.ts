import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

// 配置dayjs使用中文
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

/**
 * 格式化日期时间为中文友好格式
 * @param date 日期字符串或Date对象
 * @param format 格式模板，默认：'YYYY年MM月DD日 HH:mm'
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(date: string | Date | undefined | null, format = 'YYYY年MM月DD日 HH:mm'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期（不含时间）
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串，如：2025年11月08日
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-'
  return dayjs(date).format('YYYY年MM月DD日')
}

/**
 * 格式化时间（不含日期）
 * @param date 日期字符串或Date对象
 * @returns 格式化后的时间字符串，如：12:30:45
 */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '-'
  return dayjs(date).format('HH:mm:ss')
}

/**
 * 格式化为相对时间
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串，如：3小时前、2天前
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '-'
  return dayjs(date).fromNow()
}

/**
 * 格式化为标准格式（用于数据库等）
 * @param date 日期字符串或Date对象
 * @returns YYYY-MM-DD HH:mm:ss 格式
 */
export function formatStandard(date: string | Date | undefined | null): string {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 检查日期是否逾期
 * @param date 日期字符串或Date对象
 * @returns 是否逾期
 */
export function isOverdue(date: string | Date | undefined | null): boolean {
  if (!date) return false
  return dayjs(date).isBefore(dayjs())
}

/**
 * 检查日期是否即将到期（7天内）
 * @param date 日期字符串或Date对象
 * @returns 是否即将到期
 */
export function isDueSoon(date: string | Date | undefined | null): boolean {
  if (!date) return false
  const targetDate = dayjs(date)
  const now = dayjs()
  return targetDate.isAfter(now) && targetDate.diff(now, 'day') <= 7
}
