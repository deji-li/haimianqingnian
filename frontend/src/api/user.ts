import request from '@/utils/request'

export interface User {
  id: number
  username: string
  realName: string
  roleCode: string
  roleName?: string
  departmentId?: number
  departmentName?: string
  campusId?: number
  campusName?: string
  phone?: string
  email?: string
  avatar?: string
  status: number
  createTime: Date
  updateTime: Date
}

export interface UserQuery {
  page: number
  pageSize: number
  keyword?: string
  roleCode?: string
  status?: number
}

export interface CreateUserParams {
  username: string
  password: string
  realName: string
  roleCode: string
  departmentId?: number
  campusId?: number
  phone?: string
  email?: string
  status?: number
}

export interface UpdateUserParams {
  realName?: string
  roleCode?: string
  departmentId?: number
  campusId?: number
  phone?: string
  email?: string
  avatar?: string
  status?: number
}

// 获取用户列表
export const getUserList = (params: UserQuery) => {
  return request<{ list: User[]; total: number; page: number; pageSize: number }>({
    url: '/user',
    method: 'get',
    params,
  })
}

// 获取用户详情
export const getUserDetail = (id: number) => {
  return request<User>({
    url: `/user/${id}`,
    method: 'get',
  })
}

// 创建用户
export const createUser = (data: CreateUserParams) => {
  return request({
    url: '/user',
    method: 'post',
    data,
  })
}

// 更新用户
export const updateUser = (id: number, data: UpdateUserParams) => {
  return request({
    url: `/user/${id}`,
    method: 'patch',
    data,
  })
}

// 删除用户
export const deleteUser = (id: number) => {
  return request({
    url: `/user/${id}`,
    method: 'delete',
  })
}

// 重置密码
export const resetPassword = (id: number, newPassword: string) => {
  return request({
    url: `/user/${id}/reset-password`,
    method: 'post',
    data: { newPassword },
  })
}

// 修改密码（当前用户）
export const changePassword = (oldPassword: string, newPassword: string) => {
  return request({
    url: '/user/change-password',
    method: 'post',
    data: { oldPassword, newPassword },
  })
}

// 启用/禁用用户
export const toggleUserStatus = (id: number) => {
  return request({
    url: `/user/${id}/toggle-status`,
    method: 'post',
  })
}
