-- 检查订单表中teacher_id和teacher_name的数据
SELECT 
  teacher_id,
  teacher_name,
  COUNT(*) as count
FROM orders
WHERE is_deleted = 0 
  AND payment_time >= '2025-11-01'
GROUP BY teacher_id, teacher_name
LIMIT 10;

-- 检查老师表的数据结构
SELECT id, name, display_name
FROM teachers
LIMIT 5;
