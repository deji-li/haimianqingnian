import request from '@/utils/request'
// 使用@shared包的类型定义
import type { LoginDto, LoginResponse, UserInfo } from '@shared/types'

// 重新导出类型，保持向后兼容
export type LoginParams = LoginDto
export type LoginResult = LoginResponse
export type { UserInfo }

// 用户登录
export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取用户信息
export function getUserInfo() {
  return request<UserInfo>({
    url: '/auth/userinfo',
    method: 'get',
  })
}
