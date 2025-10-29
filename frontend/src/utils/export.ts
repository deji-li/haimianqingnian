import * as XLSX from 'xlsx'

/**
 * 导出数据到Excel
 * @param data 数据数组
 * @param filename 文件名
 * @param sheetName 工作表名称
 */
export function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * 导出客户列表
 */
export function exportCustomers(customers: any[]) {
  const data = customers.map(customer => ({
    '客户ID': customer.id,
    '微信昵称': customer.wechatNickname,
    '微信号': customer.wechatId,
    '手机号': customer.phone || '-',
    '真实姓名': customer.realName || '-',
    '流量来源': customer.trafficSource || '-',
    '客户意向': customer.customerIntent,
    '负责销售': customer.salesName || '-',
    '下次回访时间': customer.nextFollowTime || '-',
    '创建时间': customer.createTime,
  }))

  exportToExcel(data, `客户列表_${new Date().toLocaleDateString()}`)
}

/**
 * 导出订单列表
 */
export function exportOrders(orders: any[]) {
  const data = orders.map(order => ({
    '订单号': order.orderNo,
    '客户': order.customerName || order.wechatNickname,
    '课程': order.courseName,
    '支付金额': order.paymentAmount,
    '订单状态': order.orderStatus,
    '学员类型': order.isNewStudent ? '新学员' : '老学员',
    '销售': order.salesName || '-',
    '校区': order.campusName || '-',
    '支付时间': order.paymentTime,
    '创建时间': order.createTime,
  }))

  exportToExcel(data, `订单列表_${new Date().toLocaleDateString()}`)
}

/**
 * 导出提成记录
 */
export function exportCommissions(commissions: any[]) {
  const data = commissions.map(item => ({
    '订单号': item.orderNo,
    '客户': item.customerName,
    '员工': item.userName,
    '角色': item.userRole,
    '订单金额': item.orderAmount,
    '提成比例': `${item.commissionRate}%`,
    '提成金额': item.commissionAmount,
    '状态': item.status === 'pending' ? '待发放' : item.status === 'paid' ? '已发放' : '已取消',
    '结算月份': item.settlementMonth || '-',
    '创建时间': item.createTime,
  }))

  exportToExcel(data, `提成记录_${new Date().toLocaleDateString()}`)
}

/**
 * 导出财务报表
 */
export function exportFinanceReport(data: {
  summary: any
  details: any[]
}) {
  const wb = XLSX.utils.book_new()

  // 汇总数据
  const summaryData = [
    { '指标': '总销售额', '数值': data.summary.totalRevenue },
    { '指标': '订单总数', '数值': data.summary.totalOrders },
    { '指标': '退款金额', '数值': data.summary.totalRefund },
    { '指标': '平均客单价', '数值': data.summary.avgOrderAmount },
  ]
  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, '汇总')

  // 明细数据
  const detailData = data.details.map(item => ({
    '日期': item.date,
    '销售额': item.revenue,
    '订单数': item.orderCount,
    '退款': item.refund,
  }))
  const wsDetail = XLSX.utils.json_to_sheet(detailData)
  XLSX.utils.book_append_sheet(wb, wsDetail, '明细')

  XLSX.writeFile(wb, `财务报表_${new Date().toLocaleDateString()}.xlsx`)
}
