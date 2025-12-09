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

export interface HaimianOrderMember {
  member_id: string;
  open_id: string;
  nick_name: string;
  face: string;
  sex: number;
  mobile: string;
  level_id: number;
  birthday_year: string;
  birthday_month: string;
  birthday_day: string;
  pid: number;
  code: string | null;
  status: number;
  is_delete: number;
  rank_num: number;
  recharge: string;
  add_time: number;
  add_ip: string;
  mp_openid: string | null;
  city: string | null;
  remarks: string | null;
  photos: string | null;
  registration: string;
  avatar: string;
  id_card: string;
  realname: string;
  is_sync: number;
  store_id: number;
  facial_member_id: string | null;
  facial_card_list: string | null;
}

export interface HaimianOrder {
  order_id: number; // 订单号
  shop_id: number; // 店铺ID
  order_type: string; // 订单类型
  logistics_type: number; // 物流类型
  member_id: number; // 会员ID
  pin_tuan_group_id: number; // 拼团组ID
  total_price: string; // 订单总金额
  need_pay: string; // 应付金额
  freight: string; // 运费
  member_coupon_id: number; // 会员优惠券ID
  coupon_money: string; // 优惠券金额
  use_integral: number; // 使用积分
  integral_balance: string; // 积分余额
  youhui_balance: string; // 优惠余额
  pay_type: string; // 支付类型
  is_paid: number; // 是否已支付
  status: number; // 订单状态
  is_delete: number; // 是否删除
  pay_time: number; // 支付时间戳
  pay_info: any; // 支付信息
  receiving_name: string | null; // 收货人姓名
  receiving_mobile: string | null; // 收货人手机号
  receiving_address_province: string | null; // 收货地址省份
  receiving_address_city: string | null; // 收货地址城市
  receiving_address_county: string | null; // 收货地址区县
  receiving_address_info: string | null; // 收货地址详情
  add_time: number; // 添加时间戳
  add_ip: string; // 添加IP
  vip_balance: string; // VIP余额
  venue_name: string; // 场馆名称
  store_id: number; // 门店ID
  examine: number; // 审核状态
  examine_time: number; // 审核时间
  voucher: string; // 凭证
  voucher_content: string; // 凭证内容
  voucher_time: number; // 凭证时间
  refund: number; // 退款标识
  refund_status: number; // 退款状态
  refund_time: number; // 退款时间
  apply: number; // 申请标识
  apply_status: number; // 申请状态
  apply_image: string; // 申请图片
  apply_time: number; // 申请时间
  apply_success_time: number; // 申请成功时间
  coach_id: number; // 教练ID
  amount: string; // 老师提成金额
  remark: string; // 备注
  group_number_id: number; // 组编号ID
  is_commission: number; // 是否有提成标识
  instructors_id: number; // 讲师ID
  pin_tuan_order_id: number; // 拼团订单ID
  course: string; // 课程信息
  course_rate: number; // 课程进度
  finish_time: number; // 完成时间
  divided_amount: string; // 分配金额
  withdrawable: string; // 可提取金额
  wechat: string; // 微信号
  goods_tag: string; // 商品标签
  skus: HaimianOrderSku[]; // 商品SKU列表
  member: HaimianOrderMember; // 会员信息
  add_time_format: string; // 格式化的添加时间
  pay_time_format: string; // 格式化的支付时间
  status_means: string; // 状态含义
  order_type_means: string; // 订单类型含义
  pay_type_mean: string; // 支付类型含义
  goods_id: number; // 商品ID
  store_name: string; // 店铺名称
  coach_name: string; // 教练名称
  group_number: string; // 组号
  channel: string; // 渠道
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
  apikey: string; // API密钥
  page?: number; // 页码
  limit?: number; // 每页数量
  date?: string[]; // 订单创建时间区间
  status?: number; // 订单状态筛选
  order_id?: string; // 订单ID
  order_type?: string; // 订单类型
  mobile?: string; // 用户手机号
  wechat?: string; // 微信名称
  store_id?: string; // 门店ID
  goods_name?: string; // 商品名称
  coach_name?: string; // 教练名称
}
