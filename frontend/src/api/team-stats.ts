import request from '@/utils/request'

// 团队成员业绩DTO
export interface TeamMemberPerformance {
  userId: number
  userName: string
  realName: string
  avatar?: string
  departmentName?: string
  campusName?: string
  totalAmount: number
  orderCount: number
  customerCount: number
  newCustomerCount: number
  followCount: number
  targetAmount?: number
  targetCompletion?: number
  rank?: number
}

// 团队整体统计DTO
export interface TeamOverview {
  totalMembers: number
  totalAmount: number
  totalOrders: number
  totalCustomers: number
  avgAmountPerMember: number
  avgOrdersPerMember: number
  amountGrowthRate?: number
  orderGrowthRate?: number
}

// 部门业绩对比DTO
export interface DepartmentPerformance {
  departmentId: number
  departmentName: string
  memberCount: number
  totalAmount: number
  orderCount: number
  customerCount: number
  avgAmountPerMember: number
}

// 校区业绩对比DTO
export interface CampusPerformance {
  campusId: number
  campusName: string
  memberCount: number
  totalAmount: number
  orderCount: number
  customerCount: number
  avgAmountPerMember: number
}

// 查询参数
export interface TeamStatsQuery {
  startDate?: string
  endDate?: string
  departmentId?: number
  campusId?: number
  sortBy?: 'totalAmount' | 'orderCount' | 'customerCount'
  limit?: number
}

/**
 * 获取团队成员业绩排行榜
 */
export const getTeamMemberPerformance = (params?: TeamStatsQuery) => {
  return request<TeamMemberPerformance[]>({
    url: '/team-stats/member-performance',
    method: 'get',
    params,
  })
}

/**
 * 获取团队整体统计
 */
export const getTeamOverview = (params?: TeamStatsQuery) => {
  return request<TeamOverview>({
    url: '/team-stats/overview',
    method: 'get',
    params,
  })
}

/**
 * 获取部门业绩对比
 */
export const getDepartmentComparison = (params?: TeamStatsQuery) => {
  return request<DepartmentPerformance[]>({
    url: '/team-stats/department-comparison',
    method: 'get',
    params,
  })
}

/**
 * 获取校区业绩对比
 */
export const getCampusComparison = (params?: TeamStatsQuery) => {
  return request<CampusPerformance[]>({
    url: '/team-stats/campus-comparison',
    method: 'get',
    params,
  })
}
