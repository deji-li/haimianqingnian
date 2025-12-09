import { http } from '@/utils/request'

// ==================== 角色管理 API ====================

/**
 * 获取角色列表
 */
export function getRoleList() {
  return http.get('/role')
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id: number) {
  return http.get(`/role/${id}`)
}

/**
 * 创建角色
 */
export function createRole(data: any) {
  return http.post('/role', data)
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: any) {
  return http.put(`/role/${id}`, data)
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return http.delete(`/role/${id}`)
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, status: number) {
  return http.patch(`/role/${id}/status`, { status })
}

// ==================== 权限管理 API ====================

/**
 * 获取权限树
 */
export function getPermissionTree() {
  return http.get('/permission/tree')
}

/**
 * 获取权限列表
 */
export function getPermissionList(params?: any) {
  return http.get('/permission/list', params)
}

/**
 * 获取角色的权限
 */
export function getRolePermissions(roleId: number) {
  return http.get(`/permission/role/${roleId}`)
}

/**
 * 为角色分配权限
 */
export function assignPermissionsToRole(roleId: number, permissionIds: number[]) {
  return http.post(`/permission/assign/${roleId}`, { permissionIds })
}

/**
 * 获取所有模块列表
 */
export function getAllModules() {
  return http.get('/permission/modules/list')
}

/**
 * 获取权限类型列表
 */
export function getPermissionTypes() {
  return http.get('/permission/types/list')
}

// ==================== 用户管理 API ====================

/**
 * 获取用户列表
 */
export function getUserList(params?: any) {
  return http.get('/user', params)
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number) {
  return http.get(`/user/${id}`)
}

/**
 * 创建用户
 */
export function createUser(data: any) {
  return http.post('/user', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: any) {
  return http.patch(`/user/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return http.delete(`/user/${id}`)
}

/**
 * 重置密码
 */
export function resetPassword(id: number) {
  return http.post(`/user/${id}/reset-password`)
}

/**
 * 切换用户状态
 */
export function toggleUserStatus(id: number) {
  return http.post(`/user/${id}/toggle-status`)
}

// ==================== 部门管理 API ====================

/**
 * 获取部门列表
 */
export function getDepartmentList() {
  return http.get('/department')
}

/**
 * 获取部门树
 */
export function getDepartmentTree() {
  return http.get('/department/tree')
}

/**
 * 创建部门
 */
export function createDepartment(data: any) {
  return http.post('/department', data)
}

/**
 * 更新部门
 */
export function updateDepartment(id: number, data: any) {
  return http.put(`/department/${id}`, data)
}

/**
 * 删除部门
 */
export function deleteDepartment(id: number) {
  return http.delete(`/department/${id}`)
}

// ==================== 校区管理 API ====================

/**
 * 获取校区列表
 */
export function getCampusList() {
  return http.get('/campus')
}

/**
 * 创建校区
 */
export function createCampus(data: any) {
  return http.post('/campus', data)
}

/**
 * 更新校区
 */
export function updateCampus(id: number, data: any) {
  return http.put(`/campus/${id}`, data)
}

/**
 * 删除校区
 */
export function deleteCampus(id: number) {
  return http.delete(`/campus/${id}`)
}

// ==================== 字典管理 API ====================

/**
 * 获取字典列表
 */
export function getDictionaryList() {
  return http.get('/dictionary')
}

/**
 * 获取字典项
 */
export function getDictionaryItems(type: string) {
  return http.get(`/dictionary/${type}`)
}

/**
 * 创建字典
 */
export function createDictionary(data: any) {
  return http.post('/dictionary', data)
}

/**
 * 更新字典
 */
export function updateDictionary(id: number, data: any) {
  return http.put(`/dictionary/${id}`, data)
}

/**
 * 删除字典
 */
export function deleteDictionary(id: number) {
  return http.delete(`/dictionary/${id}`)
}

export default {
  // 角色
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,

  // 权限
  getPermissionTree,
  getPermissionList,
  getRolePermissions,
  assignPermissionsToRole,
  getAllModules,
  getPermissionTypes,

  // 用户
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,

  // 部门
  getDepartmentList,
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  // 校区
  getCampusList,
  createCampus,
  updateCampus,
  deleteCampus,

  // 字典
  getDictionaryList,
  getDictionaryItems,
  createDictionary,
  updateDictionary,
  deleteDictionary,
}
