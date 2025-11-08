-- 添加 ai_chat 到文件分类枚举
ALTER TABLE `file` MODIFY COLUMN `category` ENUM('avatar', 'customer_attachment', 'order_contract', 'ai_chat', 'other') NOT NULL COMMENT '文件用途';
