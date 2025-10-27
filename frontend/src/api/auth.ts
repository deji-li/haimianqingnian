import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  access_token: string
  user: {
    id: number
    username: string
    realName: string
    roleCode: string
    roleName: string
    departmentId?: number
    campusId?: number
  }
}

export interface UserInfo {
  id: number
  username: string
  realName: string
  phone?: string
  email?: string
  roleCode: string
  roleName: string
  departmentName?: string
  campusName?: string
  avatar?: string
}

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
