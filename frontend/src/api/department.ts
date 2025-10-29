import request from '@/utils/request'

export interface Department {
  id: number
  departmentName: string
  parentId?: number
  managerId?: number
  managerName?: string
  description?: string
  sort: number
  status: number
  createTime: string
  updateTime: string
  children?: Department[]
}

export interface CreateDepartmentParams {
  departmentName: string
  parentId?: number
  managerId?: number
  description?: string
  sort?: number
}

// 获取部门列表（树形）
export function getDepartmentList() {
  return request<Department[]>({
    url: '/department',
    method: 'get',
  })
}

// 获取部门详情
export function getDepartmentDetail(id: number) {
  return request<Department>({
    url: `/department/${id}`,
    method: 'get',
  })
}

// 创建部门
export function createDepartment(data: CreateDepartmentParams) {
  return request<Department>({
    url: '/department',
    method: 'post',
    data,
  })
}

// 更新部门
export function updateDepartment(id: number, data: Partial<CreateDepartmentParams> & { status?: number }) {
  return request<Department>({
    url: `/department/${id}`,
    method: 'put',
    data,
  })
}

// 删除部门
export function deleteDepartment(id: number) {
  return request({
    url: `/department/${id}`,
    method: 'delete',
  })
}

// 切换状态
export function toggleDepartmentStatus(id: number) {
  return request({
    url: `/department/${id}/toggle-status`,
    method: 'patch',
  })
}
