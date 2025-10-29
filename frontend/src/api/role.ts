import request from '@/utils/request'

export interface Role {
  id: number
  roleName: string
  roleKey: string
  dataScope?: string
  status: number
  remark?: string
  isSystem: boolean
  userCount?: number
  createTime: string
  updateTime: string
}

export interface CreateRoleParams {
  name: string
  code: string
  description?: string
  status?: number
}

export interface UpdateRoleParams {
  name?: string
  code?: string
  description?: string
  status?: number
}

// 获取角色列表
export function getRoleList() {
  return request<Role[]>({
    url: '/role',
    method: 'get',
  })
}

// 获取角色详情
export function getRoleDetail(id: number) {
  return request<Role>({
    url: `/role/${id}`,
    method: 'get',
  })
}

// 创建角色
export function createRole(data: CreateRoleParams) {
  return request<Role>({
    url: '/role',
    method: 'post',
    data,
  })
}

// 更新角色
export function updateRole(id: number, data: UpdateRoleParams) {
  return request<Role>({
    url: `/role/${id}`,
    method: 'put',
    data,
  })
}

// 删除角色
export function deleteRole(id: number) {
  return request({
    url: `/role/${id}`,
    method: 'delete',
  })
}

// 切换角色状态
export function toggleRoleStatus(id: number) {
  return request({
    url: `/role/${id}/toggle-status`,
    method: 'patch',
  })
}

// 更新角色状态（用于 Switch 组件）
export function updateRoleStatus(id: number, status: number) {
  return request({
    url: `/role/${id}/status`,
    method: 'patch',
    data: { status },
  })
}
