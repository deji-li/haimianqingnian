/**
 * 验证工具函数
 */

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard: string): boolean {
  // 18位身份证号正则
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(idCard)
}

/**
 * 验证用户名（4-20位字母数字下划线）
 */
export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username)
}

/**
 * 验证密码强度
 * @returns { valid: boolean, strength: 'weak' | 'medium' | 'strong' }
 */
export function validatePassword(password: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
} {
  if (password.length < 6) {
    return { valid: false, strength: 'weak' }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let score = 0

  // 长度加分
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // 包含小写字母
  if (/[a-z]/.test(password)) score++

  // 包含大写字母
  if (/[A-Z]/.test(password)) score++

  // 包含数字
  if (/\d/.test(password)) score++

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score >= 4) {
    strength = 'strong'
  } else if (score >= 2) {
    strength = 'medium'
  }

  return {
    valid: password.length >= 6,
    strength,
  }
}

/**
 * 验证微信ID
 */
export function validateWechatId(wechatId: string): boolean {
  // 微信号: 6-20位,字母数字下划线减号
  return /^[a-zA-Z0-9_-]{6,20}$/.test(wechatId)
}

/**
 * 验证金额（最多2位小数）
 */
export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num) || num < 0) return false
  return /^\d+(\.\d{1,2})?$/.test(String(amount))
}

/**
 * 验证订单号格式
 */
export function validateOrderNo(orderNo: string): boolean {
  // 订单号格式: 年月日+流水号, 例如: 20250110001
  return /^\d{11,}$/.test(orderNo)
}

/**
 * 是否为空值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * 验证URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
