/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD HH:mm'
 */
export function formatDate(
  date: string | Date | undefined | null,
  format: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD HH:mm' = 'YYYY-MM-DD',
): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  } else if (format === 'YYYY-MM-DD HH:mm') {
    return `${year}-${month}-${day} ${hour}:${minute}`
  } else {
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
}

/**
 * 格式化手机号
 * @param phone 手机号
 * @param mask 是否隐藏中间4位
 */
export function formatPhone(phone: string | undefined | null, mask = false): string {
  if (!phone) return ''

  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '')

  if (mask && cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`
  }

  // 格式化为 138-1234-5678
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }

  return cleaned
}

/**
 * 格式化金额
 * @param amount 金额
 * @param showSymbol 是否显示货币符号
 */
export function formatMoney(amount: number | string | undefined | null, showSymbol = true): string {
  if (amount === undefined || amount === null || amount === '') return showSymbol ? '¥0.00' : '0.00'

  // 转换为数字
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return showSymbol ? '¥0.00' : '0.00'

  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return showSymbol ? `¥${formatted}` : formatted
}

/**
 * 格式化百分比
 * @param value 值
 * @param total 总数
 * @param decimals 小数位数
 */
export function formatPercent(
  value: number,
  total: number,
  decimals = 1,
): string {
  if (total === 0) return '0%'
  const percent = (value / total) * 100
  return `${percent.toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 相对时间格式化
 * @param date 日期
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(d, 'YYYY-MM-DD')
}
