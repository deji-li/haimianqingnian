/**
 * 用户相关API接口定义
 */

import type {
  LoginDto,
  LoginResponse,
  UserInfo,
  UpdateProfileDto,
  User,
  PageResponse,
} from '../types'

export interface AuthApi {
  // 登录
  login(data: LoginDto): Promise<LoginResponse>

  // 登出
  logout(): Promise<void>

  // 获取当前用户信息
  getUserInfo(): Promise<UserInfo>

  // 更新个人信息
  updateProfile(data: UpdateProfileDto): Promise<UserInfo>

  // 修改密码
  changePassword(data: {
    oldPassword: string
    newPassword: string
  }): Promise<void>
}

export interface UserApi {
  // 获取用户列表
  getUsers(query: {
    page?: number
    pageSize?: number
    roleId?: number
    status?: number
    keyword?: string
  }): Promise<PageResponse<User>>

  // 获取用户详情
  getUserById(id: number): Promise<User>

  // 创建用户
  createUser(data: {
    username: string
    password: string
    realName: string
    phone?: string
    email?: string
    roleId: number
    departmentId?: number
    campusId?: number
  }): Promise<User>

  // 更新用户
  updateUser(
    id: number,
    data: {
      realName?: string
      phone?: string
      email?: string
      roleId?: number
      departmentId?: number
      campusId?: number
      status?: number
    },
  ): Promise<User>

  // 删除用户
  deleteUser(id: number): Promise<void>

  // 重置密码
  resetPassword(id: number, newPassword: string): Promise<void>

  // 获取销售人员列表（用于下拉选择）
  getSalesList(): Promise<Array<{ id: number; realName: string }>>
}
