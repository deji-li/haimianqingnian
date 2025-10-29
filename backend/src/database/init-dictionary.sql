-- 初始化字典数据
-- 客户意向度和流量来源

-- 删除旧数据（如果存在）
DELETE FROM dictionary WHERE dict_type IN ('customer_intent', 'traffic_source');

-- 客户意向度字典
INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('customer_intent', '极高', '极高', 1, 1, '客户意向度非常高，即将成交'),
('customer_intent', '高', '高', 2, 1, '客户意向度高，积极跟进'),
('customer_intent', '中', '中', 3, 1, '客户意向度一般，需要培育'),
('customer_intent', '低', '低', 4, 1, '客户意向度较低，长期跟进'),
('customer_intent', '待评估', '待评估', 5, 1, '新客户，意向度待评估');

-- 流量来源字典
INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('traffic_source', '抖音', '抖音', 1, 1, '抖音平台引流'),
('traffic_source', '小红书', '小红书', 2, 1, '小红书平台引流'),
('traffic_source', '百度', '百度', 3, 1, '百度搜索引流'),
('traffic_source', '朋友圈', '朋友圈', 4, 1, '微信朋友圈引流'),
('traffic_source', '快手', '快手', 5, 1, '快手平台引流'),
('traffic_source', '微博', '微博', 6, 1, '微博平台引流'),
('traffic_source', 'B站', 'B站', 7, 1, 'B站平台引流'),
('traffic_source', '知乎', '知乎', 8, 1, '知乎平台引流'),
('traffic_source', '线下活动', '线下活动', 9, 1, '线下活动、地推等'),
('traffic_source', '老客推荐', '老客推荐', 10, 1, '老学员推荐转介绍'),
('traffic_source', '其他', '其他', 99, 1, '其他来源');

-- 查询验证
SELECT dict_type, COUNT(*) as count FROM dictionary
WHERE dict_type IN ('customer_intent', 'traffic_source')
GROUP BY dict_type;
