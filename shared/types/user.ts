/**
 * 用户相关类型定义
 */

import type { IDField, Timestamps } from './common'

// 用户实体
export interface User extends IDField, Timestamps {
  username: string
  realName: string
  phone?: string
  email?: string
  roleId: number
  departmentId?: number
  campusId?: number
  avatar?: string
  status: number
  lastLoginTime?: string
  superiorId?: number

  // 关联数据（查询时返回）
  roleCode?: string
  roleName?: string
  campusIds?: number[]
}

// 登录DTO
export interface LoginDto {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  user: UserInfo
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  realName: string
  phone?: string
  email?: string
  roleId: number
  roleCode?: string
  roleName?: string
  departmentId?: number
  departmentName?: string
  campusId?: number
  campusName?: string
  avatar?: string
  permissions: string[]
}

// 更新个人信息DTO
export interface UpdateProfileDto {
  realName?: string
  phone?: string
  email?: string
  avatar?: string
}
