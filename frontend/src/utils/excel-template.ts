import * as XLSX from 'xlsx'

/**
 * 下载客户导入模板
 */
export function downloadCustomerTemplate() {
  const headers = [
    '微信昵称*',
    '微信号',
    '手机号*',
    '真实姓名',
    '客户意向(高/中/低)',
    '流量来源',
    '备注',
  ]

  const exampleData = [
    '张三',
    'zhangsan123',
    '13800138000',
    '张三',
    '高',
    '抖音',
    '示例数据，请删除后填入真实数据',
  ]

  const data = [headers, exampleData]

  const ws = XLSX.utils.aoa_to_sheet(data)

  // 设置列宽
  ws['!cols'] = [
    { wch: 15 }, // 微信昵称
    { wch: 15 }, // 微信号
    { wch: 13 }, // 手机号
    { wch: 12 }, // 真实姓名
    { wch: 18 }, // 客户意向
    { wch: 12 }, // 流量来源
    { wch: 30 }, // 备注
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '客户导入模板')

  XLSX.writeFile(wb, '客户导入模板.xlsx')
}

/**
 * 下载订单导入模板
 */
export function downloadOrderTemplate() {
  const headers = [
    '订单号*',
    '微信号/手机号*',
    '客户姓名',
    '校区*',
    '课程名称*',
    '订单金额*',
    '实付金额*',
    '订单状态(待支付/已支付/已完成/已取消/已退款)*',
    '学员类型(新学员/老学员)*',
    '支付时间(YYYY-MM-DD HH:mm:ss)',
    '备注',
  ]

  const exampleData1 = [
    'ORD202501010001',
    '13800138000',
    '张三',
    '海淀校区',
    '数学辅导课程',
    '5000',
    '4800',
    '已支付',
    '新学员',
    '2025-01-01 10:30:00',
    '首次报名优惠200元',
  ]

  const exampleData2 = [
    'ORD202501010002',
    'wechat123',
    '李四',
    '朝阳校区',
    '英语提升班',
    '3000',
    '3000',
    '已支付',
    '老学员',
    '2025-01-01 14:20:00',
    '',
  ]

  const data = [headers, exampleData1, exampleData2]

  const ws = XLSX.utils.aoa_to_sheet(data)

  // 设置列宽
  ws['!cols'] = [
    { wch: 16 }, // 订单号
    { wch: 15 }, // 微信号/手机号
    { wch: 12 }, // 客户姓名
    { wch: 12 }, // 校区
    { wch: 18 }, // 课程名称
    { wch: 10 }, // 订单金额
    { wch: 10 }, // 实付金额
    { wch: 12 }, // 订单状态
    { wch: 12 }, // 学员类型
    { wch: 20 }, // 支付时间
    { wch: 25 }, // 备注
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单导入模板')

  XLSX.writeFile(wb, '订单导入模板.xlsx')
}

/**
 * 导出导入失败的数据（带错误信息）
 */
export function downloadImportErrors(errors: any[], filename: string = '导入失败数据.xlsx') {
  if (errors.length === 0) {
    return
  }

  // 提取表头（基于第一条错误数据的键）
  const firstError = errors[0]
  const headers = Object.keys(firstError)

  // 转换数据为数组格式
  const dataRows = errors.map(error => {
    return headers.map(header => error[header] || '')
  })

  const data = [headers, ...dataRows]

  const ws = XLSX.utils.aoa_to_sheet(data)

  // 自动设置列宽
  const colWidths = headers.map(() => ({ wch: 15 }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '失败数据')

  XLSX.writeFile(wb, filename)
}
