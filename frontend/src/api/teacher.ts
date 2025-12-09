import request from '@/utils/request'

// 老师信息接口
export interface Teacher {
  id: number
  name: string
  displayName: string
  phone: string
  idCard: string
  bankAccount: string
  bankName: string
  subject: string
  level: string
  campusId: number
  defaultCommissionRate: number
  totalSales: number
  totalCommission: number
  pendingSettlement: number
  status: string
  joinDate: string
  leaveDate: string
  remark: string
  createTime: string
  updateTime: string
  campus?: {
    id: number
    campusName: string
  }
  // 兼容性字段
  campusName?: string
  teacherName?: string
  orderCount?: number
  studentCount?: number
  teacherType?: string
  commissionRate?: number
  // 多校区字段
  campuses?: Array<{
    id: number
    campusName: string
    isPrimary: boolean
  }>
  campusIds?: number[]
}

// 老师查询参数
export interface TeacherQuery {
  page?: number
  pageSize?: number
  keyword?: string
  campusId?: number
  status?: string
}

// 老师创建参数
export interface CreateTeacherParams {
  name: string
  displayName: string
  phone?: string
  idCard?: string
  bankAccount?: string
  bankName?: string
  subject?: string
  level?: string
  campusId?: number
  defaultCommissionRate?: number
  status?: string
  joinDate?: string
  remark?: string
}

// 老师排行榜参数
export interface TeacherRankingParams {
  type: 'commission' | 'orderCount' | 'studentCount'
  timeRange?: 'day' | 'week' | 'month' | 'year'
  campusId?: number
  limit?: number
}

// 老师排行榜项
export interface TeacherRankingItem {
  rank: number
  teacherId: string
  teacherName: string
  campusName: string
  value: number
}

// 老师详情响应（包含业绩统计）
export interface TeacherDetail extends Teacher {
  // 业绩统计
  orderCount: number
  studentCount: number
  totalOrders: number
  averageOrderValue: number
  // 利润计算
  totalProfit: number // 为公司创造的总利润（订单���额 - 老师提成）
  profitRate: number // 利润率
  // 关联订单
  recentOrders?: Array<{
    id: number
    orderNo: string
    courseName: string
    paymentAmount: number
    teacherCommission: number
    profit: number
    paymentTime: string
    orderStatus: string
    customerName?: string
  }>
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 获取老师列表
export function getTeacherList(params: TeacherQuery) {
  return request<PageResponse<Teacher>>({
    url: '/teacher/list',
    method: 'get',
    params,
  })
}

// 获取老师排行榜
export function getTeacherRanking(params: TeacherRankingParams) {
  return request<TeacherRankingItem[]>({
    url: '/teacher/ranking',
    method: 'get',
    params,
  })
}

// 创建老师
export function createTeacher(data: CreateTeacherParams) {
  return request<Teacher>({
    url: '/teacher/create',
    method: 'post',
    data,
  })
}

// 更新老师信息
export function updateTeacher(id: number, data: Partial<CreateTeacherParams>) {
  return request<Teacher>({
    url: `/teacher/${id}`,
    method: 'put',
    data,
  })
}

// 删除老师
export function deleteTeacher(id: number) {
  return request({
    url: `/teacher/${id}`,
    method: 'delete',
  })
}

// 获取老师详情
export function getTeacherDetail(id: number) {
  return request<TeacherDetail>({
    url: `/teacher/${id}`,
    method: 'get',
  })
}

// 导出API对象（用于兼容旧代码）
export const teacherApi = {
  getTeacherList,
  getTeacherRanking,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherDetail,
}