import request from '@/utils/request'

export interface Campus {
  id: number
  campusName: string
  campusCode: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  managerId?: number
  managerName?: string
  description?: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface CreateCampusParams {
  campusName: string
  campusCode: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  managerId?: number
  description?: string
  sort?: number
}

// 获取校区列表
export function getCampusList() {
  return request<Campus[]>({
    url: '/campus',
    method: 'get',
  })
}

// 获取校区详情
export function getCampusDetail(id: number) {
  return request<Campus>({
    url: `/campus/${id}`,
    method: 'get',
  })
}

// 创建校区
export function createCampus(data: CreateCampusParams) {
  return request<Campus>({
    url: '/campus',
    method: 'post',
    data,
  })
}

// 更新校区
export function updateCampus(id: number, data: Partial<CreateCampusParams> & { status?: number }) {
  return request<Campus>({
    url: `/campus/${id}`,
    method: 'put',
    data,
  })
}

// 删除校区
export function deleteCampus(id: number) {
  return request({
    url: `/campus/${id}`,
    method: 'delete',
  })
}

// 切换状态
export function toggleCampusStatus(id: number) {
  return request({
    url: `/campus/${id}/toggle-status`,
    method: 'patch',
  })
}
