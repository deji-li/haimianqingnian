/**
 * 认证相关API
 */
import type { LoginDto, LoginResponse, UserInfo } from '@shared/types'
import { http } from '@/utils/request'

/**
 * 用户登录
 */
export function login(data: LoginDto) {
  return http.post<LoginResponse>('/auth/login', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return http.get<UserInfo>('/auth/userinfo')
}

/**
 * 退出登录
 */
export function logout() {
  return http.post('/auth/logout')
}
