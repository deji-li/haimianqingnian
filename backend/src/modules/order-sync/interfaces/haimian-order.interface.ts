// 海绵系统订单接口定义
export interface HaimianOrderSku {
  sku_id: string;
  goods_name: string;
  goods_image: string;
  sku_name: string;
  sku_price: string;
  sku_number: number;
  sku_unit: string;
  sku_total_price: string;
}

export interface HaimianOrder {
  order_id: string; // 订单号
  create_time: string; // 创建时间
  pay_time: string; // 支付时间
  pay_price: string; // 支付金额
  status: number; // 订单状态 1-9
  refund: number; // 退款标识 0=默认 1=申请退款 2=已退款 3=不予退款
  refund_status: number; // 退款状态 0=默认 1=通过 2=驳回
  member_id: string; // 会员ID
  member_mobile: string; // 会员手机号
  member_nickname: string; // 会员昵称
  store_id: string; // 门店ID
  store_name: string; // 门店名称（即校区名称）
  remark: string; // 备注
  skus: HaimianOrderSku[]; // 商品SKU列表
}

export interface HaimianApiResponse {
  code: number;
  msg: string;
  data: {
    list: HaimianOrder[];
    total: number;
  };
}

export interface HaimianApiRequest {
  key: string; // API密钥
  page?: number; // 页码
  limit?: number; // 每页数量
  start_time?: string; // 开始时间 YYYY-MM-DD
  end_time?: string; // 结束时间 YYYY-MM-DD
  status?: number; // 订单状态筛选
}
