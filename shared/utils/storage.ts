/**
 * 本地存储工具函数
 */

/**
 * 存储键名常量
 */
export const StorageKeys = {
  TOKEN: 'crm_token',
  USER_INFO: 'crm_user_info',
  THEME: 'crm_theme',
  LANGUAGE: 'crm_language',
} as const

/**
 * 设置localStorage
 */
export function setStorage(key: string, value: any): void {
  try {
    const data = JSON.stringify(value)
    localStorage.setItem(key, data)
  } catch (error) {
    console.error('setStorage error:', error)
  }
}

/**
 * 获取localStorage
 */
export function getStorage<T = any>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('getStorage error:', error)
    return null
  }
}

/**
 * 移除localStorage
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('removeStorage error:', error)
  }
}

/**
 * 清空localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('clearStorage error:', error)
  }
}

/**
 * 设置sessionStorage
 */
export function setSessionStorage(key: string, value: any): void {
  try {
    const data = JSON.stringify(value)
    sessionStorage.setItem(key, data)
  } catch (error) {
    console.error('setSessionStorage error:', error)
  }
}

/**
 * 获取sessionStorage
 */
export function getSessionStorage<T = any>(key: string): T | null {
  try {
    const data = sessionStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('getSessionStorage error:', error)
    return null
  }
}

/**
 * 移除sessionStorage
 */
export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('removeSessionStorage error:', error)
  }
}
