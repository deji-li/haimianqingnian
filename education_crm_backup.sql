-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: education_crm
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_api_keys`
--

DROP TABLE IF EXISTS `ai_api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_api_keys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` enum('deepseek','doubao') NOT NULL COMMENT 'AI供应商',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥',
  `api_url` varchar(500) NOT NULL COMMENT 'API地址',
  `endpoint_id` varchar(200) DEFAULT NULL COMMENT '端点ID（豆包专用）',
  `model_name` varchar(100) DEFAULT NULL COMMENT '默认模型名称',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `remark` text COMMENT '备注说明',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider` (`provider`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_api_keys`
--

LOCK TABLES `ai_api_keys` WRITE;
/*!40000 ALTER TABLE `ai_api_keys` DISABLE KEYS */;
INSERT INTO `ai_api_keys` VALUES (1,'deepseek','sk-db4b2cf7e1864d48bc1f8d1eafcd191e','https://api.deepseek.com/v1/chat/completions',NULL,'deepseek-chat',1,'DeepSeek API配置','2025-11-12 20:57:39.757108','2025-11-12 20:57:39.757108'),(2,'doubao','13d8df92-1b2c-41e5-90b9-2317441cafa5',' https://ark.cn-beijing.volces.com/api/v3/chat/completions','ep-20251107145646-tkrmq',NULL,1,'豆包OCR识别配置','2025-11-12 20:58:17.823891','2025-11-12 20:58:17.823891');
/*!40000 ALTER TABLE `ai_api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_chat_records`
--

DROP TABLE IF EXISTS `ai_chat_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_chat_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `user_id` int NOT NULL COMMENT '上传销售ID',
  `chat_date` date NOT NULL,
  `wechat_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json DEFAULT NULL COMMENT '聊天截图URL数组',
  `ocr_text` text COLLATE utf8mb4_unicode_ci,
  `ai_analysis_result` json DEFAULT NULL,
  `quality_level` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `risk_level` enum('无风险','低','中','高') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intention_score` int DEFAULT NULL,
  `estimated_value` decimal(10,2) DEFAULT NULL,
  `decision_maker_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocr_status` enum('待处理','处理中','已完成','失败') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待处理',
  `analysis_status` enum('待分析','分析中','已完成','失败') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待分析',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `upload_type` enum('screenshot','text','file') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'screenshot' COMMENT '上传类型：screenshot-截图, text-直接文本, file-文件上传',
  `raw_text` text COLLATE utf8mb4_unicode_ci COMMENT '原始聊天文本（文本上传时使用）',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '上传文件路径（文件上传时使用）',
  `pain_points` json DEFAULT NULL COMMENT '客户痛点列表',
  `interest_points` json DEFAULT NULL COMMENT '客户兴趣点列表',
  `needs_summary` text COLLATE utf8mb4_unicode_ci COMMENT '需求摘要',
  `objections` json DEFAULT NULL COMMENT '客户异议点列表',
  PRIMARY KEY (`id`),
  KEY `FK_95dd6038d05f7b9942151f7e4b8` (`customer_id`),
  KEY `FK_dea9dc0e886e155d2175e52dcf7` (`user_id`),
  CONSTRAINT `FK_95dd6038d05f7b9942151f7e4b8` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_dea9dc0e886e155d2175e52dcf7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_chat_records`
--

LOCK TABLES `ai_chat_records` WRITE;
/*!40000 ALTER TABLE `ai_chat_records` DISABLE KEYS */;
INSERT INTO `ai_chat_records` VALUES (14,1,4,'2025-01-08','wx_zhangsan','[\"http://example.com/chat1.jpg\"]','家长：孩子数学成绩一直不理想\n顾问：我们有专业的数学老师\n家长：费用大概多少\n顾问：根据课时不同，8000-15000不等','{\"nextSteps\": [\"发送师资介绍\", \"提供试听课程\", \"制定个性化方案\"], \"riskFactors\": [\"价格敏感\"], \"customerNeeds\": [\"数学成绩提升\", \"专业师资\", \"合理价格\"], \"intentionLevel\": \"中等\", \"customerProfile\": {\"parentRole\": \"妈妈\", \"studentGrade\": \"六年级\", \"decisionMakerRole\": \"主要决策者\", \"familyEconomicLevel\": \"中等\"}, \"communicationSummary\": \"家长咨询数学辅导，关注费用和师资\"}','A','低',75,12000.00,NULL,'已完成','已完成',NULL,'2025-11-10 16:16:39.283663','2025-11-10 16:16:39.283663','screenshot',NULL,NULL,NULL,NULL,NULL,NULL),(15,3,4,'2025-01-01','wx_wangwu','[\"http://example.com/chat2.jpg\"]','家长：试听课孩子很喜欢\n顾问：我们的外教很专业\n家长：什么时候能开始正式上课\n顾问：随时可以开班','{\"nextSteps\": [\"尽快安排签约\", \"确定开班时间\", \"安排课表\"], \"riskFactors\": [], \"customerNeeds\": [\"优质外教\", \"尽快开班\", \"效果保障\"], \"intentionLevel\": \"高\", \"customerProfile\": {\"parentRole\": \"爸爸\", \"studentGrade\": \"四年级\", \"decisionMakerRole\": \"主要决策者\", \"familyEconomicLevel\": \"良好\"}, \"communicationSummary\": \"试听效果好，家长意向强烈\"}','A','无风险',90,15000.00,NULL,'已完成','已完成',NULL,'2025-11-10 16:16:39.283663','2025-11-10 16:16:39.283663','screenshot',NULL,NULL,NULL,NULL,NULL,NULL),(16,4,5,'2024-12-27','wx_zhaoliu','[\"http://example.com/chat3.jpg\"]','家长：高考还有半年，很焦虑\n顾问：我们有高考冲刺班\n家长：能保证提高多少分\n顾问：往年平均提高50-80分','{\"nextSteps\": [\"展示成功案例\", \"安排测评\", \"定制冲刺方案\"], \"riskFactors\": [\"效果预期高\"], \"customerNeeds\": [\"快速提分\", \"高考冲刺\", \"效果保障\"], \"intentionLevel\": \"高\", \"customerProfile\": {\"parentRole\": \"妈妈\", \"studentGrade\": \"高三\", \"decisionMakerRole\": \"主要决策者\", \"familyEconomicLevel\": \"良好\"}, \"communicationSummary\": \"高三家长，高考焦虑，需要冲刺辅导\"}','A','中',85,25000.00,NULL,'已完成','已完成',NULL,'2025-11-10 16:16:39.283663','2025-11-10 16:16:39.283663','screenshot',NULL,NULL,NULL,NULL,NULL,NULL),(17,10,5,'2025-01-04','wx_weishisan','[\"http://example.com/chat4.jpg\"]','家长：朋友推荐过来的\n顾问：欢迎！您孩子几年级\n家长：初三，理科有点弱\n顾问：我们有理科培优班','{\"nextSteps\": [\"安排试听\", \"介绍师资\", \"提供优惠方案\"], \"riskFactors\": [], \"customerNeeds\": [\"理科成绩提升\", \"中考备考\", \"口碑好的机构\"], \"intentionLevel\": \"中高\", \"customerProfile\": {\"parentRole\": \"妈妈\", \"studentGrade\": \"初三\", \"decisionMakerRole\": \"主要决策者\", \"familyEconomicLevel\": \"中上\"}, \"communicationSummary\": \"朋友推荐，初三学生，理科需要提升\"}','A','低',80,18000.00,NULL,'已完成','已完成',NULL,'2025-11-10 16:16:39.283663','2025-11-10 16:16:39.283663','screenshot',NULL,NULL,NULL,NULL,NULL,NULL),(18,1,1,'2025-11-10','wx_zhangsan','[\"http://106.53.77.212/api/upload/file/13\"]','【截图1】\n### 微信聊天记录（按时间顺序，绿色框为课程顾问，白色框为用户）  \n\n\n#### 7月4日 17:16  \n- **用户**（头像）：我是kiki  \n- **课程顾问**：快已被订阅，现在可以开始聊天了。 哈喽呀小宝贝~我是隔壁表的kicky~我们最近上新了很多课程 是想更了解下课程详情吗~  \n\n\n#### 7月4日 20:49  \n- **课程顾问**：哈喽，小宝贝是想了解次卡课程吗？  \n\n\n#### 7月4日 21:21  \n- **用户**：浦东花木附近有什么外教？（并发送一张课程列表图片）  \n- **课程顾问**：我来啦小宝贝 课程来啦~您可以看看有合适的戳出 我这边给您发课程介绍哦~  \n- **用户**：但我在哪里？  \n- **用户**：这个课程初中生抽上吗  \n- **课程顾问**：可以上的，您这边是想了解哪些课程可以圈出来 我这边一个个发小程序链接给你  \n- **用户**：具体地址看不到  \n\n\n#### 7月4日 21:36  \n- **课程顾问**：这里面所有课程的地址都不一样的~您这边对哪个课程感兴趣的我这边就发给你就好了呢  \n- **用户**：漕河泾声乐 龙阳路有酶的羽毛球都可以  \n- **用户**：好滴 我找找  \n（用户发送小程序：`尚邻青年GO 【1对1私教】上海浦东新区漕河泾站- 声乐-4节课`，附带声乐课程图片）  \n\n\n#### 7月4日 21:37  \n（用户继续发送两个小程序）  \n- 小程序1：`尚邻青年GO 【4-6人班】上海浦东新区龙阳路-羽毛球-8节课`（附带羽毛球场地图片）  \n- 小程序2：`尚邻青年GO 【3-4人班】上海浦东新区芳甸路站- 羽毛球-8节课`（附带羽毛球网图片）  \n\n\n#### （课程顾问回复）  \n- **课程顾问**：这个不是私教哈，上面写了私教的是一对一上课时间，可以自己选~下面写了团课的是需要满足最低人数才开课，上课时间要问小帮我，买完课再查  \n- **用户**（发送一张课程列表图片）：最后三项  \n\n\n#### （课程顾问回复）  \n- **课程顾问**：课程的地址都在上面了哈~你需要再选的话现在在这个小程序里可以兑换10万学币的，活动今晚12点结束  \n（课程顾问发送三个小程序）  \n- 小程序1：`尚邻青年GO 【4-10人班】上海浦东新区东昌路站- 声乐-10节课`（附带教室图片）  \n- 小程序2：`尚邻青年GO 【2-6人团】上海浦东新区商城路站- 声乐-6节课`（附带钢琴课多人上课图片）  \n- 小程序3：`尚邻青年GO 【4-10人班】上海浦东新区商城路站- 化妆-8节课`（附带化妆课多人上课图片）  \n- **课程顾问**：这是您的最后三个课程，我这边比较推荐声乐和化妆课，这两个课程学员对比多、好评也比较多  \n\n\n#### 7月4日 21:43  \n- **用户**（发送一张课程截图）：这个声乐课不是私人团吗？为什么还要拼单？  \n- **课程顾问**：我这边帮你拼价，因为这个价格是需要凑到操作团的  \n- **课程顾问**：稍等，我现在都在对接  \n- **用户**：等一下，怎么退课？  \n- **用户**：我想高级点的吧  \n- **课程顾问**：您在小程序的订单里面取消订单就行了  \n- **课程顾问**：然后您这边重新拍高级的课程就好  \n- **用户**：那南浦站的我也想置换掉49的那个？  \n- **用户**：还是要等人 成团再单搞  \n- **课程顾问**：对的  \n- **课程顾问**：我这边帮你系统操作，差价的话就行了  \n\n\n#### 7月4日 21:48  \n- **用户**：OK  \n- **课程顾问**：好的，我现在去系统操作，稍等我一下~ 小宝贝这边的订单编号是20225182  \n- **课程顾问**：这是我们的专属课程顾问 你加一下哈~ 加完和他说一下，我让顾问优先帮你排课！ 如果和我说哦~我就中间问问，他到底回还是我回  \n- **课程顾问**：这边先加哈，明天早上9点钟后，老师上班会通知您后续的  \n（课程顾问发送图片：`加顾问来排课 扫码添加金金`，附带二维码）  \n\n\n### 说明  \n- 部分表述含错别字（如“有酶”），按原文保留；小程序名称、课程信息、图片描述均完整提取。  \n- 绿色框消息为课程顾问发送，白色框为用户发送，时间、内容严格对应截图顺序。','{\"urgency\": \"中\", \"nextSteps\": [\"跟进订单置换进度\", \"确认高级课程安排\", \"协助添加专属顾问\", \"明确开课时间\"], \"riskLevel\": \"中\", \"riskReason\": \"客户明确表示想要\'高级点的\'课程，对现有拼团机制有疑问，且对课程地址有具体要求，如果无法满足这些核心需求，可能选择其他机构或放弃报名。\", \"trustLevel\": \"中\", \"riskFactors\": [\"拼团等待可能导致客户流失\", \"课程级别不满可能退课\", \"地址不便影响长期续费\"], \"qualityLevel\": \"B\", \"customerNeeds\": [\"浦东花木附近外教课程\", \"初中生适合的课程\", \"声乐和羽毛球课程\", \"高级别课程\"], \"emotionalTone\": \"中立\", \"salesStrategy\": \"重点解决客户对课程级别和拼团机制的顾虑，提供更高级别课程选项，简化退换课流程，建立专属服务关系增强信任。\", \"estimatedCycle\": \"短期（1周内）\", \"estimatedValue\": 3000, \"intentionScore\": 75, \"competitiveness\": \"中\", \"customerMindset\": \"观望\", \"customerProfile\": {\"location\": \"上海浦东花木/龙阳路附近\", \"parentRole\": \"家长\", \"studentAge\": 13, \"studentGrade\": \"初中\", \"wechatActivity\": \"高\", \"timeAvailability\": \"一般\", \"decisionMakerRole\": \"单独决策\", \"educationAttitude\": \"很重视\", \"communicationStyle\": \"直接\", \"familyEconomicLevel\": \"中\"}, \"dealOpportunity\": \"中\", \"customerInterests\": [\"声乐课程\", \"羽毛球课程\", \"一对一私教\", \"高级课程\"], \"customerObjections\": [\"为什么私教课还要拼单\", \"退课流程复杂\", \"等待成团时间不确定\"], \"customerPainPoints\": [\"课程地址不明确\", \"拼团等待时间\", \"课程级别不够高\", \"退课流程不熟悉\"], \"recommendedScripts\": {\"closing\": \"现在添加专属顾问可以优先安排课程，明天老师上班后就能确定具体上课时间，您看是先帮您锁定哪个时间段呢？\", \"opening\": \"您好！关于您刚才咨询的高级课程和订单置换，我已经在系统操作了，现在给您同步最新进展~\", \"valueProposition\": \"我们的一对一私教课程可以完全按照您的时间安排，老师都是专业外教，针对初中生的学习特点定制教学内容。\", \"objectionHandling\": \"关于拼团问题，我们提供两种选择：一是等待拼团享受优惠价，二是直接选择私教课享受专属服务。退课在小程序订单页面一键操作，非常方便。\"}, \"competitorMentioned\": [], \"communicationSummary\": \"客户咨询浦东花木附近外教课程，重点关注声乐和羽毛球课程，对课程形式、地址、退课流程有疑问，已选择部分课程但存在拼团和课程级别顾虑，正在处理订单置换。\"}','B','中',75,3000.00,'单独决策','已完成','已完成',NULL,'2025-11-10 17:18:52.237136','2025-11-10 17:20:49.000000','screenshot',NULL,NULL,NULL,NULL,NULL,NULL),(19,26,1,'2025-11-13','55','[]','### 微信聊天记录（用户：VIP250714 的聊天窗口）  \n\n\n#### 7月4日 17:16  \n- （左侧头像用户）：我是kiki  \n- （绿色消息，客服）：快已经6点了，现在可以开始聊了。  \n  哈喽小宇~我是隔壁校区的kicky 我们最近上新了很多课程 是想了解下课程详情吗~  \n\n\n#### 7月4日 20:49  \n- （左侧头像用户）：哈喽，小宇如果是想了解课程的话吗？  \n\n\n#### 7月4日 21:21  \n- （左侧头像用户）：浦东花木附近有什么外教？  \n- （绿色消息，客服）：我来啦小宇 课程很多 您可以看看有合适的戳出 我这边给您发课程介绍哦~  \n- （左侧头像用户）：位置在哪里？  \n- （绿色消息，客服）：这个课程初中击上吗  \n- （左侧头像用户）：具体地址看不到  \n\n\n#### 7月4日 21:36  \n- （绿色消息，客服）：这里面所有课程的地址都不一样的 您这边对哪个课程感兴趣的话我单独发地址给你就好了呢  \n- （左侧头像用户）：漕河泾声乐 龙阳路有胸的羽毛球可以  \n- （绿色消息，客服）：好滴 我找找  \n- （客服发送小程序卡片）：**尚游体育GO** 【1对1私教】上海浦东新区漕河泾站-声乐-4节课（附声乐课程图片）  \n\n\n#### 7月4日 21:37  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-6人班】上海浦东新区龙阳路-羽毛球-8节课（附羽毛球场地图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【3-8人班】上海浦东新区芳甸路站-羽毛球-8节课（附羽毛球网图片）  \n- （绿色消息，客服）：这个声乐课不是私教哈，上面写了私教的是一对一上课时间，可根据自己的安排去，下面写了团课的是需要满足最低人数才开课，上课时间是要老师协调的，可以买完课查看  \n- （左侧头像用户）：（发送课程列表截图）  \n- （左侧头像用户）：最后三项  \n\n\n#### （续7月4日 21:37后）  \n- （绿色消息，客服）：课程地址都在上面了哈，你需要再给我现在在的这个课程里可以免费试听7天学的，活动今晚12点结束  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-10人班】上海浦东新区东昌路站-声乐-10节课（附教室图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【2-6人团】上海浦东新区商城路站-声乐-6节课（附钢琴课图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-10人班】上海浦东新区商城路站-化妆-8节课（附化妆课图片）  \n- （绿色消息，客服）：这是您说的那最后三个课程，我这边比较推荐声乐和化妆课比较好，这个课程学员的对比表多，好评也比较多。  \n\n\n#### 7月4日 21:43  \n- （左侧头像用户）：（发送小程序界面截图）  \n- （左侧头像用户）：这个声乐课不是私人团？为什么还要团单？  \n- （绿色消息，客服）：我这边帮你问价，因为这个价格是需要团课作 做的  \n- （绿色消息，客服）：稍等，我现在都在对接  \n- （左侧头像用户）：等一下，怎么退？  \n- （左侧头像用户）：我想高级点的吧  \n- （绿色消息，客服）：您在小程序的订单里面取消订单就行了  \n- （绿色消息，客服）：然后您这边重新拍需要的课程就好  \n- （左侧头像用户）：那南城的我也选最缺的49那个？  \n- （左侧头像用户）：还是要等人 成团再单搞  \n- （绿色消息，客服）：对的  \n- （绿色消息，客服）：我这边帮你系统操作，你付过款就行了  \n\n\n#### 7月4日 21:48  \n- （左侧头像用户）：OK  \n- （绿色消息，客服）：帮你  \n- （左侧头像用户）：声乐课拍好了  \n- （绿色消息，客服）：好的，我现在去系统操作，稍等一下~  \n- （绿色消息，客服）：小宇您这边的订单编号是2025162 你记一下哈  \n- （绿色消息，客服）：这是咱们的专属课程顾问 你加一下哈  \n  如有问题找一下 顾问问优先帮你排课！  \n  如不和我挑选上，我让顾问问他，他问他还是找我  \n- （绿色消息，客服）：这边先加她，明天早上9点钟后，老师上班会通过 您咨询的哈  \n- （客服发送图片）：（图片文字：*扫码找我排课* *课程报名咨询*，带二维码）  \n\n\n（注：部分消息存在输入笔误，如“有胸的”应为“有场地的”、“初中击上”应为“初中生能上”等，已按截图原文还原。）','{\"urgency\": \"中\", \"nextSteps\": [\"课程顾问及时跟进排课\", \"确认具体上课时间和地点\", \"提供课程准备指导\"], \"riskLevel\": \"低\", \"riskReason\": \"客户明确表示\'我想高级点的吧\'，显示对现有课程级别不满意，且对团课形式有疑虑，存在转向其他机构寻找私教课程的风险\", \"trustLevel\": \"中\", \"riskFactors\": [\"对团课形式接受度不高\", \"可能寻求更高级别的私教课程\"], \"qualityLevel\": \"B\", \"customerNeeds\": [\"浦东花木附近的外教课程\", \"声乐和羽毛球课程\", \"明确的课程地址信息\"], \"emotionalTone\": \"中立\", \"salesStrategy\": \"重点跟进已购声乐课程的后续服务，建立信任后推荐更高级别的私教课程，解决客户对团课的顾虑\", \"estimatedCycle\": \"短期（1周内）\", \"estimatedValue\": 3000, \"intentionScore\": 75, \"competitiveness\": \"中\", \"customerMindset\": \"观望\", \"customerProfile\": {\"location\": \"上海浦东\", \"parentRole\": \"家长\", \"studentAge\": 13, \"studentGrade\": \"初中\", \"wechatActivity\": \"高\", \"timeAvailability\": \"一般\", \"decisionMakerRole\": \"单独决策\", \"educationAttitude\": \"很重视\", \"communicationStyle\": \"直接\", \"familyEconomicLevel\": \"中\"}, \"dealOpportunity\": \"中\", \"customerInterests\": [\"声乐课程\", \"羽毛球课程\", \"私教课程形式\"], \"customerObjections\": [\"为什么声乐课需要团单\", \"退款流程复杂\", \"等待成团时间不确定\"], \"customerPainPoints\": [\"课程地址信息不清晰\", \"团课需要等待成团\", \"对课程形式理解有困惑\"], \"recommendedScripts\": {\"closing\": \"现在确认上课时间，我这边可以帮您锁定最好的时间段，确保学习效果最大化\", \"opening\": \"小宇您好，我是您的课程顾问，看到您已经购买了声乐课程，我来帮您安排具体的上课时间和老师\", \"valueProposition\": \"我们的声乐课程采用专业外教教学，学员进步明显，好评率超过95%，还能根据您的时间灵活安排\", \"objectionHandling\": \"关于团课等待问题，我们系统会优先为您匹配，如果3天内未成团，可以转为私教课程享受同等优惠\"}, \"competitorMentioned\": [], \"communicationSummary\": \"客户小宇咨询浦东花木附近外教课程，重点关注声乐和羽毛球课程，对课程形式、地址和价格有疑问，最终购买了声乐课程并转接课程顾问\"}','B','低',75,3000.00,'单独决策','已完成','已完成',NULL,'2025-11-13 15:44:43.711159','2025-11-13 15:44:43.711159','screenshot',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `ai_chat_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_customer_tags`
--

DROP TABLE IF EXISTS `ai_customer_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_customer_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `tag_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签分类',
  `tag_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标签名称',
  `tag_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签值',
  `source` enum('AI自动','人工添加') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI自动',
  `confidence` decimal(3,2) DEFAULT NULL,
  `from_chat_record_id` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=239 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_customer_tags`
--

LOCK TABLES `ai_customer_tags` WRITE;
/*!40000 ALTER TABLE `ai_customer_tags` DISABLE KEYS */;
INSERT INTO `ai_customer_tags` VALUES (87,1,'risk','价格敏感',NULL,'AI自动',0.85,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(88,1,'need','关注师资',NULL,'AI自动',0.90,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(89,1,'need','数学辅导需求',NULL,'AI自动',0.95,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(90,1,'profile','中等收入家庭',NULL,'AI自动',0.80,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(91,3,'quality','高意向客户',NULL,'AI自动',0.95,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(92,3,'behavior','试听效果好',NULL,'AI自动',0.90,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(93,3,'need','英语培训需求',NULL,'AI自动',0.95,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(94,3,'behavior','决策快',NULL,'AI自动',0.85,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(95,3,'profile','经济条件好',NULL,'AI自动',0.88,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(96,4,'need','高考冲刺需求',NULL,'AI自动',0.98,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(97,4,'profile','焦虑型家长',NULL,'AI自动',0.92,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(98,4,'behavior','效果导向',NULL,'AI自动',0.90,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(99,4,'profile','预算充足',NULL,'AI自动',0.85,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(100,4,'quality','高意向',NULL,'AI自动',0.95,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(101,10,'source','朋友推荐',NULL,'AI自动',0.95,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(102,10,'need','理科培优需求',NULL,'AI自动',0.90,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(103,10,'need','中考备考',NULL,'AI自动',0.92,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(104,10,'behavior','信任度高',NULL,'AI自动',0.88,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(105,10,'profile','经济条件中上',NULL,'AI自动',0.82,NULL,1,'2025-11-10 16:16:39.292598','2025-11-10 16:16:39.292598'),(106,1,'基础信息','家长身份','家长','AI自动',0.90,18,1,'2025-11-10 17:20:49.435029','2025-11-10 17:20:49.435029'),(107,1,'基础信息','学生年级','初中','AI自动',0.85,18,1,'2025-11-10 17:20:49.436969','2025-11-10 17:20:49.436969'),(108,1,'基础信息','所在地区','上海浦东花木/龙阳路附近','AI自动',0.80,18,1,'2025-11-10 17:20:49.439018','2025-11-10 17:20:49.439018'),(109,1,'基础信息','经济水平','中','AI自动',0.70,18,1,'2025-11-10 17:20:49.440439','2025-11-10 17:20:49.440439'),(110,1,'行为特征','教育重视度','很重视','AI自动',0.80,18,1,'2025-11-10 17:20:49.442052','2025-11-10 17:20:49.442052'),(111,1,'行为特征','决策模式','单独决策','AI自动',0.75,18,1,'2025-11-10 17:20:49.443447','2025-11-10 17:20:49.443447'),(112,1,'行为特征','沟通风格','直接','AI自动',0.80,18,1,'2025-11-10 17:20:49.445482','2025-11-10 17:20:49.445482'),(113,1,'需求痛点','客户需求','浦东花木附近外教课程','AI自动',0.85,18,1,'2025-11-10 17:20:49.446888','2025-11-10 17:20:49.446888'),(114,1,'需求痛点','客户需求','初中生适合的课程','AI自动',0.85,18,1,'2025-11-10 17:20:49.448571','2025-11-10 17:20:49.448571'),(115,1,'需求痛点','客户需求','声乐和羽毛球课程','AI自动',0.85,18,1,'2025-11-10 17:20:49.450579','2025-11-10 17:20:49.450579'),(116,1,'需求痛点','客户需求','高级别课程','AI自动',0.85,18,1,'2025-11-10 17:20:49.452148','2025-11-10 17:20:49.452148'),(117,1,'需求痛点','客户痛点','课程地址不明确','AI自动',0.85,18,1,'2025-11-10 17:20:49.453639','2025-11-10 17:20:49.453639'),(118,1,'需求痛点','客户痛点','拼团等待时间','AI自动',0.85,18,1,'2025-11-10 17:20:49.455240','2025-11-10 17:20:49.455240'),(119,1,'需求痛点','客户痛点','课程级别不够高','AI自动',0.85,18,1,'2025-11-10 17:20:49.457615','2025-11-10 17:20:49.457615'),(120,1,'需求痛点','客户痛点','退课流程不熟悉','AI自动',0.85,18,1,'2025-11-10 17:20:49.459283','2025-11-10 17:20:49.459283'),(121,1,'需求痛点','感兴趣的点','声乐课程','AI自动',0.80,18,1,'2025-11-10 17:20:49.460866','2025-11-10 17:20:49.460866'),(122,1,'需求痛点','感兴趣的点','羽毛球课程','AI自动',0.80,18,1,'2025-11-10 17:20:49.462582','2025-11-10 17:20:49.462582'),(123,1,'需求痛点','感兴趣的点','一对一私教','AI自动',0.80,18,1,'2025-11-10 17:20:49.463975','2025-11-10 17:20:49.463975'),(124,1,'需求痛点','感兴趣的点','高级课程','AI自动',0.80,18,1,'2025-11-10 17:20:49.465354','2025-11-10 17:20:49.465354'),(125,1,'需求痛点','客户顾虑','为什么私教课还要拼单','AI自动',0.85,18,1,'2025-11-10 17:20:49.466704','2025-11-10 17:20:49.466704'),(126,1,'需求痛点','客户顾虑','退课流程复杂','AI自动',0.85,18,1,'2025-11-10 17:20:49.468247','2025-11-10 17:20:49.468247'),(127,1,'需求痛点','客户顾虑','等待成团时间不确定','AI自动',0.85,18,1,'2025-11-10 17:20:49.469599','2025-11-10 17:20:49.469599'),(128,1,'质量评估','线索质量','B级','AI自动',0.90,18,1,'2025-11-10 17:20:49.470942','2025-11-10 17:20:49.470942'),(129,1,'质量评估','意向程度','中意向','AI自动',0.85,18,1,'2025-11-10 17:20:49.472687','2025-11-10 17:20:49.472687'),(130,1,'质量评估','成交机会','中','AI自动',0.75,18,1,'2025-11-10 17:20:49.474200','2025-11-10 17:20:49.474200'),(131,1,'风险标签','流失风险','中','AI自动',0.80,18,1,'2025-11-10 17:20:49.475548','2025-11-10 17:20:49.475548'),(132,1,'情绪态度','客户心态','观望','AI自动',0.75,18,1,'2025-11-10 17:20:49.476931','2025-11-10 17:20:49.476931'),(133,1,'情绪态度','情绪基调','中立','AI自动',0.70,18,1,'2025-11-10 17:20:49.478558','2025-11-10 17:20:49.478558'),(134,1,'情绪态度','信任程度','中','AI自动',0.75,18,1,'2025-11-10 17:20:49.480124','2025-11-10 17:20:49.480124'),(135,23,'基础信息','家长身份','家长','AI自动',0.90,113,1,'2025-11-13 15:03:14.801811','2025-11-13 15:03:14.801811'),(136,23,'基础信息','学生年级','初中','AI自动',0.85,113,1,'2025-11-13 15:03:14.806066','2025-11-13 15:03:14.806066'),(137,23,'基础信息','所在地区','上海浦东花木附近','AI自动',0.80,113,1,'2025-11-13 15:03:14.807961','2025-11-13 15:03:14.807961'),(138,23,'基础信息','经济水平','中','AI自动',0.70,113,1,'2025-11-13 15:03:14.809964','2025-11-13 15:03:14.809964'),(139,23,'行为特征','教育重视度','很重视','AI自动',0.80,113,1,'2025-11-13 15:03:14.812421','2025-11-13 15:03:14.812421'),(140,23,'行为特征','决策模式','单独决策','AI自动',0.75,113,1,'2025-11-13 15:03:14.814061','2025-11-13 15:03:14.814061'),(141,23,'行为特征','沟通风格','直接','AI自动',0.80,113,1,'2025-11-13 15:03:14.815777','2025-11-13 15:03:14.815777'),(142,23,'需求痛点','客户需求','浦东花木附近课程','AI自动',0.85,113,1,'2025-11-13 15:03:14.817439','2025-11-13 15:03:14.817439'),(143,23,'需求痛点','客户需求','声乐培训','AI自动',0.85,113,1,'2025-11-13 15:03:14.819664','2025-11-13 15:03:14.819664'),(144,23,'需求痛点','客户需求','羽毛球课程','AI自动',0.85,113,1,'2025-11-13 15:03:14.821521','2025-11-13 15:03:14.821521'),(145,23,'需求痛点','客户需求','初中生适用课程','AI自动',0.85,113,1,'2025-11-13 15:03:14.822993','2025-11-13 15:03:14.822993'),(146,23,'需求痛点','客户需求','明确课程地址','AI自动',0.85,113,1,'2025-11-13 15:03:14.824970','2025-11-13 15:03:14.824970'),(147,23,'需求痛点','客户痛点','课程地址不清晰','AI自动',0.85,113,1,'2025-11-13 15:03:14.826629','2025-11-13 15:03:14.826629'),(148,23,'需求痛点','客户痛点','拼团机制复杂','AI自动',0.85,113,1,'2025-11-13 15:03:14.828188','2025-11-13 15:03:14.828188'),(149,23,'需求痛点','客户痛点','课程类型混淆','AI自动',0.85,113,1,'2025-11-13 15:03:14.830409','2025-11-13 15:03:14.830409'),(150,23,'需求痛点','感兴趣的点','1对1私教课程','AI自动',0.80,113,1,'2025-11-13 15:03:14.832176','2025-11-13 15:03:14.832176'),(151,23,'需求痛点','感兴趣的点','声乐课程','AI自动',0.80,113,1,'2025-11-13 15:03:14.833660','2025-11-13 15:03:14.833660'),(152,23,'需求痛点','感兴趣的点','羽毛球课程','AI自动',0.80,113,1,'2025-11-13 15:03:14.835057','2025-11-13 15:03:14.835057'),(153,23,'需求痛点','感兴趣的点','商城路课程','AI自动',0.80,113,1,'2025-11-13 15:03:14.837033','2025-11-13 15:03:14.837033'),(154,23,'需求痛点','客户顾虑','拼团机制不理解','AI自动',0.85,113,1,'2025-11-13 15:03:14.838525','2025-11-13 15:03:14.838525'),(155,23,'需求痛点','客户顾虑','课程类型混淆','AI自动',0.85,113,1,'2025-11-13 15:03:14.840072','2025-11-13 15:03:14.840072'),(156,23,'需求痛点','客户顾虑','退款流程','AI自动',0.85,113,1,'2025-11-13 15:03:14.841615','2025-11-13 15:03:14.841615'),(157,23,'质量评估','线索质量','B级','AI自动',0.90,113,1,'2025-11-13 15:03:14.843415','2025-11-13 15:03:14.843415'),(158,23,'质量评估','意向程度','中意向','AI自动',0.85,113,1,'2025-11-13 15:03:14.844861','2025-11-13 15:03:14.844861'),(159,23,'质量评估','成交机会','中','AI自动',0.75,113,1,'2025-11-13 15:03:14.846317','2025-11-13 15:03:14.846317'),(160,23,'风险标签','流失风险','低','AI自动',0.80,113,1,'2025-11-13 15:03:14.848035','2025-11-13 15:03:14.848035'),(161,23,'情绪态度','客户心态','积极','AI自动',0.75,113,1,'2025-11-13 15:03:14.849484','2025-11-13 15:03:14.849484'),(162,23,'情绪态度','情绪基调','友好','AI自动',0.70,113,1,'2025-11-13 15:03:14.850998','2025-11-13 15:03:14.850998'),(163,23,'情绪态度','信任程度','中','AI自动',0.75,113,1,'2025-11-13 15:03:14.852871','2025-11-13 15:03:14.852871'),(164,24,'基础信息','家长身份','家长','AI自动',0.90,114,1,'2025-11-13 15:31:08.923352','2025-11-13 15:31:08.923352'),(165,24,'基础信息','学生年级','初中','AI自动',0.85,114,1,'2025-11-13 15:31:08.926034','2025-11-13 15:31:08.926034'),(166,24,'基础信息','所在地区','上海浦东新区','AI自动',0.80,114,1,'2025-11-13 15:31:08.927629','2025-11-13 15:31:08.927629'),(167,24,'基础信息','经济水平','中','AI自动',0.70,114,1,'2025-11-13 15:31:08.929187','2025-11-13 15:31:08.929187'),(168,24,'行为特征','教育重视度','很重视','AI自动',0.80,114,1,'2025-11-13 15:31:08.931085','2025-11-13 15:31:08.931085'),(169,24,'行为特征','决策模式','单独决策','AI自动',0.75,114,1,'2025-11-13 15:31:08.932702','2025-11-13 15:31:08.932702'),(170,24,'行为特征','沟通风格','直接','AI自动',0.80,114,1,'2025-11-13 15:31:08.934355','2025-11-13 15:31:08.934355'),(171,24,'需求痛点','客户需求','初中生适用的声乐和羽毛球课程','AI自动',0.85,114,1,'2025-11-13 15:31:08.936487','2025-11-13 15:31:08.936487'),(172,24,'需求痛点','客户需求','明确课程地址和上课机制','AI自动',0.85,114,1,'2025-11-13 15:31:08.938163','2025-11-13 15:31:08.938163'),(173,24,'需求痛点','客户痛点','课程地址信息不清晰','AI自动',0.85,114,1,'2025-11-13 15:31:08.939893','2025-11-13 15:31:08.939893'),(174,24,'需求痛点','客户痛点','拼团规则复杂导致混淆','AI自动',0.85,114,1,'2025-11-13 15:31:08.941594','2025-11-13 15:31:08.941594'),(175,24,'需求痛点','感兴趣的点','声乐课程','AI自动',0.80,114,1,'2025-11-13 15:31:08.943545','2025-11-13 15:31:08.943545'),(176,24,'需求痛点','感兴趣的点','羽毛球课程','AI自动',0.80,114,1,'2025-11-13 15:31:08.945324','2025-11-13 15:31:08.945324'),(177,24,'需求痛点','感兴趣的点','团购优惠','AI自动',0.80,114,1,'2025-11-13 15:31:08.947089','2025-11-13 15:31:08.947089'),(178,24,'需求痛点','客户顾虑','对拼团必要性存疑','AI自动',0.85,114,1,'2025-11-13 15:31:08.949146','2025-11-13 15:31:08.949146'),(179,24,'需求痛点','客户顾虑','担心退款流程','AI自动',0.85,114,1,'2025-11-13 15:31:08.950837','2025-11-13 15:31:08.950837'),(180,24,'质量评估','线索质量','B级','AI自动',0.90,114,1,'2025-11-13 15:31:08.952271','2025-11-13 15:31:08.952271'),(181,24,'质量评估','意向程度','中意向','AI自动',0.85,114,1,'2025-11-13 15:31:08.953875','2025-11-13 15:31:08.953875'),(182,24,'质量评估','成交机会','中','AI自动',0.75,114,1,'2025-11-13 15:31:08.955694','2025-11-13 15:31:08.955694'),(183,24,'风险标签','流失风险','低','AI自动',0.80,114,1,'2025-11-13 15:31:08.957109','2025-11-13 15:31:08.957109'),(184,24,'风险标签','竞品关注','无','AI自动',0.90,114,1,'2025-11-13 15:31:08.958456','2025-11-13 15:31:08.958456'),(185,24,'情绪态度','客户心态','积极','AI自动',0.75,114,1,'2025-11-13 15:31:08.960222','2025-11-13 15:31:08.960222'),(186,24,'情绪态度','情绪基调','友好','AI自动',0.70,114,1,'2025-11-13 15:31:08.961677','2025-11-13 15:31:08.961677'),(187,24,'情绪态度','信任程度','中','AI自动',0.75,114,1,'2025-11-13 15:31:08.963039','2025-11-13 15:31:08.963039'),(188,25,'基础信息','家长身份','家长','AI自动',0.90,115,1,'2025-11-13 15:39:32.640582','2025-11-13 15:39:32.640582'),(189,25,'基础信息','学生年级','初中','AI自动',0.85,115,1,'2025-11-13 15:39:32.643305','2025-11-13 15:39:32.643305'),(190,25,'基础信息','所在地区','上海浦东','AI自动',0.80,115,1,'2025-11-13 15:39:32.644865','2025-11-13 15:39:32.644865'),(191,25,'基础信息','经济水平','中','AI自动',0.70,115,1,'2025-11-13 15:39:32.646338','2025-11-13 15:39:32.646338'),(192,25,'行为特征','教育重视度','一般','AI自动',0.80,115,1,'2025-11-13 15:39:32.648495','2025-11-13 15:39:32.648495'),(193,25,'行为特征','决策模式','单独决策','AI自动',0.75,115,1,'2025-11-13 15:39:32.650286','2025-11-13 15:39:32.650286'),(194,25,'行为特征','沟通风格','直接','AI自动',0.80,115,1,'2025-11-13 15:39:32.651834','2025-11-13 15:39:32.651834'),(195,25,'需求痛点','客户需求','浦东花木附近课程','AI自动',0.85,115,1,'2025-11-13 15:39:32.653460','2025-11-13 15:39:32.653460'),(196,25,'需求痛点','客户需求','初中生适合的街舞课程','AI自动',0.85,115,1,'2025-11-13 15:39:32.655182','2025-11-13 15:39:32.655182'),(197,25,'需求痛点','客户需求','声乐和羽毛球课程','AI自动',0.85,115,1,'2025-11-13 15:39:32.656760','2025-11-13 15:39:32.656760'),(198,25,'需求痛点','客户痛点','课程地址不明确','AI自动',0.85,115,1,'2025-11-13 15:39:32.658222','2025-11-13 15:39:32.658222'),(199,25,'需求痛点','客户痛点','团课拼单流程复杂','AI自动',0.85,115,1,'2025-11-13 15:39:32.659861','2025-11-13 15:39:32.659861'),(200,25,'需求痛点','客户痛点','课程选择困难','AI自动',0.85,115,1,'2025-11-13 15:39:32.661452','2025-11-13 15:39:32.661452'),(201,25,'需求痛点','感兴趣的点','声乐课','AI自动',0.80,115,1,'2025-11-13 15:39:32.662983','2025-11-13 15:39:32.662983'),(202,25,'需求痛点','感兴趣的点','羽毛球课','AI自动',0.80,115,1,'2025-11-13 15:39:32.664526','2025-11-13 15:39:32.664526'),(203,25,'需求痛点','感兴趣的点','化妆课','AI自动',0.80,115,1,'2025-11-13 15:39:32.666345','2025-11-13 15:39:32.666345'),(204,25,'需求痛点','客户顾虑','声乐课为何需要拼单','AI自动',0.85,115,1,'2025-11-13 15:39:32.667667','2025-11-13 15:39:32.667667'),(205,25,'需求痛点','客户顾虑','换课流程不清晰','AI自动',0.85,115,1,'2025-11-13 15:39:32.669101','2025-11-13 15:39:32.669101'),(206,25,'质量评估','线索质量','B级','AI自动',0.90,115,1,'2025-11-13 15:39:32.670755','2025-11-13 15:39:32.670755'),(207,25,'质量评估','意向程度','中意向','AI自动',0.85,115,1,'2025-11-13 15:39:32.672121','2025-11-13 15:39:32.672121'),(208,25,'质量评估','成交机会','中','AI自动',0.75,115,1,'2025-11-13 15:39:32.673536','2025-11-13 15:39:32.673536'),(209,25,'风险标签','流失风险','低','AI自动',0.80,115,1,'2025-11-13 15:39:32.674898','2025-11-13 15:39:32.674898'),(210,25,'情绪态度','客户心态','观望','AI自动',0.75,115,1,'2025-11-13 15:39:32.676717','2025-11-13 15:39:32.676717'),(211,25,'情绪态度','情绪基调','中立','AI自动',0.70,115,1,'2025-11-13 15:39:32.678078','2025-11-13 15:39:32.678078'),(212,25,'情绪态度','信任程度','中','AI自动',0.75,115,1,'2025-11-13 15:39:32.679541','2025-11-13 15:39:32.679541'),(213,26,'基础信息','家长身份','家长','AI自动',0.90,116,1,'2025-11-13 15:44:43.655330','2025-11-13 15:44:43.655330'),(214,26,'基础信息','学生年级','初中','AI自动',0.85,116,1,'2025-11-13 15:44:43.657276','2025-11-13 15:44:43.657276'),(215,26,'基础信息','所在地区','上海浦东','AI自动',0.80,116,1,'2025-11-13 15:44:43.659698','2025-11-13 15:44:43.659698'),(216,26,'基础信息','经济水平','中','AI自动',0.70,116,1,'2025-11-13 15:44:43.661235','2025-11-13 15:44:43.661235'),(217,26,'行为特征','教育重视度','很重视','AI自动',0.80,116,1,'2025-11-13 15:44:43.662686','2025-11-13 15:44:43.662686'),(218,26,'行为特征','决策模式','单独决策','AI自动',0.75,116,1,'2025-11-13 15:44:43.664745','2025-11-13 15:44:43.664745'),(219,26,'行为特征','沟通风格','直接','AI自动',0.80,116,1,'2025-11-13 15:44:43.666229','2025-11-13 15:44:43.666229'),(220,26,'需求痛点','客户需求','浦东花木附近的外教课程','AI自动',0.85,116,1,'2025-11-13 15:44:43.668006','2025-11-13 15:44:43.668006'),(221,26,'需求痛点','客户需求','声乐和羽毛球课程','AI自动',0.85,116,1,'2025-11-13 15:44:43.669809','2025-11-13 15:44:43.669809'),(222,26,'需求痛点','客户需求','明确的课程地址信息','AI自动',0.85,116,1,'2025-11-13 15:44:43.672206','2025-11-13 15:44:43.672206'),(223,26,'需求痛点','客户痛点','课程地址信息不清晰','AI自动',0.85,116,1,'2025-11-13 15:44:43.674076','2025-11-13 15:44:43.674076'),(224,26,'需求痛点','客户痛点','团课需要等待成团','AI自动',0.85,116,1,'2025-11-13 15:44:43.675993','2025-11-13 15:44:43.675993'),(225,26,'需求痛点','客户痛点','对课程形式理解有困惑','AI自动',0.85,116,1,'2025-11-13 15:44:43.677928','2025-11-13 15:44:43.677928'),(226,26,'需求痛点','感兴趣的点','声乐课程','AI自动',0.80,116,1,'2025-11-13 15:44:43.679320','2025-11-13 15:44:43.679320'),(227,26,'需求痛点','感兴趣的点','羽毛球课程','AI自动',0.80,116,1,'2025-11-13 15:44:43.680918','2025-11-13 15:44:43.680918'),(228,26,'需求痛点','感兴趣的点','私教课程形式','AI自动',0.80,116,1,'2025-11-13 15:44:43.682326','2025-11-13 15:44:43.682326'),(229,26,'需求痛点','客户顾虑','为什么声乐课需要团单','AI自动',0.85,116,1,'2025-11-13 15:44:43.684127','2025-11-13 15:44:43.684127'),(230,26,'需求痛点','客户顾虑','退款流程复杂','AI自动',0.85,116,1,'2025-11-13 15:44:43.685582','2025-11-13 15:44:43.685582'),(231,26,'需求痛点','客户顾虑','等待成团时间不确定','AI自动',0.85,116,1,'2025-11-13 15:44:43.687041','2025-11-13 15:44:43.687041'),(232,26,'质量评估','线索质量','B级','AI自动',0.90,116,1,'2025-11-13 15:44:43.688673','2025-11-13 15:44:43.688673'),(233,26,'质量评估','意向程度','中意向','AI自动',0.85,116,1,'2025-11-13 15:44:43.690009','2025-11-13 15:44:43.690009'),(234,26,'质量评估','成交机会','中','AI自动',0.75,116,1,'2025-11-13 15:44:43.691362','2025-11-13 15:44:43.691362'),(235,26,'风险标签','流失风险','低','AI自动',0.80,116,1,'2025-11-13 15:44:43.693328','2025-11-13 15:44:43.693328'),(236,26,'情绪态度','客户心态','观望','AI自动',0.75,116,1,'2025-11-13 15:44:43.695638','2025-11-13 15:44:43.695638'),(237,26,'情绪态度','情绪基调','中立','AI自动',0.70,116,1,'2025-11-13 15:44:43.697452','2025-11-13 15:44:43.697452'),(238,26,'情绪态度','信任程度','中','AI自动',0.75,116,1,'2025-11-13 15:44:43.699579','2025-11-13 15:44:43.699579');
/*!40000 ALTER TABLE `ai_customer_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_field_mapping_config`
--

DROP TABLE IF EXISTS `ai_field_mapping_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_field_mapping_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceEntity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源实体名称（如Customer、AiChatRecord）',
  `targetField` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标字段名称',
  `mappingType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '映射类型（direct直接映射、transform转换映射、ai_extract AI提取）',
  `sourceField` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '源字段名称（direct和transform类型使用）',
  `transformFunction` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '转换函数名称（transform类型使用）',
  `aiExtractPrompt` text COLLATE utf8mb4_unicode_ci COMMENT 'AI提取提示词（ai_extract类型使用）',
  `defaultValue` text COLLATE utf8mb4_unicode_ci COMMENT '默认值（当映射失败时使用）',
  `isActive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_target` (`sourceEntity`,`targetField`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI字段映射配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_field_mapping_config`
--

LOCK TABLES `ai_field_mapping_config` WRITE;
/*!40000 ALTER TABLE `ai_field_mapping_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_field_mapping_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_field_mapping_configs`
--

DROP TABLE IF EXISTS `ai_field_mapping_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_field_mapping_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mapping_scenario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '映射场景key',
  `scenario_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景名称',
  `source_field` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源字段名',
  `target_field` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标字段名',
  `mapping_type` enum('direct','transform','ai_extract') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'direct' COMMENT '映射类型：direct-直接映射, transform-转换映射, ai_extract-AI提取',
  `transform_rule` text COLLATE utf8mb4_unicode_ci COMMENT '转换规则（JS表达式或AI场景key）',
  `data_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '数据类型',
  `default_value` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '默认值',
  `is_required` tinyint NOT NULL DEFAULT '0' COMMENT '是否必填',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '是否启用',
  `display_order` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注说明',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_source` (`mapping_scenario`,`source_field`),
  KEY `idx_active` (`is_active`),
  KEY `idx_scenario` (`mapping_scenario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_field_mapping_configs`
--

LOCK TABLES `ai_field_mapping_configs` WRITE;
/*!40000 ALTER TABLE `ai_field_mapping_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_field_mapping_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_knowledge_base`
--

DROP TABLE IF EXISTS `ai_knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识分类',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识标题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识内容',
  `keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级',
  `usage_count` int NOT NULL DEFAULT '0',
  `creator_id` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_knowledge_base`
--

LOCK TABLES `ai_knowledge_base` WRITE;
/*!40000 ALTER TABLE `ai_knowledge_base` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_marketing_content_library`
--

DROP TABLE IF EXISTS `ai_marketing_content_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_marketing_content_library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `pain_points` json DEFAULT NULL,
  `interest_points` json DEFAULT NULL,
  `generation_params` json DEFAULT NULL,
  `purpose` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `word_count` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `use_count` int NOT NULL DEFAULT '0',
  `last_used_time` datetime DEFAULT NULL,
  `is_favorite` tinyint NOT NULL DEFAULT '0',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_marketing_content_library`
--

LOCK TABLES `ai_marketing_content_library` WRITE;
/*!40000 ALTER TABLE `ai_marketing_content_library` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_marketing_content_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_marketing_scenarios`
--

DROP TABLE IF EXISTS `ai_marketing_scenarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_marketing_scenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scenario_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景标识',
  `scenario_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景名称',
  `scenario_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景分类',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '场景描述',
  `model_provider` enum('deepseek','doubao') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'deepseek' COMMENT 'AI供应商',
  `model_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '具体模型名称',
  `system_prompt` text COLLATE utf8mb4_unicode_ci COMMENT '系统提示词',
  `user_prompt_template` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户提示词模板',
  `required_variables` json DEFAULT NULL COMMENT '必需变量列表',
  `optional_variables` json DEFAULT NULL COMMENT '可选变量列表',
  `temperature` decimal(3,2) NOT NULL DEFAULT '0.30' COMMENT '温度参数',
  `max_tokens` int NOT NULL DEFAULT '2000' COMMENT '最大token数',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '是否启用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序号',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_key` (`scenario_key`),
  UNIQUE KEY `IDX_40516e9b3d3f24ec8703369ce2` (`scenario_key`),
  KEY `idx_active` (`is_active`),
  KEY `idx_category` (`scenario_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_marketing_scenarios`
--

LOCK TABLES `ai_marketing_scenarios` WRITE;
/*!40000 ALTER TABLE `ai_marketing_scenarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_marketing_scenarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_prompt_configs`
--

DROP TABLE IF EXISTS `ai_prompt_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_prompt_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scenario_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景唯一标识',
  `scenario_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景名称',
  `scenario_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景分类',
  `model_provider` enum('deepseek','doubao') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'AI供应商',
  `model_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '具体模型名称',
  `system_prompt` text COLLATE utf8mb4_unicode_ci COMMENT '系统提示词',
  `prompt_content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提示词内容',
  `temperature` decimal(3,2) DEFAULT '0.30' COMMENT '温度参数',
  `max_tokens` int DEFAULT '2000' COMMENT '最大token数',
  `variables` json DEFAULT NULL COMMENT '支持的变量列表',
  `variable_description` text COLLATE utf8mb4_unicode_ci COMMENT '变量说明',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '是否启用',
  `version` int NOT NULL DEFAULT '1' COMMENT '版本号',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_provider` (`scenario_key`,`model_provider`),
  KEY `idx_active` (`is_active`),
  KEY `idx_category` (`scenario_category`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_prompt_configs`
--

LOCK TABLES `ai_prompt_configs` WRITE;
/*!40000 ALTER TABLE `ai_prompt_configs` DISABLE KEYS */;
INSERT INTO `ai_prompt_configs` VALUES (1,'chat_deep_analysis','聊天深度分析','聊天分析','deepseek','deepseek-chat','你是一个专业的教育培训行业销售分析专家，擅长分析微信聊天记录并提供深度洞察。\n\n你的任务是：\n1. 深入分析销售与客户的微信聊天记录\n2. 从20+个维度全面评估客户情况\n3. 识别客户需求、痛点、异议和风险\n4. 评估商机价值和成交可能性\n5. 提供具体可执行的销售策略和话术建议\n\n分析要求：\n- 客观准确，基于事实证据\n- 洞察深入，发现隐藏信息\n- 建议具体，可直接执行\n- 输出格式为严格的JSON，方便系统解析','请深度分析以下微信聊天记录，并按照JSON格式输出分析结果。\n\n【聊天记录】\n{{chatText}}\n\n【分析要求】\n请严格按照以下JSON格式输出分析结果（不要添加任何markdown格式符号）：\n\n{\n  \"qualityLevel\": \"A/B/C/D（A=高价值，B=中等价值，C=一般，D=低价值）\",\n  \"riskLevel\": \"无风险/低/中/高\",\n  \"intentionScore\": 85,\n  \"communicationSummary\": \"简要概括本次沟通的核心内容（100字以内）\",\n\n  \"customerProfile\": {\n    \"parentRole\": \"家长身份\",\n    \"studentGrade\": \"学生年级\",\n    \"studentAge\": 10,\n    \"familyEconomicLevel\": \"高/中/低\",\n    \"educationAttitude\": \"很重视/一般/不太重视\",\n    \"decisionMakerRole\": \"单独决策/共同决策/需配偶同意\",\n    \"communicationStyle\": \"直接/委婉/理性/感性\",\n    \"timeAvailability\": \"充足/一般/紧张\",\n    \"location\": \"所在城市\",\n    \"wechatActivity\": \"高/中/低\"\n  },\n\n  \"customerNeeds\": [\"需求1\", \"需求2\"],\n  \"customerPainPoints\": [\"痛点1\", \"痛点2\"],\n  \"customerInterests\": [\"兴趣点1\", \"兴趣点2\"],\n  \"customerObjections\": [\"顾虑1\", \"顾虑2\"],\n  \"competitorMentioned\": [\"竞品1\"],\n\n  \"customerMindset\": \"积极/观望/抗拒/犹豫\",\n  \"emotionalTone\": \"友好/中立/不耐烦/负面\",\n  \"trustLevel\": \"高/中/低\",\n\n  \"estimatedValue\": 5000,\n  \"estimatedCycle\": \"短期（1周内）/中期（1-4周）/长期（1个月+）\",\n  \"dealOpportunity\": \"高/中/低\",\n  \"urgency\": \"高/中/低\",\n  \"competitiveness\": \"高/中/低\",\n\n  \"nextSteps\": [\"建议行动1\", \"建议行动2\"],\n  \"salesStrategy\": \"整体销售策略说明\",\n  \"recommendedScripts\": {\n    \"opening\": \"开场白话术\",\n    \"valueProposition\": \"价值主张话术\",\n    \"objectionHandling\": \"应对异议话术\",\n    \"closing\": \"促成话术\"\n  },\n\n  \"riskFactors\": [\"风险因素1\"],\n  \"riskReason\": \"风险原因详细说明\"\n}',0.30,4000,'[\"chatText\", \"customerInfo\"]','【变量说明】\nchatText: 聊天记录文本内容，必填\ncustomerInfo: 客户基础信息（可选），格式示例：\n  - 客户姓名：张三\n  - 微信昵称：阳光少年\n  - 意向等级：A级\n  - 生命周期：意向客户',1,1,'2025-11-12 13:42:44.517731','2025-11-13 20:05:54.545077'),(2,'chat_ocr_extract','聊天OCR识别','聊天分析','doubao',NULL,'你是一个专业的OCR文字识别助手。请提取图片中的所有文字内容，保持原有格式和顺序。','请识别这张微信聊天截图中的所有文字内容，包括发送者、时间和消息内容。保持原有的对话顺序和格式。',0.10,2000,'[\"imagePath\"]','【变量说明】\nimagePath: 微信聊天截图的文件路径，必填\n注意：图片需要清晰可读，支持常见图片格式',1,1,'2025-11-12 13:42:44.517731','2025-11-13 20:05:54.550169'),(3,'customer_recovery_script','客户复苏话术','客户管理','deepseek','deepseek-chat','你是一个教育培训销售话术专家，擅长编写自然、亲切、有吸引力的客户复苏话术。','请为以下沉睡客户生成一条复苏话术：\n\n客户信息：\n- 姓名：{{customerName}}\n- 上次沟通时间：{{lastContactTime}}\n- 客户需求：{{needs}}\n- 之前顾虑：{{objections}}\n\n要求：\n1. 话术自然、不生硬，像朋友聊天\n2. 提供新的价值点或福利信息\n3. 给客户一个愿意回复的理由\n4. 控制在100字以内\n5. 不要使用过于商业化的语言\n\n请直接输出话术内容，不要其他说明文字。',0.70,500,'[\"customerName\", \"customerIntent\", \"reason\", \"lastFollowTime\"]','【变量说明】\ncustomerName: 客户姓名或昵称，必填\ncustomerIntent: 原意向等级，可选值：A级/B级/C级\nreason: 流失原因，例如：价格因素/时间不合适/竞品选择/无回应\nlastFollowTime: 上次跟进时间，格式：YYYY-MM-DD',1,1,'2025-11-12 13:42:44.517731','2025-11-13 20:05:54.568723'),(4,'customer_info_extract','客户信息提取','客户管理','deepseek','deepseek-chat','你是一个专业的信息提取助手，擅长从对话文本中提取结构化的客户信息。','请从以下聊天记录中提取客户的基本信息：\n\n{{chatText}}\n\n请以JSON格式输出以下信息（如果无法确定则填null）：\n{\n  \"realName\": \"真实姓名\",\n  \"phone\": \"手机号\",\n  \"wechatNickname\": \"微信昵称\",\n  \"gender\": \"性别\",\n  \"location\": \"所在地区\",\n  \"studentGrade\": \"学生年级\",\n  \"studentAge\": 学生年龄数字\n}',0.20,1000,'[\"chatText\"]','chatText: 聊天记录文本',1,1,'2025-11-12 13:42:44.517731','2025-11-12 13:42:44.546122'),(10,'sales_script_opening','开场白话术生成','销售话术','deepseek','deepseek-chat','你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。','请为以下客户生成{{scriptType}}话术：\n\n客户信息：\n- 客户姓名：{{customerName}}\n- 意向等级：{{customerIntent}}\n- 生命周期：{{lifecycleStage}}\n\n要求：\n1. 话术要自然、亲切、专业\n2. 符合教育培训行业特点\n3. 针对客户情况个性化定制\n4. 100字以内\n5. 直接输出话术内容，不要其他说明\n6. 开场白要引起客户兴趣，建立信任',0.70,500,'[\"customerName\", \"customerIntent\", \"lifecycleStage\", \"scriptType\"]','【变量说明】\ncustomerName: 客户姓名或昵称，必填\ncustomerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向\nlifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户\nscriptType: 话术类型（系统自动填充）',1,1,'2025-11-13 19:44:47.208263','2025-11-13 20:05:54.554805'),(11,'sales_script_value','价值主张话术生成','销售话术','deepseek','deepseek-chat','你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。','请为以下客户生成{{scriptType}}话术：\n\n客户信息：\n- 客户姓名：{{customerName}}\n- 意向等级：{{customerIntent}}\n- 生命周期：{{lifecycleStage}}\n\n要求：\n1. 话术要自然、亲切、专业\n2. 符合教育培训行业特点\n3. 针对客户情况个性化定制\n4. 150字以内\n5. 直接输出话术内容，不要其他说明\n6. 突出产品核心价值和客户能获得的具体好处\n7. 结合客户痛点和需求',0.70,500,'[\"customerName\", \"customerIntent\", \"lifecycleStage\", \"scriptType\"]','【变量说明】\ncustomerName: 客户姓名或昵称，必填\ncustomerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向\nlifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户\nscriptType: 话术类型（系统自动填充）',1,1,'2025-11-13 19:44:47.212451','2025-11-13 20:05:54.557991'),(12,'sales_script_objection','异议处理话术生成','销售话术','deepseek','deepseek-chat','你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。','请为以下客户生成{{scriptType}}话术：\n\n客户信息：\n- 客户姓名：{{customerName}}\n- 意向等级：{{customerIntent}}\n- 生命周期：{{lifecycleStage}}\n\n要求：\n1. 话术要自然、亲切、专业\n2. 符合教育培训行业特点\n3. 针对客户情况个性化定制\n4. 150字以内\n5. 直接输出话术内容，不要其他说明\n6. 针对常见异议（价格贵、没时间、再考虑）提供应对策略\n7. 采用同理心+价值重塑的方式',0.70,500,'[\"customerName\", \"customerIntent\", \"lifecycleStage\", \"scriptType\"]','【变量说明】\ncustomerName: 客户姓名或昵称，必填\ncustomerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向\nlifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户\nscriptType: 话术类型（系统自动填充）',1,1,'2025-11-13 19:44:47.217499','2025-11-13 20:05:54.561410'),(13,'sales_script_closing','促成话术生成','销售话术','deepseek','deepseek-chat','你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。','请为以下客户生成{{scriptType}}话术：\n\n客户信息：\n- 客户姓名：{{customerName}}\n- 意向等级：{{customerIntent}}\n- 生命周期：{{lifecycleStage}}\n\n要求：\n1. 话术要自然、亲切、专业\n2. 符合教育培训行业特点\n3. 针对客户情况个性化定制\n4. 100字以内\n5. 直接输出话术内容，不要其他说明\n6. 创造紧迫感，给出明确的行动指引\n7. 提供优惠或福利刺激成交',0.70,500,'[\"customerName\", \"customerIntent\", \"lifecycleStage\", \"scriptType\"]','【变量说明】\ncustomerName: 客户姓名或昵称，必填\ncustomerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向\nlifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户\nscriptType: 话术类型（系统自动填充）',1,1,'2025-11-13 19:44:47.222262','2025-11-13 20:05:54.564787'),(15,'ai_training_conversation','AI对话训练','AI训练','deepseek','deepseek-chat','你是一个教育培训的潜在客户，用于帮助销售人员进行销售话术练习。','你正在扮演一个教育培训的潜在客户，场景是\"{{scenario}}\"。\n之前的对话：\n{{conversationHistory}}\n\n现在请作为客户回复销售，要求：\n1. 符合真实客户的反应\n2. 可以提出异议或顾虑\n3. 50字以内\n4. 直接输出客户的话，不要\"客户：\"前缀',0.80,200,'[\"scenario\", \"conversationHistory\"]','【变量说明】\nscenario: 训练场景，例如：首次电话沟通/价格异议处理/课程介绍\nconversationHistory: 对话历史记录，格式：\n  销售：您好...\n  客户：...\n  （系统自动拼接）',1,1,'2025-11-13 19:54:45.247594','2025-11-13 20:05:54.574022'),(16,'marketing_content_generate','营销文案生成','营销工具','deepseek','deepseek-chat','你是一个专业的教育培训行业营销文案专家，擅长创作各类营销内容，包括朋友圈文案、短视频脚本、公众号推文等。','{{instruction}}\n\n{{painPoints}}\n\n{{needs}}\n\n{{interests}}\n\n{{purpose}}\n\n{{style}}\n\n{{wordCount}}\n\n{{tips}}\n\n直接输出文案内容，不要其他说明。',0.80,2000,'[\"instruction\", \"painPoints\", \"needs\", \"interests\", \"purpose\", \"style\", \"wordCount\", \"tips\"]','【变量说明】\ninstruction: 文案类型指令（系统根据选择自动填充）\n  - 朋友圈文案\n  - 微信群发文案\n  - 抖音营销文案\n  - 小红书营销文案\n  - 短视频拍摄脚本\n  - 公众号推文\n\npainPoints: 客户痛点列表，多个用换行分隔\nneeds: 客户需求列表，多个用换行分隔\ninterests: 客户兴趣点列表，多个用换行分隔\npurpose: 发布目的，例如：引流/转化/品牌宣传\nstyle: 风格要求，例如：专业/亲切/幽默/激励\nwordCount: 字数要求，例如：100字以内/500-800字\ntips: 注意事项（系统根据文案类型自动填充）',1,1,'2025-11-13 19:54:45.253862','2025-11-13 20:05:54.577391'),(17,'crm_problem_diagnosis','CRM问题诊断','CRM分析','deepseek','deepseek-chat','你是一个专业的CRM数据分析专家，擅长从关键指标中识别业务问题和改进机会。','作为CRM分析专家，请诊断以下数据中存在的问题：\n\n关键指标：\n{{keyMetrics}}\n\n请以JSON数组格式输出问题，例如：[\"问题1\", \"问题2\", \"问题3\"]\n\n要求：\n1. 深入分析指标背后的问题\n2. 找出影响业绩的关键因素\n3. 问题描述要具体明确\n4. 3-5个问题即可',0.70,1000,'[\"keyMetrics\"]','【变量说明】\nkeyMetrics: 关键指标数据（系统自动计算），包括：\n  - 转化率：客户成交率\n  - 平均响应时间：销售响应客户的平均时长\n  - 高质量线索比例：A/B级客户占比\n  - 新增客户数\n  - 成交客户数\n  等多维度数据',1,1,'2025-11-13 19:54:45.257478','2025-11-13 20:05:54.580815'),(18,'crm_improvement_recommendation','CRM改进建议','CRM分析','deepseek','deepseek-chat','你是一个专业的CRM顾问，擅长根据诊断出的问题提供具体可执行的改进方案。','基于以下问题，请给出具体的改进建议：\n\n问题：\n{{problems}}\n\n请以JSON数组格式输出建议，例如：[\"建议1\", \"建议2\", \"建议3\"]\n\n要求：\n1. 建议要具体可执行\n2. 针对问题提供解决方案\n3. 考虑实施的可行性\n4. 3-5条建议即可',0.70,1000,'[\"problems\"]','【变量说明】\nproblems: 问题列表（由问题诊断功能自动生成），格式：\n  1. 问题1描述\n  2. 问题2描述\n  3. 问题3描述\n  ...',1,1,'2025-11-13 19:54:45.262349','2025-11-13 20:05:54.584900'),(19,'ai_efficiency_analysis','AI人效分析报告','CRM分析','deepseek','deepseek-chat','你是一个专业的CRM数据分析专家，擅长分析销售人员的工作效率和AI使用效果。','请对以下销售数据进行人效分析：\n\n{{salesData}}\n\n要求：\n1. 分析销售效率和AI功能使用情况\n2. 识别高效销售的特征\n3. 找出可改进的环节\n4. 提供具体优化建议\n5. 以结构化格式输出',0.70,2000,'[\"salesData\"]','【变量说明】\nsalesData: 销售人员数据（系统自动聚合），包括：\n  - 销售人员信息\n  - 客户跟进数据\n  - AI功能使用情况\n  - 成交数据\n  - 效率指标\n  等综合数据',1,1,'2025-11-13 19:54:45.266358','2025-11-13 20:05:54.588249');
/*!40000 ALTER TABLE `ai_prompt_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_prompt_variables`
--

DROP TABLE IF EXISTS `ai_prompt_variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_prompt_variables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_config_id` int NOT NULL COMMENT 'AI提示词配置ID',
  `scenario_key` varchar(50) NOT NULL COMMENT '场景标识（冗余字段）',
  `variable_key` varchar(50) NOT NULL COMMENT '变量标识',
  `variable_name` varchar(100) NOT NULL COMMENT '变量名称',
  `variable_description` text COMMENT '变量说明',
  `data_type` varchar(20) NOT NULL DEFAULT 'text' COMMENT '数据类型',
  `is_required` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否必填',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `default_value` varchar(500) DEFAULT NULL COMMENT '默认值',
  `example_value` text COMMENT '示例值',
  `validation_rule` varchar(500) DEFAULT NULL COMMENT '验证规则',
  `display_order` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `category` varchar(50) DEFAULT NULL COMMENT '变量分类',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_variable` (`prompt_config_id`,`variable_key`),
  KEY `idx_scenario_key` (`scenario_key`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `FK_0527a32ecbcf63e99949ab9e144` FOREIGN KEY (`prompt_config_id`) REFERENCES `ai_prompt_configs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_prompt_variables`
--

LOCK TABLES `ai_prompt_variables` WRITE;
/*!40000 ALTER TABLE `ai_prompt_variables` DISABLE KEYS */;
INSERT INTO `ai_prompt_variables` VALUES (1,1,'chat_deep_analysis','chatText','聊天记录','微信聊天记录的完整文本内容，包含销售和客户的对话','text',1,1,NULL,'销售：您好，了解到您对我们的课程感兴趣\n客户：是的，想了解一下...',NULL,1,'必填字段','2025-11-13 20:31:53.263479','2025-11-13 20:31:53.263479'),(2,1,'chat_deep_analysis','customerInfo','客户基础信息','客户的基础信息，包括姓名、昵称、意向等级、生命周期等（可选）','text',0,1,NULL,'客户姓名：张三\n微信昵称：阳光少年\n意向等级：A级\n生命周期：意向客户',NULL,2,'可选字段','2025-11-13 20:31:53.270561','2025-11-13 20:31:53.270561'),(3,2,'chat_ocr_extract','imagePath','图片路径','微信聊天截图的文件路径，需要清晰可读','text',1,1,NULL,'/uploads/chat_screenshot_20250113.png',NULL,1,'必填字段','2025-11-13 20:31:53.274607','2025-11-13 20:31:53.274607'),(4,10,'sales_script_opening','customerName','客户姓名','客户的姓名或微信昵称','text',1,1,NULL,'张三',NULL,1,'客户信息','2025-11-13 20:31:53.278354','2025-11-13 20:31:53.278354'),(5,10,'sales_script_opening','customerIntent','意向等级','客户的意向等级分类','text',1,1,NULL,'A级/B级/C级/高意向/中等意向/低意向/无意向',NULL,2,'客户信息','2025-11-13 20:31:53.282290','2025-11-13 20:31:53.282290'),(6,10,'sales_script_opening','lifecycleStage','生命周期','客户当前所处的生命周期阶段','text',1,1,NULL,'新客户/意向客户/成交客户/流失客户',NULL,3,'客户信息','2025-11-13 20:31:53.285934','2025-11-13 20:31:53.285934'),(7,10,'sales_script_opening','scriptType','话术类型','系统自动填充的话术类型标识','text',1,1,NULL,'开场白',NULL,4,'系统自动','2025-11-13 20:31:53.290635','2025-11-13 20:31:53.290635'),(8,11,'sales_script_value','customerName','客户姓名','客户的姓名或微信昵称','text',1,1,NULL,'张三',NULL,1,'客户信息','2025-11-13 20:31:53.294051','2025-11-13 20:31:53.294051'),(9,11,'sales_script_value','customerIntent','意向等级','客户的意向等级分类','text',1,1,NULL,'A级/B级/C级/高意向/中等意向/低意向/无意向',NULL,2,'客户信息','2025-11-13 20:31:53.298617','2025-11-13 20:31:53.298617'),(10,11,'sales_script_value','lifecycleStage','生命周期','客户当前所处的生命周期阶段','text',1,1,NULL,'新客户/意向客户/成交客户/流失客户',NULL,3,'客户信息','2025-11-13 20:31:53.302538','2025-11-13 20:31:53.302538'),(11,11,'sales_script_value','scriptType','话术类型','系统自动填充的话术类型标识','text',1,1,NULL,'价值主张',NULL,4,'系统自动','2025-11-13 20:31:53.305908','2025-11-13 20:31:53.305908'),(12,12,'sales_script_objection','customerName','客户姓名','客户的姓名或微信昵称','text',1,1,NULL,'张三',NULL,1,'客户信息','2025-11-13 20:31:53.309950','2025-11-13 20:31:53.309950'),(13,12,'sales_script_objection','customerIntent','意向等级','客户的意向等级分类','text',1,1,NULL,'A级/B级/C级/高意向/中等意向/低意向/无意向',NULL,2,'客户信息','2025-11-13 20:31:53.317106','2025-11-13 20:31:53.317106'),(14,12,'sales_script_objection','lifecycleStage','生命周期','客户当前所处的生命周期阶段','text',1,1,NULL,'新客户/意向客户/成交客户/流失客户',NULL,3,'客户信息','2025-11-13 20:31:53.322711','2025-11-13 20:31:53.322711'),(15,12,'sales_script_objection','scriptType','话术类型','系统自动填充的话术类型标识','text',1,1,NULL,'异议处理',NULL,4,'系统自动','2025-11-13 20:31:53.325290','2025-11-13 20:31:53.325290'),(16,13,'sales_script_closing','customerName','客户姓名','客户的姓名或微信昵称','text',1,1,NULL,'张三',NULL,1,'客户信息','2025-11-13 20:31:53.328782','2025-11-13 20:31:53.328782'),(17,13,'sales_script_closing','customerIntent','意向等级','客户的意向等级分类','text',1,1,NULL,'A级/B级/C级/高意向/中等意向/低意向/无意向',NULL,2,'客户信息','2025-11-13 20:31:53.334546','2025-11-13 20:31:53.334546'),(18,13,'sales_script_closing','lifecycleStage','生命周期','客户当前所处的生命周期阶段','text',1,1,NULL,'新客户/意向客户/成交客户/流失客户',NULL,3,'客户信息','2025-11-13 20:31:53.336976','2025-11-13 20:31:53.336976'),(19,13,'sales_script_closing','scriptType','话术类型','系统自动填充的话术类型标识','text',1,1,NULL,'促成话术',NULL,4,'系统自动','2025-11-13 20:31:53.340947','2025-11-13 20:31:53.340947'),(20,3,'customer_recovery_script','customerName','客户姓名','流失客户的姓名或昵称','text',1,1,NULL,'李四',NULL,1,'客户信息','2025-11-13 20:31:53.343200','2025-11-13 20:31:53.343200'),(21,3,'customer_recovery_script','customerIntent','原意向等级','客户流失前的意向等级','text',1,1,NULL,'A级/B级/C级',NULL,2,'客户信息','2025-11-13 20:31:53.346539','2025-11-13 20:31:53.346539'),(22,3,'customer_recovery_script','reason','流失原因','客户流失的主要原因','text',0,1,NULL,'价格因素/时间不合适/竞品选择/无回应',NULL,3,'业务信息','2025-11-13 20:31:53.350656','2025-11-13 20:31:53.350656'),(23,3,'customer_recovery_script','lastFollowTime','上次跟进时间','最后一次跟进客户的时间','date',0,1,NULL,'2025-01-10',NULL,4,'业务信息','2025-11-13 20:31:53.354306','2025-11-13 20:31:53.354306'),(24,15,'ai_training_conversation','scenario','训练场景','销售话术练习的具体场景','text',1,1,NULL,'首次电话沟通/价格异议处理/课程介绍',NULL,1,'训练设置','2025-11-13 20:31:53.357391','2025-11-13 20:31:53.357391'),(25,15,'ai_training_conversation','conversationHistory','对话历史','之前轮次的对话记录（系统自动拼接）','text',1,1,NULL,'销售：您好，了解到您对我们的课程感兴趣\n客户：是的，想了解一下价格',NULL,2,'系统自动','2025-11-13 20:31:53.361567','2025-11-13 20:31:53.361567'),(26,16,'marketing_content_generate','instruction','文案类型指令','系统根据选择自动填充的文案类型','text',1,1,NULL,'生成一条适合发朋友圈的营销文案',NULL,1,'系统自动','2025-11-13 20:31:53.365635','2025-11-13 20:31:53.365635'),(27,16,'marketing_content_generate','painPoints','客户痛点','目标客户的痛点列表，多个用换行分隔','text',0,1,NULL,'孩子学习成绩不理想\n找不到好的培训机构\n担心学费太贵',NULL,2,'内容要素','2025-11-13 20:31:53.368894','2025-11-13 20:31:53.368894'),(28,16,'marketing_content_generate','needs','客户需求','目标客户的需求列表，多个用换行分隔','text',0,1,NULL,'提升孩子成绩\n个性化辅导\n灵活的上课时间',NULL,3,'内容要素','2025-11-13 20:31:53.373509','2025-11-13 20:31:53.373509'),(29,16,'marketing_content_generate','interests','客户兴趣点','目标客户的兴趣点列表，多个用换行分隔','text',0,1,NULL,'名师教学\n小班授课\n试听课程',NULL,4,'内容要素','2025-11-13 20:31:53.378017','2025-11-13 20:31:53.378017'),(30,16,'marketing_content_generate','purpose','发布目的','发布这条营销内容的主要目的','text',0,1,NULL,'引流/转化/品牌宣传/活动推广',NULL,5,'风格设置','2025-11-13 20:31:53.381388','2025-11-13 20:31:53.381388'),(31,16,'marketing_content_generate','style','风格要求','文案的写作风格要求','text',0,1,NULL,'专业/亲切/幽默/激励',NULL,6,'风格设置','2025-11-13 20:31:53.385200','2025-11-13 20:31:53.385200'),(32,16,'marketing_content_generate','wordCount','字数要求','文案的字数限制要求','text',0,1,NULL,'100字以内/200-300字/500-800字',NULL,7,'风格设置','2025-11-13 20:31:53.388414','2025-11-13 20:31:53.388414'),(33,16,'marketing_content_generate','tips','注意事项','系统根据文案类型自动填充的注意事项','text',1,1,NULL,'要求：简洁有力，引发共鸣，包含适当emoji',NULL,8,'系统自动','2025-11-13 20:31:53.391061','2025-11-13 20:31:53.391061'),(34,17,'crm_problem_diagnosis','keyMetrics','关键指标数据','系统自动计算并拼接的关键业务指标','text',1,1,NULL,'转化率：15.5%\n平均响应时间：2.3小时\n高质量线索比例：28%',NULL,1,'系统自动','2025-11-13 20:31:53.393425','2025-11-13 20:31:53.393425'),(35,18,'crm_improvement_recommendation','problems','问题列表','由问题诊断功能自动生成的问题列表','array',1,1,NULL,'1. 客户响应时间过长\n2. 高质量线索转化率偏低\n3. 跟进频率不够',NULL,1,'系统自动','2025-11-13 20:31:53.397182','2025-11-13 20:31:53.397182'),(36,19,'ai_efficiency_analysis','salesData','销售数据','系统自动聚合的销售人员综合数据','json',1,1,NULL,'包括：销售信息、客户跟进数据、AI使用情况、成交数据、效率指标等',NULL,1,'系统自动','2025-11-13 20:31:53.400041','2025-11-13 20:31:53.400041');
/*!40000 ALTER TABLE `ai_prompt_variables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_reports`
--

DROP TABLE IF EXISTS `ai_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_period` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `report_data` json DEFAULT NULL,
  `key_metrics` json DEFAULT NULL,
  `ai_insights` json DEFAULT NULL,
  `problems` json DEFAULT NULL,
  `recommendations` json DEFAULT NULL,
  `status` enum('生成中','已完成','失败') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '生成中',
  `generate_time` datetime DEFAULT NULL,
  `generator` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI自动生成',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_reports`
--

LOCK TABLES `ai_reports` WRITE;
/*!40000 ALTER TABLE `ai_reports` DISABLE KEYS */;
INSERT INTO `ai_reports` VALUES (1,'周报','2025-10','全公司',NULL,NULL,'{\"aiUsageCount\": 245, \"newCustomers\": 25, \"conversionRate\": 0.32, \"totalCustomers\": 150, \"avgResponseTime\": 2.5, \"highQualityLeads\": 12, \"customerSatisfaction\": 4.5}','[\"```json\\n[\\n  \\\"客户转化效率较高但基数偏小：32%的转化率表明销售流程较为高效，但150的总客户数显示整体客户规模有限，建议在保持转化质量的同时扩大获客渠道\\\",\\n  \\\"AI工具使用活跃但线索质量待提升：AI使用次数达245次显示技术应用积极，但高质量线索仅12个，建议优化AI筛选算法或加强线索评分机制\\\",\\n  \\\"响应速度优势明显可转化为竞争力：2.5小时的平均响应时间表现优异，建议将此作为差异化优势在营销中突出展示\\\",\\n  \\\"新增客户占比16.7%显示增长动能：25个新增客户占总客户数的较高比例，表明近期获客效果良好，需关注客户留存情况\\\",\\n  \\\"高质量线索转化潜力巨大：12个高质量线索若全部转化可带来约4个新客户，建议销售团队优先跟进并制定专属转化策略\\\"\\n]\\n```\"]','[\"```json\\n[\\n  \\\"平均响应时间过长（2.5小时），可能导致潜在客户流失，影响转化效果\\\",\\n  \\\"高质量线索比例偏低（48.0%），近半数线索质量不高，影响整体转化效率\\\",\\n  \\\"转化率32.0%虽然尚可，但与高质量线索比例不匹配，可能存在跟进策略或销售流程问题\\\"\\n]\\n```\"]','[\"```json\\n[\\n  \\\"建立SLA响应机制，设置不同优先级线索的响应时限，确保高价值线索在15分钟内响应\\\",\\n  \\\"优化线索评分模型，增加更多行为数据维度（如网站访问深度、内容下载频次等）提升线索质量识别准确率\\\",\\n  \\\"实施线索分级管理，将48%低质量线索转入培育流程，通过自动化营销内容持续培养\\\",\\n  \\\"加强销售团队培训，针对不同质量线索制定差异化跟进策略，提升转化匹配度\\\",\\n  \\\"建立响应时间监控仪表板，实时追踪团队响应表现，设置预警机制\\\",\\n  \\\"优化销售流程，明确各阶段转化标准，减少因流程不畅导致的转化损失\\\"\\n]\\n```\"]','已完成','2025-11-08 12:16:53','AI自动生成','2025-11-08 12:16:33.680936','2025-11-08 12:16:52.000000');
/*!40000 ALTER TABLE `ai_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_risk_alerts`
--

DROP TABLE IF EXISTS `ai_risk_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_risk_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `risk_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_level` enum('低','中','高') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '中',
  `risk_score` int DEFAULT NULL,
  `risk_reason` text COLLATE utf8mb4_unicode_ci,
  `recommended_actions` json DEFAULT NULL,
  `from_chat_record_id` int DEFAULT NULL,
  `status` enum('待处理','处理中','已解决','已忽略') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待处理',
  `assigned_to` int DEFAULT NULL,
  `handler_id` int DEFAULT NULL,
  `handle_result` text COLLATE utf8mb4_unicode_ci,
  `handle_time` datetime DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_1ab9d803e7e24becaf3547d15c9` (`customer_id`),
  CONSTRAINT `FK_1ab9d803e7e24becaf3547d15c9` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_risk_alerts`
--

LOCK TABLES `ai_risk_alerts` WRITE;
/*!40000 ALTER TABLE `ai_risk_alerts` DISABLE KEYS */;
INSERT INTO `ai_risk_alerts` VALUES (1,1,'流失风险','中',25,'客户明确表达对团课模式的疑虑，担心需要等待成团，且对课程形式理解有偏差，存在因等待时间过长或理解不一致而取消订单的风险','[\"顾问及时联系确认课程细节\", \"明确排课时间和地点\", \"提供试听安排\", \"跟进团课成团进度\"]',11,'待处理',1,NULL,NULL,NULL,'2025-11-08 15:54:07.514215','2025-11-08 15:54:07.514215'),(2,1,'流失风险','中',25,'客户多次询问退课流程和团课机制，显示对课程安排存在担忧，需要进一步沟通消除疑虑，否则可能在开课前取消订单','[\"确认课程顾问已联系客户\", \"跟进课程排期情况\", \"确认开课时间和地点\", \"提供课程准备指导\"]',12,'待处理',1,NULL,NULL,NULL,'2025-11-08 16:26:44.489247','2025-11-08 16:26:44.489247'),(3,1,'流失风险','中',25,'客户对拼团开课机制存在误解，担心课程质量和退款流程，可能影响最终成交决策，需要及时澄清和建立信任','[\"跟进课程顾问对接情况\", \"确认排课时间安排\", \"解答拼团机制疑问\", \"提供更高级课程选项\"]',13,'待处理',1,NULL,NULL,NULL,'2025-11-08 16:36:55.263092','2025-11-08 16:36:55.263092'),(4,1,'流失风险','中',25,'客户明确表示想要\'高级点的\'课程，对现有拼团机制有疑问，且对课程地址有具体要求，如果无法满足这些核心需求，可能选择其他机构或放弃报名。','[\"跟进订单置换进度\", \"确认高级课程安排\", \"协助添加专属顾问\", \"明确开课时间\"]',18,'待处理',4,NULL,NULL,NULL,'2025-11-10 17:20:49.488900','2025-11-10 17:20:49.488900');
/*!40000 ALTER TABLE `ai_risk_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_scripts`
--

DROP TABLE IF EXISTS `ai_scripts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_scripts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `script_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scenario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_profile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `script_title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` enum('AI生成','优秀案例','人工编写') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI生成',
  `source_user_id` int DEFAULT NULL,
  `effectiveness_score` decimal(3,1) DEFAULT NULL,
  `usage_count` int NOT NULL DEFAULT '0',
  `success_count` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_scripts`
--

LOCK TABLES `ai_scripts` WRITE;
/*!40000 ALTER TABLE `ai_scripts` DISABLE KEYS */;
INSERT INTO `ai_scripts` VALUES (1,'开场白','客户ID_1','中意向','开场白 - null','您好！我是XX教育的课程顾问小王。看到您之前对我们的课程很感兴趣，想了解一下您目前在学习方面有什么具体需求吗？我们可以根据您的情况，为您推荐最适合的课程方案，帮助您更好地提升自己。','AI生成',NULL,NULL,0,0,1,'2025-11-08 16:24:30.878720','2025-11-08 16:24:30.878720'),(2,'价值主张','客户ID_1','中意向','价值主张 - null','您好！看到您对提升自己很感兴趣，我们特别为您准备了专属学习方案。我们的课程不仅注重实用技能培养，还配备了专业导师全程指导。现在报名还能享受限时优惠，让您花更少的钱获得更大的成长。要不要了解一下具体安排呢？','AI生成',NULL,NULL,0,0,1,'2025-11-08 16:35:37.671809','2025-11-08 16:35:37.671809'),(3,'开场白','客户ID_26','中意向意向','开场白 - 家长','家长您好！很高兴能为您提供教育方案咨询。根据我们之前的沟通，我为您准备了几套适合孩子的学习提升方案，都是根据孩子的学习特点和需求定制的。您看什么时间方便，我们详细聊聊具体内容？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:07:23.603054','2025-11-13 19:07:23.603054'),(4,'开场白','客户ID_26','中意向意向','开场白 - 家长','家长您好！很高兴再次与您沟通。根据上次交流，我为您孩子量身定制了一套学习提升方案，特别关注他目前在数学思维方面的薄弱环节。这套方案结合了我们资深教师的授课经验，能帮助孩子建立系统的解题思路。您看什么时间方便，我详细为您介绍一下？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:07:32.286771','2025-11-13 19:07:32.286771'),(5,'开场白','客户ID_26','中意向意向','开场白 - 家长','家长您好！很高兴能继续为您服务。根据上次沟通，我为您准备了几套适合孩子的学习方案，都是针对孩子现阶段学习特点量身定制的。您看什么时候方便，我详细给您介绍一下？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:07:44.505013','2025-11-13 19:07:44.505013'),(6,'价值主张','客户ID_26','中意向意向','价值主张 - 家长','家长您好！看到您对孩子教育这么上心，真的很感动。我们的课程正是针对孩子现阶段的学习特点设计的，不仅能帮助孩子夯实基础，还能培养学习兴趣。如果您方便的话，我们可以约个时间详细聊聊孩子的具体情况，为您量身定制最适合的学习方案。','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:08:11.562839','2025-11-13 19:08:11.562839'),(7,'异议处理','客户ID_26','中意向意向','异议处理 - 家长','家长您好，我理解您的顾虑。其实很多家长在报名前都会有这样的考虑。我们的课程设计正是针对孩子的学习特点，通过个性化教学方案，能有效提升学习效果。建议可以先让孩子体验一节课，亲身感受一下，您觉得呢？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:08:26.764339','2025-11-13 19:08:26.764339'),(8,'开场白','客户ID_26','中意向意向','开场白 - 家长','家长您好！很高兴能继续为您服务。上次沟通后，我根据您孩子的学习情况准备了一份专属学习方案，特别关注了数学和英语的提升重点。您看什么时间方便，我为您详细介绍一下课程安排和教学特色？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:18:37.291585','2025-11-13 19:18:37.291585'),(9,'价值主张','客户ID_26','中意向意向','价值主张 - 家长','家长您好！看到您对孩子教育的重视，我们特别设计了这套个性化学习方案。通过精准测评和专属课程，能帮助孩子快速提升薄弱环节，同时培养良好学习习惯。现在报名还可享受专属优惠，让孩子在新学期赢在起跑线！','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:18:46.344770','2025-11-13 19:18:46.344770'),(10,'异议处理','客户ID_26','中意向意向','异议处理 - 家长','家长您好，我理解您的考虑。其实很多家长在报名前都有类似想法，但我们的课程正是针对孩子这个阶段的学习特点设计的。建议可以先让孩子试听一节课，亲身感受一下课堂氛围和学习效果，您看这周三还是周四方便呢？','AI生成',NULL,NULL,0,0,1,'2025-11-13 19:18:54.527225','2025-11-13 19:18:54.527225');
/*!40000 ALTER TABLE `ai_scripts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_training_records`
--

DROP TABLE IF EXISTS `ai_training_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_training_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `training_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '对话陪练',
  `scenario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversation` json DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `round_count` int DEFAULT NULL,
  `ai_score` decimal(3,1) DEFAULT NULL,
  `communication_score` decimal(3,1) DEFAULT NULL,
  `response_speed_score` decimal(3,1) DEFAULT NULL,
  `objection_handling_score` decimal(3,1) DEFAULT NULL,
  `ai_feedback` text COLLATE utf8mb4_unicode_ci,
  `training_result` enum('优秀','良好','及格','不及格') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_training_records`
--

LOCK TABLES `ai_training_records` WRITE;
/*!40000 ALTER TABLE `ai_training_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_training_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `automation_logs`
--

DROP TABLE IF EXISTS `automation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rule_id` int NOT NULL COMMENT '规则ID',
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标类型（customer/order）',
  `target_id` int NOT NULL COMMENT '目标ID',
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '执行状态',
  `result` json DEFAULT NULL COMMENT '执行结果详情',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `execution_time` int NOT NULL DEFAULT '0' COMMENT '执行耗时（毫秒）',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_7cea5a32f4f1e8285f6685e85ea` (`rule_id`),
  CONSTRAINT `FK_7cea5a32f4f1e8285f6685e85ea` FOREIGN KEY (`rule_id`) REFERENCES `automation_rules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `automation_logs`
--

LOCK TABLES `automation_logs` WRITE;
/*!40000 ALTER TABLE `automation_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `automation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `automation_rules`
--

DROP TABLE IF EXISTS `automation_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automation_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `ruleType` enum('auto_assign','auto_remind','auto_tag') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则类型',
  `triggerType` enum('new_customer','follow_time','no_follow','intent_change') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '触发类型',
  `triggerConditions` json DEFAULT NULL COMMENT '触发条件（JSON格式）',
  `actions` json NOT NULL COMMENT '执行动作（JSON格式）',
  `status` enum('enabled','disabled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'enabled' COMMENT '规则状态',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级（数字越大优先级越高）',
  `executionCount` int NOT NULL DEFAULT '0' COMMENT '执行次数',
  `last_execution_time` timestamp NULL DEFAULT NULL COMMENT '最后执行时间',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '规则描述',
  `created_by` int DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `automation_rules`
--

LOCK TABLES `automation_rules` WRITE;
/*!40000 ALTER TABLE `automation_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `automation_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_config`
--

DROP TABLE IF EXISTS `business_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` json NOT NULL,
  `config_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_89c11edca6a537915c846da659` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_config`
--

LOCK TABLES `business_config` WRITE;
/*!40000 ALTER TABLE `business_config` DISABLE KEYS */;
INSERT INTO `business_config` VALUES (1,'customer_intention_score_rules','{\"low\": {\"color\": \"info\", \"label\": \"低意向\", \"minScore\": 40}, \"high\": {\"color\": \"success\", \"label\": \"高意向\", \"minScore\": 80}, \"none\": {\"color\": \"danger\", \"label\": \"无意向\", \"minScore\": 0}, \"medium\": {\"color\": \"warning\", \"label\": \"中意向\", \"minScore\": 60}}','customer','客户意向评分规则：根据意向评分(0-100)自动判定意向等级','2025-11-13 16:27:53.743656','2025-11-13 16:27:53.743656'),(2,'ai_field_mapping','[{\"aiField\": \"customerProfile.wechatNickname\", \"dbField\": \"wechatNickname\", \"enabled\": true, \"overwrite\": false, \"description\": \"微信昵称（从聊天截图识别）\"}, {\"aiField\": \"customerProfile.parentRole\", \"dbField\": \"parentRole\", \"enabled\": true, \"overwrite\": true, \"description\": \"家长身份（妈妈/爸爸/爷爷奶奶）\"}, {\"aiField\": \"customerProfile.location\", \"dbField\": \"location\", \"enabled\": true, \"overwrite\": true, \"description\": \"所在地区/城市\"}, {\"aiField\": \"customerProfile.studentGrade\", \"dbField\": \"studentGrade\", \"enabled\": true, \"overwrite\": true, \"description\": \"学生年级\"}, {\"aiField\": \"customerProfile.studentAge\", \"dbField\": \"studentAge\", \"enabled\": true, \"overwrite\": true, \"description\": \"学生年龄\"}, {\"aiField\": \"customerProfile.familyEconomicLevel\", \"dbField\": \"familyEconomicLevel\", \"enabled\": true, \"overwrite\": true, \"description\": \"家庭经济水平（高/中/低）\"}, {\"aiField\": \"customerProfile.decisionMakerRole\", \"dbField\": \"decisionMakerRole\", \"enabled\": true, \"overwrite\": true, \"description\": \"决策者角色\"}, {\"aiField\": \"estimatedValue\", \"dbField\": \"estimatedValue\", \"enabled\": true, \"overwrite\": true, \"description\": \"预估成交金额\"}, {\"aiField\": \"qualityLevel\", \"dbField\": \"qualityLevel\", \"enabled\": true, \"overwrite\": true, \"description\": \"质量等级（A/B/C/D）\"}]','ai','AI字段映射配置：控制AI识别结果如何填充到数据库字段','2025-11-13 16:27:53.751255','2025-11-13 16:27:53.751255'),(35,'order_sync.enabled','\"true\"','business_rules','是否启用订单自动同步','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(36,'order_sync.sync_range_days','\"7\"','business_rules','订单同步时间范围（天）','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(37,'order_sync.auto_create_campus','\"true\"','business_rules','自动创建不存在的校区','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(38,'order_sync.sync_customer_info','\"true\"','business_rules','是否同步更新客户信息','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(39,'order_sync.cron_expression','\"0 */2 * * *\"','business_rules','定时同步Cron表达式（每2小时一次）','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(40,'default_values.customer_intent','\"中意向\"','default_values','新客户默认意向度','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247'),(41,'default_values.lifecycle_stage','\"线索\"','default_values','新客户默认生命周期','2025-11-14 20:10:58.869247','2025-11-14 20:10:58.869247');
/*!40000 ALTER TABLE `business_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus`
--

DROP TABLE IF EXISTS `campus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campus_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '校区名称',
  `campus_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '校区编码',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '校区地址',
  `contact_person` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `manager_id` int DEFAULT NULL COMMENT '校区负责人ID',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '校区描述',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_718326dbbecfdf8854521cc57f` (`campus_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus`
--

LOCK TABLES `campus` WRITE;
/*!40000 ALTER TABLE `campus` DISABLE KEYS */;
INSERT INTO `campus` VALUES (1,'海淀校区','HD001','北京市海淀区中关村大街1号','张校长','010-12345678',1,'海淀区旗舰校区',1,1,'2025-11-10 16:16:39.228438','2025-11-10 16:16:39.228438'),(2,'朝阳校区','CY001','北京市朝阳区建国路88号','李校长','010-23456789',1,'朝阳区分校',2,1,'2025-11-10 16:16:39.228438','2025-11-10 16:16:39.228438'),(3,'西城校区','XC001','北京市西城区金融街19号','王校长','010-34567890',1,'西城区分校',3,1,'2025-11-10 16:16:39.228438','2025-11-10 16:16:39.228438'),(4,'东城校区','DC001','北京市东城区王府井大街1号','赵校长','010-45678901',1,'东城区分校',4,1,'2025-11-10 16:16:39.228438','2025-11-10 16:16:39.228438');
/*!40000 ALTER TABLE `campus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_calculations`
--

DROP TABLE IF EXISTS `commission_calculations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_calculations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `scheme_id` int NOT NULL,
  `scheme_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_amount` decimal(10,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `calculation_rule` json NOT NULL,
  `sales_id` int NOT NULL,
  `status` enum('pending','paid','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `settle_time` datetime DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_ba1c5595d5ea0cc2ae37ee98ec1` (`order_id`),
  KEY `FK_9fb046d03697dad9b30b41a9c81` (`sales_id`),
  CONSTRAINT `FK_9fb046d03697dad9b30b41a9c81` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_ba1c5595d5ea0cc2ae37ee98ec1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_calculations`
--

LOCK TABLES `commission_calculations` WRITE;
/*!40000 ALTER TABLE `commission_calculations` DISABLE KEYS */;
/*!40000 ALTER TABLE `commission_calculations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_schemes`
--

DROP TABLE IF EXISTS `commission_schemes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_schemes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('fixed','percentage','tiered','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fixed',
  `priority` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `rules` json NOT NULL,
  `conditions` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_schemes`
--

LOCK TABLES `commission_schemes` WRITE;
/*!40000 ALTER TABLE `commission_schemes` DISABLE KEYS */;
INSERT INTO `commission_schemes` VALUES (1,'新签单提成-标准方案','percentage',100,1,NULL,'{\"percentage\": 5}','{\"orderTags\": [\"新签\"], \"minOrderAmount\": 0}',1,'2025-11-10 16:16:39.277036','2025-11-10 16:16:39.277036'),(2,'续费单提成-标准方案','percentage',90,1,NULL,'{\"percentage\": 3}','{\"orderTags\": [\"续费\"], \"minOrderAmount\": 0}',1,'2025-11-10 16:16:39.277036','2025-11-10 16:16:39.277036'),(3,'高额订单提成-阶梯方案','tiered',80,1,NULL,'{\"tiers\": [{\"maxAmount\": 10000, \"minAmount\": 0, \"percentage\": 4}, {\"maxAmount\": 20000, \"minAmount\": 10000, \"percentage\": 5}, {\"maxAmount\": null, \"minAmount\": 20000, \"percentage\": 6}]}','{\"minOrderAmount\": 0}',1,'2025-11-10 16:16:39.277036','2025-11-10 16:16:39.277036'),(4,'高考冲刺班-固定提成','fixed',100,1,NULL,'{\"amount\": 8}','{\"orderTags\": [\"normal\"]}',1,'2025-11-10 16:16:39.277036','2025-11-13 18:07:37.000000');
/*!40000 ALTER TABLE `commission_schemes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_follow_records`
--

DROP TABLE IF EXISTS `customer_follow_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_follow_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `follow_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `follow_time` datetime NOT NULL,
  `operator_id` int DEFAULT NULL COMMENT '操作员ID（AI自动创建时为NULL）',
  `next_follow_time` datetime DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_8c16c83e8e7215d7d3c01a2b432` (`customer_id`),
  CONSTRAINT `FK_8c16c83e8e7215d7d3c01a2b432` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_follow_records`
--

LOCK TABLES `customer_follow_records` WRITE;
/*!40000 ALTER TABLE `customer_follow_records` DISABLE KEYS */;
INSERT INTO `customer_follow_records` VALUES (97,1,'电话沟通，家长表示对数学培训很感兴趣，约定明天上门详谈','2025-11-08 16:16:39',4,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(98,1,'微信发送了课程介绍资料，家长表示很感兴趣','2025-11-09 16:16:39',4,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(99,3,'上门拜访，详细介绍了英语课程，家长很满意','2025-10-31 16:16:39',4,'2025-11-13 16:16:39','2025-11-10 16:16:39.248022'),(100,3,'电话回访试听效果，家长反馈孩子很喜欢','2025-11-02 16:16:39',4,'2025-11-12 16:16:39','2025-11-10 16:16:39.248022'),(101,3,'发送了优惠活动信息','2025-11-05 16:16:39',4,'2025-11-12 16:16:39','2025-11-10 16:16:39.248022'),(102,4,'电话沟通高考冲刺需求，家长很着急','2025-10-26 16:16:39',5,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(103,4,'带孩子来校区参观，介绍师资力量','2025-10-28 16:16:39',5,'2025-11-12 16:16:39','2025-11-10 16:16:39.248022'),(104,4,'发送了往届学员高考成绩单','2025-10-31 16:16:39',5,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(105,6,'电话商谈价格，家长觉得有点贵','2025-11-02 16:16:39',7,'2025-11-12 16:16:39','2025-11-10 16:16:39.248022'),(106,6,'申请了特殊优惠方案，等待审批','2025-11-04 16:16:39',7,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(107,6,'告知优惠已批准，家长表示会考虑','2025-11-06 16:16:39',7,'2025-11-13 16:16:39','2025-11-10 16:16:39.248022'),(108,7,'签约成功！报名初中数学精品班','2025-10-11 16:16:39',4,NULL,'2025-11-10 16:16:39.248022'),(109,7,'开课后回访，家长反馈孩子很适应','2025-10-21 16:16:39',4,NULL,'2025-11-10 16:16:39.248022'),(110,10,'电话邀约试听','2025-11-03 16:16:39',5,'2025-11-11 16:16:39','2025-11-10 16:16:39.248022'),(111,10,'第一次试听，孩子表现不错','2025-11-05 16:16:39',5,'2025-11-13 16:16:39','2025-11-10 16:16:39.248022'),(112,10,'第二次试听，家长很满意','2025-11-08 16:16:39',5,'2025-11-12 16:16:39','2025-11-10 16:16:39.248022'),(113,23,'【AI智能创建客户-聊天记录】\n\n以下是微信聊天截图的完整文字内容（含发送者、时间、消息，绿色气泡为“自己”发送，白色气泡为“对方”发送，保持对话顺序）：  \n\n\n### 7月14日 17:16  \n- **对方（白色气泡）**：我是kiki  \n- **自己（绿色气泡）**：  \n  快已被订阅，现在可以开始聊天了。  \n  哈喽小宝贝~我是隔壁班的becky~ 我们最近上新了很多课程 是想了解下课程详情吗~  \n\n\n### 7月14日 20:49  \n- **自己（绿色气泡）**：哈喽，小宝贝是想了解课程的类型吗？  \n\n\n### 7月14日 21:21  \n- **对方（白色气泡）**：浦东花木附近有什么课程？（推测“外教”为输入误差）  \n- **对方（白色气泡）**：（发送一张含多课程的图片）  \n- **自己（绿色气泡）**：我来啦小宝贝 课程很多~ 您可以看看有合适的戳出 我这边给您发课程介绍哦~  \n- **对方（白色气泡）**：位置在哪里？  \n- **对方（白色气泡）**：这个课程初中生抽上吗  \n- **自己（绿色气泡）**：可以上的，您这边是想了解哪些课程可以出来 我这边一个个发小程序链接给你  \n- **对方（白色气泡）**：具体地址看不到  \n\n\n### 7月14日 21:36  \n- **自己（绿色气泡）**：这里面所有课程的地址都不一样的~ 您这边对哪个课程感兴趣的话我单独发地址给你就好了呢  \n- **对方（白色气泡）**：漕河泾声乐 龙阳路有的羽毛球都可以（推测“有酶的”为输入误差）  \n- **对方（白色气泡）**：好滴 我找找  \n- **对方（白色气泡）**：（发送小程序卡片：**【1对1私教】上海浦东新区漕河泾站-声乐-4节课**，含声乐课程图）  \n\n\n### 7月14日 21:37  \n- **对方（白色气泡）**：（连续发送2个小程序卡片）  \n  ① **【4-6人班】上海浦东新区龙阳路-羽毛球-8节课**（含羽毛球场地图）  \n  ② **【3-8人班】上海浦东新区芳甸路站-羽毛球-8节课**（含羽毛球场地图）  \n\n\n### 7月14日 21:37（续）  \n- **自己（绿色气泡）**：这个不是私教哈，上面写了私教的是一对一上课时间，可上几节课自己选的哈~ 下面写了周课的是需要固定班人数才开课，上课时间是要老师协调的，可以买试听课程  \n- **对方（白色气泡）**：（发送一张含多课程的图片，标注“最后三项”）  \n- **对方（白色气泡）**：最后三项  \n\n\n### 7月14日 21:37（续）  \n- **自己（绿色气泡）**：课程地址都在上面了哈~ 你需要再选我们现在在做下单课程里可以免费1对1学的，活动今晚12点结束  \n- **对方（白色气泡）**：（连续发送3个小程序卡片）  \n  ① **【4-10人班】上海浦东新区东昌路站-声乐-10节课**（含教室图）  \n  ② **【2-6人班】上海浦东新区商城路站-声乐-6节课**（含钢琴教室图）  \n  ③ **【4-10人班】上海浦东新区商城路站-化妆-8节课**（含化妆课图）  \n\n\n### 7月14日 21:37（续）  \n- **自己（绿色气泡）**：这是您的最后三个课程，我这边比较推荐商城路的声乐课和美妆课，这两个课程学员的对比较多，好评也比较多。  \n\n\n### 7月14日 21:43  \n- **对方（白色气泡）**：（发送一张订单界面的图片）  \n- **对方（白色气泡）**：这个声乐课不是私人团吗？为什么还要拼单？  \n\n\n### 7月14日 21:43（续）  \n- **自己（绿色气泡）**：我这边帮你拼价，因为这个价格是需要凑到拼团数的  \n- **自己（绿色气泡）**：稍等，我现在在和对接（推测“对接人沟通”）  \n- **对方（白色气泡）**：等一下，怎么退？  \n- **对方（白色气泡）**：我想报高级班的吧（推测“报高级班课程”）  \n\n\n### 7月14日 21:43（续）  \n- **自己（绿色气泡）**：您在小程序的订单里面取消订单就行了  \n- **自己（绿色气泡）**：然后您这边重新拍需要的课程就好  \n\n\n### 7月14日 21:43（续）  \n- **对方（白色气泡）**：那商城路的我也想置换945那个？（推测“945”为课程编号/价格）  \n- **对方（白色气泡）**：还是要等人成团再单拍  \n\n\n### 7月14日 21:43（续）  \n- **自己（绿色气泡）**：对的  \n- **自己（绿色气泡）**：我这边帮你系统操作，你付过款就行了  \n\n\n### 7月14日 21:48  \n- **对方（白色气泡）**：OK  \n- **自己（绿色气泡）**：帮你（推测“帮你操作”）  \n- **对方（白色气泡）**：声乐课拍好了  \n\n\n### 7月14日 21:48（续）  \n- **自己（绿色气泡）**：好的，我现在去系统操作，稍等我一下~  \n- **自己（绿色气泡）**：小宝贝这边的订单编号是2025182（根据截图修正）  \n- **自己（绿色气泡）**：你选的**【1对1私教】上海浦东新区漕河泾站-声乐-4节课**（含课程图）  \n- **自己（绿色气泡）**：如果有问题找我谈一下，我让顾问优先帮你排课！  \n- **自己（绿色气泡）**：关于老师上课进度的问题，请问有问题是找我还是找顾问？  \n- **自己（绿色气泡）**：这边先加你，明天早上9点钟后，老师上班会通过微信联系您的  \n- **对方（白色气泡）**：（发送一张带二维码的图片，文字：*扫码进来拼课 拼课报名全返*）  \n\n\n（注：部分表述因截图模糊或输入误差，已结合语境合理推测修正，确保语义通顺。）\n\n---\n【AI分析摘要】\n意向等级：中意向\n客户需求：浦东花木附近课程、声乐培训、羽毛球课程\n下一步建议：确认订单状态、安排老师联系','2025-11-13 15:03:15',NULL,NULL,'2025-11-13 15:03:14.791213'),(114,24,'【AI智能创建客户-聊天记录】\n\n### 微信聊天记录（按时间顺序）  \n\n\n#### 7月4日 17:16  \n- **用户（头像）**：我是kiki  \n- **顾问（绿色气泡）**：好的我已收到，现在可以开始聊了。  \n- **顾问（绿色气泡）**：哈喽呀小宝贝~我是卿球类的becky~ 我们最近上新了很多课程，是想了解下课程详情吗~  \n\n\n#### 7月4日 20:49  \n- **顾问（绿色气泡）**：哈喽，小宝贝是想了解啥课程的呀？  \n\n\n#### 7月4日 21:21  \n- **用户（头像）**：蒲公英水榭有没有什么补救？  \n- （用户发送**课程列表图片**）  \n- **顾问（绿色气泡）**：我来啦小宝贝 课程来咯~ 您可以看看有合适的戳出，我这边给您发课程介绍哦~  \n- **用户（头像）**：位置在哪里？  \n- **用户（头像）**：这个课程初中生抽上吗  \n- **顾问（绿色气泡）**：可以上的，您这边是想了解哪些课程可以出来，我这边一个个发小程序链接给你哈  \n- **用户（头像）**：具体地址看不到  \n\n\n#### 7月4日 21:36  \n- **顾问（绿色气泡）**：这里面所有课程的地址都不一样的~ 您这边对哪个课程感兴趣的，我单独发地址给你就好了哈  \n- **用户（头像）**：漕河泾声乐、龙阳路有舞蹈的羽毛球都可以  \n- **用户（头像）**：好滴 我找找  \n- （用户发送**3个小程序卡片**：  \n  1. 【4人团购】上海浦东新区漕河泾站-声乐-4节惯（含“声乐”课程图片）  \n  2. 【4-6人团】上海浦东新区龙阳路-羽毛球-8节惯（含羽毛球馆图片）  \n  3. 【3-4人团】上海浦东新区芳甸路站-羽毛球-8节惯（含羽毛球场地图片）  \n\n\n#### 7月4日 21:37  \n- （用户再次发送**3个小程序卡片**：  \n  1. 【4人团购】上海浦东新区漕河泾站-声乐-4节惯（声乐课程图片）  \n  2. 【4-6人团】上海浦东新区龙阳路-羽毛球-8节惯（羽毛球馆图片）  \n  3. 【3-4人团】上海浦东新区芳甸路站-羽毛球-8节惯（羽毛球场地图片）  \n- **顾问（绿色气泡）**：这个声乐课不是私人群团~ 上面写了私教的是一对一上课的哦，可组团，也可自己预约排课。下面写了团课课时，不同价格哈~ 上面的价格是主课，下面可优惠的是满减、满员（最大数才开课），上课时间是要专属顾问帮预约的，可以买完课直接…  \n- **用户（头像）**：（发送**课程列表图片**）  \n- **用户（头像）**：最后三项  \n\n\n#### 7月4日 21:37（续）  \n- （顾问发送**3个小程序卡片**：  \n  1. 【4-10人团】上海浦东新区东昌路站-声乐-10节惯（声乐教室图片）  \n  2. 【2-12人团】上海浦东新区商城路站-声乐-6节惯（多人声乐课图片）  \n  3. 【4-10人团】上海浦东新区商城路站-化妆-8节惯（化妆课图片）  \n- **顾问（绿色气泡）**：这是您说的那最后三个课程，我这边比较推荐商城路站化妆课（学员对比多、好评也比较多）。  \n\n\n#### 7月4日 21:43  \n- **用户（头像）**：（发送**小程序订单图片**）  \n- **用户（头像）**：这个声乐课不是私人群团？为什么还要拼单？  \n- **顾问（绿色气泡）**：我这边帮你拼价，因为这个价格是需要凑到操作团的  \n- **顾问（绿色气泡）**：稍等，我现在都在对接  \n- **用户（头像）**：等一下，怎么退？  \n- **用户（头像）**：我想高级班的吧  \n- **顾问（绿色气泡）**：您在小程序的订单里面取消订单就行了  \n- **顾问（绿色气泡）**：然后您这边重新拍高级的课就好  \n- **用户（头像）**：那商城路的我也是直接拍49的那个？  \n- **用户（头像）**：还是要等人、成团再拍  \n- **顾问（绿色气泡）**：对的  \n- **顾问（绿色气泡）**：我这边帮你系统操作，你付过款就行了  \n\n\n#### 7月4日 21:48  \n- **用户（头像）**：OK  \n- **顾问（绿色气泡）**：好的，我现在去系统操作，稍等一下~  \n- **顾问（绿色气泡）**：小宝贝这边的订单编号是2025162，你记一下哈  \n- **顾问（绿色气泡）**：这是我的专属课程顾问（附课程顾问名片/图片）  \n- **顾问（绿色气泡）**：你加下她哦~ 我让顾问优先帮你排课！  \n- **顾问（绿色气泡）**：如果和我线下课、预约时间的，她也会提醒我  \n- **顾问（绿色气泡）**：您这边加她，明天早上9点钟后，老师上班会通过您的申请的  \n- （顾问发送**图片**，含二维码和文字“扫码找我排课 课程体验官”）  \n\n\n（注：对话中“用户（头像）”为左侧头像发送的消息，“顾问（绿色气泡）”为右侧绿色气泡发送的消息，图片/小程序卡片的描述保留发送行为。）\n\n---\n【AI分析摘要】\n意向等级：中意向\n客户需求：初中生适用的声乐和羽毛球课程、明确课程地址和上课机制\n下一步建议：跟进专属顾问添加状态、确认高级班课程安排并推送链接','2025-11-13 15:31:09',NULL,NULL,'2025-11-13 15:31:08.913144'),(115,25,'【AI智能创建客户-聊天记录】\n\n### 聊天记录（微信账号：VIP250714）\n\n#### 7月14日17:16  \n- 用户（头像）：我是kiki  \n- 客服（绿色框消息）：kiki您好呀，我是隔壁校区的becky 我们最近上新了很多课程 是想了解下课程详情吗~  \n\n\n#### 7月14日20:49  \n- 客服（绿色框消息）：kiki，小宝贝是想了解啥课程呢吗？  \n\n\n#### 7月14日21:21  \n- 用户（头像）：浦东花木附近有拿什么舞校？（推测为“有什么课程/舞校”输入误差）  \n- 客服（绿色框消息）：我来啦小宝贝 课程很多 您可以看看有合适的戳出 我这边给您发课程介绍哦~  \n- 用户（头像）：街舞在哪里？  \n- 用户（头像）：这个课程初中生抽上吗  \n- 客服（绿色框消息）：可以上的，您这边是想了解哪些课程可以出来 我这边一个个发小程序链接给你  \n- 用户（头像）：具体地址看不到  \n\n\n#### 7月14日21:36  \n- 客服（绿色框消息）：这里面所有课程的地址都不一样的 您这边对哪个课程感兴趣的话我单独发地址给你就好了呢  \n- 用户（头像）：漕河泾声乐 龙阳路有嘛的羽毛球都可以  \n- 用户（头像）：好滴 我发您  \n- 用户（头像）发送小程序卡片：【1对1私教】上海浦东新区漕河泾站-声乐-4节课（小程序）  \n- 用户（头像）发送小程序卡片：【4-6人班】上海浦东新区龙阳路-羽毛球-8节课（小程序）  \n- 用户（头像）发送小程序卡片：【3-8人班】上海浦东新区芳甸路站-羽毛球-8节课（小程序）  \n\n\n#### 7月14日21:37  \n- 用户（头像）发送小程序卡片：【14人班】上海浦东新区龙阳路-羽毛球-8节课（小程序）  \n- 用户（头像）发送小程序卡片：【3-8人班】上海浦东新区芳甸路站-羽毛球-8节课（小程序）  \n- 客服（绿色框消息）：这个小程序是私教，上面写了私教的一对一上课时间，可自行给固定已安排的排主，下面可团课的是需要满足最低人数才开课，上课时间是要老师协调预约的，可以灵活调整  \n- 用户（头像）发送课程列表截图  \n- 用户（头像）：最后三项  \n- 客服（绿色框消息）：课程地址都在上面了哦，你需要哪些课 我们现在在做个重点型号可以免费10万学员的，活动 今晚12点结束  \n- 用户（头像）发送小程序卡片：【14人班】上海浦东新区东昌路站-声乐-10节课（小程序）  \n- 用户（头像）发送小程序卡片：【2-8人团】上海浦东新区张杨路站-声乐-8节课（小程序）  \n- 用户（头像）发送小程序卡片：【4-6人班】上海浦东新区商城路站-化妆-8节课（小程序）  \n- 客服（绿色框消息）：这是您说的那最后三个课程，我这边比较推荐南城化妆课比较多的，这个课程学员的对比表多，好评也比较多。  \n\n\n#### 7月14日21:43  \n- 用户（头像）发送订单截图  \n- 用户（头像）：这个声乐课不是私人团吗？为什么还要拼单？  \n- 客服（绿色框消息）：我这边帮你拼团，因为这个价格是需要团操作做的  \n- 客服（绿色框消息）：稍等，我现在帮您对接  \n- 用户（头像）：等一下，怎么退？  \n- 用户（头像）：我想换个课程的吧（输入误差，推测为“换个课程”）  \n- 客服（绿色框消息）：您在小程序的订单里面取消订单就行了  \n- 客服（绿色框消息）：然后您这边重新拍需要的课程就好  \n- 用户（头像）：那南城的我也想换49的那个？  \n- 用户（头像）：还是等满人 成团再拍  \n- 客服（绿色框消息）：对的  \n- 客服（绿色框消息）：我这边帮你系统操作， 来你这边就行了  \n\n\n#### 7月14日21:48  \n- 用户（头像）：OK  \n- 客服（绿色框消息）：好的，我现在去系统操作， 稍等一下~  \n- 客服（绿色框消息）：声乐课拍好了  \n- 客服（绿色框消息）：好的，我现在去系统操作， 稍等一下~  \n- 客服（绿色框消息）：小宝贝这边的订单编号是2025162  \n- 客服（绿色框消息）：这是我们的专属课程顾问 你加一下哦  \n- 客服（绿色框消息）：如果问她一下， 我让顾问优先帮你排课！  \n- 客服（绿色框消息）：这个和我说一下， 就说顾问让， 她会优先给你排（修正输入误差后）  \n- 客服（绿色框消息）：这边加她，明天早上9点钟后， 老师上班会发微信给她的  \n- 用户（头像）发送带二维码的图，内容：**扫码进来拼课 拼课成功立减全返 详情请戳客服**  \n\n\n（注：小程序卡片内容为课程名称+地点+课时，如“【1对1私教】上海浦东新区漕河泾站-声乐-4节课”等，对话中已保留核心信息；部分口语化输入误差已做合理推测修正，确保语义通顺。）\n\n---\n【AI分析摘要】\n意向等级：中意向\n客户需求：浦东花木附近课程、初中生适合的街舞课程、声乐和羽毛球课程\n下一步建议：跟进课程顾问对接排课、确认换课操作完成','2025-11-13 15:39:33',NULL,NULL,'2025-11-13 15:39:32.615061'),(116,26,'【AI智能创建客户-聊天记录】\n\n### 微信聊天记录（用户：VIP250714 的聊天窗口）  \n\n\n#### 7月4日 17:16  \n- （左侧头像用户）：我是kiki  \n- （绿色消息，客服）：快已经6点了，现在可以开始聊了。  \n  哈喽小宇~我是隔壁校区的kicky 我们最近上新了很多课程 是想了解下课程详情吗~  \n\n\n#### 7月4日 20:49  \n- （左侧头像用户）：哈喽，小宇如果是想了解课程的话吗？  \n\n\n#### 7月4日 21:21  \n- （左侧头像用户）：浦东花木附近有什么外教？  \n- （绿色消息，客服）：我来啦小宇 课程很多 您可以看看有合适的戳出 我这边给您发课程介绍哦~  \n- （左侧头像用户）：位置在哪里？  \n- （绿色消息，客服）：这个课程初中击上吗  \n- （左侧头像用户）：具体地址看不到  \n\n\n#### 7月4日 21:36  \n- （绿色消息，客服）：这里面所有课程的地址都不一样的 您这边对哪个课程感兴趣的话我单独发地址给你就好了呢  \n- （左侧头像用户）：漕河泾声乐 龙阳路有胸的羽毛球可以  \n- （绿色消息，客服）：好滴 我找找  \n- （客服发送小程序卡片）：**尚游体育GO** 【1对1私教】上海浦东新区漕河泾站-声乐-4节课（附声乐课程图片）  \n\n\n#### 7月4日 21:37  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-6人班】上海浦东新区龙阳路-羽毛球-8节课（附羽毛球场地图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【3-8人班】上海浦东新区芳甸路站-羽毛球-8节课（附羽毛球网图片）  \n- （绿色消息，客服）：这个声乐课不是私教哈，上面写了私教的是一对一上课时间，可根据自己的安排去，下面写了团课的是需要满足最低人数才开课，上课时间是要老师协调的，可以买完课查看  \n- （左侧头像用户）：（发送课程列表截图）  \n- （左侧头像用户）：最后三项  \n\n\n#### （续7月4日 21:37后）  \n- （绿色消息，客服）：课程地址都在上面了哈，你需要再给我现在在的这个课程里可以免费试听7天学的，活动今晚12点结束  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-10人班】上海浦东新区东昌路站-声乐-10节课（附教室图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【2-6人团】上海浦东新区商城路站-声乐-6节课（附钢琴课图片）  \n- （客服发送小程序卡片）：**尚游体育GO** 【4-10人班】上海浦东新区商城路站-化妆-8节课（附化妆课图片）  \n- （绿色消息，客服）：这是您说的那最后三个课程，我这边比较推荐声乐和化妆课比较好，这个课程学员的对比表多，好评也比较多。  \n\n\n#### 7月4日 21:43  \n- （左侧头像用户）：（发送小程序界面截图）  \n- （左侧头像用户）：这个声乐课不是私人团？为什么还要团单？  \n- （绿色消息，客服）：我这边帮你问价，因为这个价格是需要团课作 做的  \n- （绿色消息，客服）：稍等，我现在都在对接  \n- （左侧头像用户）：等一下，怎么退？  \n- （左侧头像用户）：我想高级点的吧  \n- （绿色消息，客服）：您在小程序的订单里面取消订单就行了  \n- （绿色消息，客服）：然后您这边重新拍需要的课程就好  \n- （左侧头像用户）：那南城的我也选最缺的49那个？  \n- （左侧头像用户）：还是要等人 成团再单搞  \n- （绿色消息，客服）：对的  \n- （绿色消息，客服）：我这边帮你系统操作，你付过款就行了  \n\n\n#### 7月4日 21:48  \n- （左侧头像用户）：OK  \n- （绿色消息，客服）：帮你  \n- （左侧头像用户）：声乐课拍好了  \n- （绿色消息，客服）：好的，我现在去系统操作，稍等一下~  \n- （绿色消息，客服）：小宇您这边的订单编号是2025162 你记一下哈  \n- （绿色消息，客服）：这是咱们的专属课程顾问 你加一下哈  \n  如有问题找一下 顾问问优先帮你排课！  \n  如不和我挑选上，我让顾问问他，他问他还是找我  \n- （绿色消息，客服）：这边先加她，明天早上9点钟后，老师上班会通过 您咨询的哈  \n- （客服发送图片）：（图片文字：*扫码找我排课* *课程报名咨询*，带二维码）  \n\n\n（注：部分消息存在输入笔误，如“有胸的”应为“有场地的”、“初中击上”应为“初中生能上”等，已按截图原文还原。）\n\n---\n【AI分析摘要】\n意向等级：中意向\n客户需求：浦东花木附近的外教课程、声乐和羽毛球课程、明确的课程地址信息\n下一步建议：课程顾问及时跟进排课、确认具体上课时间和地点','2025-11-13 15:44:44',NULL,NULL,'2025-11-13 15:44:43.645903');
/*!40000 ALTER TABLE `customer_follow_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_lifecycle`
--

DROP TABLE IF EXISTS `customer_lifecycle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_lifecycle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `stage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_reason` text COLLATE utf8mb4_unicode_ci,
  `operator_id` int NOT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_lifecycle`
--

LOCK TABLES `customer_lifecycle` WRITE;
/*!40000 ALTER TABLE `customer_lifecycle` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_lifecycle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wechat_nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wechat_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `traffic_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `traffic_platform` enum('小红书','抖音','视频号') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源平台',
  `traffic_city` enum('广州','上海','深圳','北京') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源城市',
  `operator_id` int DEFAULT NULL COMMENT '引流运营人员ID',
  `sales_id` int NOT NULL,
  `sales_wechat` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_intent` enum('高意向','中意向','低意向','无意向') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '中意向',
  `lifecycle_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '线索',
  `next_follow_time` datetime DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `student_grade` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学生年级',
  `student_age` int DEFAULT NULL COMMENT '学生年龄',
  `family_economic_level` enum('高','中','低') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '家庭经济水平',
  `decision_maker_role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '决策角色',
  `parent_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '家长身份',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所在地区',
  `estimated_value` decimal(10,2) DEFAULT NULL COMMENT '预估成交金额',
  `quality_level` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI评估质量等级',
  `ai_profile` json DEFAULT NULL COMMENT 'AI分析的客户画像（需求、痛点、兴趣等）',
  `last_ai_analysis_time` datetime DEFAULT NULL COMMENT '最后一次AI分析时间',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `ai_processing_status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI识别处理状态：pending-待处理，processing-识别中，completed-已完成，failed-失败',
  `ai_processing_error` text COLLATE utf8mb4_unicode_ci COMMENT 'AI识别失败原因',
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '性别',
  `age` int DEFAULT NULL COMMENT '年龄',
  `intent_product` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '意向产品',
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '客户来源',
  `tags` json DEFAULT NULL COMMENT '客户标签',
  `estimated_amount` decimal(10,2) DEFAULT NULL COMMENT '预计成交金额',
  `department_id` int DEFAULT NULL COMMENT '部门ID',
  `campus_id` int DEFAULT NULL COMMENT '校区ID',
  `pain_points` json DEFAULT NULL COMMENT '客户痛点（从所有聊天记录中聚合提取）',
  `interest_points` json DEFAULT NULL COMMENT '客户兴趣点（从所有聊天记录中聚合提取）',
  `need_keywords` json DEFAULT NULL COMMENT '需求关键词列表',
  `external_order_ids` json DEFAULT NULL COMMENT '关联的外部订单ID列表，如["20227343","20228888"]',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_59cc4ef31a34135ef896f1f1e2` (`wechat_id`),
  KEY `FK_81ce3f2891dcaf93f1b02fef5b8` (`sales_id`),
  KEY `FK_ac3d43d09dbba144ccf2036284c` (`department_id`),
  KEY `FK_1a66c91d94440ccae074001ec9e` (`campus_id`),
  CONSTRAINT `FK_1a66c91d94440ccae074001ec9e` FOREIGN KEY (`campus_id`) REFERENCES `campus` (`id`),
  CONSTRAINT `FK_81ce3f2891dcaf93f1b02fef5b8` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_ac3d43d09dbba144ccf2036284c` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'阳光少年','wx_zhangsan','13900000001','张三妈妈','线上广告','抖音','北京',NULL,4,NULL,'中意向','线索','2025-11-11 16:16:39','家长对数学培训很感兴趣','初中',13,'中','单独决策','家长','上海浦东花木/龙阳路附近',3000.00,'B','{\"needs\": [\"浦东花木附近外教课程\", \"初中生适合的课程\", \"声乐和羽毛球课程\", \"高级别课程\"], \"mindset\": \"观望\", \"urgency\": \"中\", \"interests\": [\"声乐课程\", \"羽毛球课程\", \"一对一私教\", \"高级课程\"], \"objections\": [\"为什么私教课还要拼单\", \"退课流程复杂\", \"等待成团时间不确定\"], \"painPoints\": [\"课程地址不明确\", \"拼团等待时间\", \"课程级别不够高\", \"退课流程不熟悉\"], \"trustLevel\": \"中\", \"competitors\": [], \"emotionalTone\": \"中立\", \"estimatedCycle\": \"短期（1周内）\", \"dealOpportunity\": \"中\"}','2025-11-10 17:20:49','2025-11-10 16:16:39.241801','2025-11-13 13:21:39.909920',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'快乐学习','wx_lisi','13900000002','李四爸爸','老客户推荐','小红书','北京',NULL,5,NULL,'中意向','线索','2025-11-12 16:16:39','朋友推荐过来咨询','初三',15,'中',NULL,'爸爸','北京市朝阳区',10000.00,'B',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.909920',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'好好学习','wx_wangwu','13900000003','王五妈妈','线下活动','抖音','北京',NULL,4,NULL,'高意向','意向','2025-11-13 16:16:39','已经试听一次，反馈很好','四年级',10,'高',NULL,'妈妈','北京市西城区',15000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'天天向上','wx_zhaoliu','13900000004','赵六家长','自然到店',NULL,'北京',NULL,5,NULL,'高意向','意向','2025-11-12 16:16:39','准备高考，需要冲刺辅导','高三',16,'高',NULL,'妈妈','北京市海淀区',25000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'聪明宝宝','wx_sunqi','13900000005','孙七妈妈','朋友圈广告','视频号','北京',NULL,6,NULL,'中意向','报价','2025-11-13 16:16:39','已发送报价单，等待确认','三年级',8,'中',NULL,'妈妈','北京市朝阳区',9000.00,'B',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.909920',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'未来之星','wx_zhouba','13900000006','周八爸爸','线上广告','抖音','北京',NULL,7,NULL,'高意向','谈判','2025-11-12 16:16:39','正在商谈优惠方案','初二',14,'高',NULL,'爸爸','北京市东城区',22000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'学霸养成','wx_wujiu','13900000007','吴九家长','老客户推荐','小红书','北京',NULL,4,NULL,'高意向','成交',NULL,'已报名初中数学精品班','初一',13,'高',NULL,'爸爸','北京市海淀区',16000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'优等生','wx_zhengshi','13900000008','郑十家长','自然到店',NULL,'北京',NULL,5,NULL,'高意向','成交',NULL,'已报名高三冲刺班','高三',17,'高',NULL,'妈妈','北京市西城区',28000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'努力学','wx_chenshier','13900000010','陈十二','线上广告','抖音','北京',NULL,4,NULL,'中意向','线索','2025-11-11 16:16:39','刚咨询，待跟进','三年级',9,'中',NULL,'妈妈','北京市海淀区',9000.00,'B',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.909920',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'好学生','wx_weishisan','13900000011','卫十三','老客户推荐','小红书','北京',NULL,5,NULL,'高意向','意向','2025-11-12 16:16:39','已试听两次，意向强烈','初三',15,'高',NULL,'爸爸','北京市朝阳区',20000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'学习王','wx_jiangshisi','13900000012','蒋十四','自然到店',NULL,'北京',NULL,7,NULL,'高意向','报价','2025-11-11 16:16:39','已发报价，准备签约','高二',16,'中',NULL,'妈妈','北京市西城区',14000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'拼搏者','wx_yangshiliu','13900000014','杨十六','线上广告','抖音','北京',NULL,4,NULL,'高意向','成交',NULL,'已报名高考全科冲刺','高三',17,'高',NULL,'妈妈','北京市海淀区',32000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'学习小达人','wx_heershi','13900000018','何二十','线上广告','视频号','北京',NULL,5,NULL,'高意向','成交',NULL,'已报名小学全科班','五年级',12,'中',NULL,'爸爸','北京市朝阳区',13000.00,'A',NULL,NULL,'2025-11-10 16:16:39.241801','2025-11-13 13:21:39.904639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,NULL,'11',NULL,'家长',NULL,NULL,NULL,NULL,1,NULL,'中意向','方案沟通',NULL,'AI分析完成\n\n【客户需求】\n浦东花木附近课程\n声乐培训\n羽毛球课程\n初中生适用课程\n明确课程地址\n\n【下一步建议】\n确认订单状态\n安排老师联系\n跟进课程安排\n提供后续课程推荐','初中',13,'中','单独决策','家长','上海浦东花木附近',3000.00,'B','\"{\\\"needs\\\":[\\\"浦东花木附近课程\\\",\\\"声乐培训\\\",\\\"羽毛球课程\\\",\\\"初中生适用课程\\\",\\\"明确课程地址\\\"],\\\"painPoints\\\":[\\\"课程地址不清晰\\\",\\\"拼团机制复杂\\\",\\\"课程类型混淆\\\"],\\\"objections\\\":[\\\"拼团机制不理解\\\",\\\"课程类型混淆\\\",\\\"退款流程\\\"],\\\"nextSteps\\\":[\\\"确认订单状态\\\",\\\"安排老师联系\\\",\\\"跟进课程安排\\\",\\\"提供后续课程推荐\\\"],\\\"salesStrategy\\\":\\\"重点维护已成交客户，提供优质服务建立信任，适时推荐商城路声乐和美妆课程，利用拼团优惠促进复购\\\",\\\"riskFactors\\\":[\\\"拼团机制理解不足\\\",\\\"课程类型混淆\\\"]}\"','2025-11-13 15:03:15','2025-11-13 15:01:25.424236','2025-11-13 15:03:14.000000','completed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,NULL,'22',NULL,'家长',NULL,NULL,NULL,NULL,1,NULL,'中意向','方案沟通',NULL,'AI分析完成\n\n【客户需求】\n初中生适用的声乐和羽毛球课程\n明确课程地址和上课机制\n\n【下一步建议】\n跟进专属顾问添加状态\n确认高级班课程安排并推送链接','初中',13,'中','单独决策','家长','上海浦东新区',2000.00,'B','\"{\\\"needs\\\":[\\\"初中生适用的声乐和羽毛球课程\\\",\\\"明确课程地址和上课机制\\\"],\\\"painPoints\\\":[\\\"课程地址信息不清晰\\\",\\\"拼团规则复杂导致混淆\\\"],\\\"objections\\\":[\\\"对拼团必要性存疑\\\",\\\"担心退款流程\\\"],\\\"nextSteps\\\":[\\\"跟进专属顾问添加状态\\\",\\\"确认高级班课程安排并推送链接\\\"],\\\"salesStrategy\\\":\\\"聚焦简化拼团流程解释，提供清晰地址信息，强化课程价值与排课便利性，利用专属顾问服务提升信任和成交效率。\\\",\\\"riskFactors\\\":[\\\"客户可能因拼团复杂而放弃\\\"]}\"','2025-11-13 15:31:09','2025-11-13 15:29:08.421658','2025-11-13 15:31:08.000000','completed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,NULL,'44',NULL,'家长',NULL,NULL,NULL,NULL,1,NULL,'中意向','方案沟通',NULL,'AI分析完成\n\n【客户需求】\n浦东花木附近课程\n初中生适合的街舞课程\n声乐和羽毛球课程\n\n【下一步建议】\n跟进课程顾问对接排课\n确认换课操作完成\n提供更多课程推荐','初中',13,'中','单独决策','家长','上海浦东',3000.00,'B','\"{\\\"needs\\\":[\\\"浦东花木附近课程\\\",\\\"初中生适合的街舞课程\\\",\\\"声乐和羽毛球课程\\\"],\\\"painPoints\\\":[\\\"课程地址不明确\\\",\\\"团课拼单流程复杂\\\",\\\"课程选择困难\\\"],\\\"objections\\\":[\\\"声乐课为何需要拼单\\\",\\\"换课流程不清晰\\\"],\\\"nextSteps\\\":[\\\"跟进课程顾问对接排课\\\",\\\"确认换课操作完成\\\",\\\"提供更多课程推荐\\\"],\\\"salesStrategy\\\":\\\"聚焦客户已下单声乐课，快速完成换课和排课，利用拼团优惠增强粘性，后续推荐同类课程提升客单价\\\",\\\"riskFactors\\\":[\\\"换课可能导致订单取消\\\",\\\"拼团不成影响体验\\\"]}\"','2025-11-13 15:39:33','2025-11-13 15:37:14.391014','2025-11-13 15:39:32.000000','completed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,NULL,'55',NULL,'家长',NULL,NULL,NULL,NULL,1,NULL,'中意向','方案沟通',NULL,'AI分析完成\n\n【客户需求】\n浦东花木附近的外教课程\n声乐和羽毛球课程\n明确的课程地址信息\n\n【下一步建议】\n课程顾问及时跟进排课\n确认具体上课时间和地点\n提供课程准备指导','初中',13,'中','单独决策','家长','上海浦东',3000.00,'B','\"{\\\"needs\\\":[\\\"浦东花木附近的外教课程\\\",\\\"声乐和羽毛球课程\\\",\\\"明确的课程地址信息\\\"],\\\"painPoints\\\":[\\\"课程地址信息不清晰\\\",\\\"团课需要等待成团\\\",\\\"对课程形式理解有困惑\\\"],\\\"objections\\\":[\\\"为什么声乐课需要团单\\\",\\\"退款流程复杂\\\",\\\"等待成团时间不确定\\\"],\\\"nextSteps\\\":[\\\"课程顾问及时跟进排课\\\",\\\"确认具体上课时间和地点\\\",\\\"提供课程准备指导\\\"],\\\"salesStrategy\\\":\\\"重点跟进已购声乐课程的后续服务，建立信任后推荐更高级别的私教课程，解决客户对团课的顾虑\\\",\\\"riskFactors\\\":[\\\"对团课形式接受度不高\\\",\\\"可能寻求更高级别的私教课程\\\"]}\"','2025-11-13 15:44:44','2025-11-13 15:43:05.081802','2025-11-13 15:44:43.000000','completed',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门名称',
  `parent_id` int DEFAULT NULL COMMENT '上级部门ID',
  `manager_id` int DEFAULT NULL COMMENT '部门负责人ID',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '部门描述',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'销售部',NULL,1,'负责市场销售和客户开发',1,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935'),(2,'市场部',NULL,1,'负责市场推广和品牌建设',2,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935'),(3,'教学部',NULL,1,'负责教学管理和师资培训',3,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935'),(4,'客服部',NULL,1,'负责客户服务和售后支持',4,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935'),(5,'销售一组',1,2,'销售部第一组',1,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935'),(6,'销售二组',1,3,'销售部第二组',2,1,'2025-11-10 16:16:39.222935','2025-11-10 16:16:39.222935');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dictionary`
--

DROP TABLE IF EXISTS `dictionary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dictionary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dict_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型',
  `dict_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典标签',
  `dict_value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典值',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dictionary`
--

LOCK TABLES `dictionary` WRITE;
/*!40000 ALTER TABLE `dictionary` DISABLE KEYS */;
INSERT INTO `dictionary` VALUES (1,'customer_intent','高','高',1,1,NULL,'2025-11-10 14:14:59.299964','2025-11-10 14:14:59.299964'),(2,'customer_intent','中','中',2,1,NULL,'2025-11-10 14:14:59.310787','2025-11-10 14:14:59.310787'),(3,'customer_intent','低','低',3,1,NULL,'2025-11-10 14:14:59.318857','2025-11-10 14:14:59.318857'),(4,'traffic_source','抖音','抖音',1,1,NULL,'2025-11-10 14:14:59.325964','2025-11-10 14:14:59.325964'),(5,'traffic_source','微信','微信',2,1,NULL,'2025-11-10 14:14:59.336271','2025-11-10 14:14:59.336271'),(6,'traffic_source','朋友圈','朋友圈',3,1,NULL,'2025-11-10 14:14:59.347519','2025-11-10 14:14:59.347519'),(7,'traffic_source','线下','线下',4,1,NULL,'2025-11-10 14:14:59.355435','2025-11-10 14:14:59.355435'),(8,'traffic_source','其他','其他',5,1,NULL,'2025-11-10 14:14:59.363556','2025-11-10 14:14:59.363556'),(9,'order_status','待付款','pending',1,1,NULL,'2025-11-10 14:14:59.370752','2025-11-10 14:14:59.370752'),(10,'order_status','已付款','paid',2,1,NULL,'2025-11-10 14:14:59.377679','2025-11-10 14:14:59.377679'),(11,'order_status','已完成','completed',3,1,NULL,'2025-11-10 14:14:59.384500','2025-11-10 14:14:59.384500'),(12,'order_status','已退款','refunded',4,1,NULL,'2025-11-10 14:14:59.392204','2025-11-10 14:14:59.392204');
/*!40000 ALTER TABLE `dictionary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enterprise_basic_info`
--

DROP TABLE IF EXISTS `enterprise_basic_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enterprise_basic_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `industry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所属行业',
  `company_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '企业名称',
  `company_intro` text COLLATE utf8mb4_unicode_ci COMMENT '企业介绍',
  `founding_year` int DEFAULT NULL COMMENT '成立年份',
  `company_scale` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公司规模',
  `contact_info` json DEFAULT NULL COMMENT '联系方式(电话、地址、官网等)',
  `core_advantages` text COLLATE utf8mb4_unicode_ci COMMENT '核心优势',
  `success_cases` text COLLATE utf8mb4_unicode_ci COMMENT '成功案例',
  `certifications` json DEFAULT NULL COMMENT '资质证书列表',
  `industry_knowledge` text COLLATE utf8mb4_unicode_ci COMMENT '行业知识/趋势',
  `competitor_analysis` text COLLATE utf8mb4_unicode_ci COMMENT '竞品分析',
  `customer_faq` json DEFAULT NULL COMMENT '客户常见问答列表[{q,a}]',
  `input_method` enum('manual','file_upload','ai_generate') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '录入方式',
  `is_completed` tinyint NOT NULL DEFAULT '0' COMMENT '是否完成首次创建',
  `completion_step` int NOT NULL DEFAULT '0' COMMENT '完成到第几步(1-4)',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterprise_basic_info`
--

LOCK TABLES `enterprise_basic_info` WRITE;
/*!40000 ALTER TABLE `enterprise_basic_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `enterprise_basic_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enterprise_knowledge_base`
--

DROP TABLE IF EXISTS `enterprise_knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enterprise_knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识标题/问题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '知识内容/答案',
  `keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关键词(逗号分隔)',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级(0-100)',
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI生成的摘要',
  `scene_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '场景分类:首次沟通|产品介绍|价格咨询|异议处理|售后服务|其他',
  `product_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '产品分类:产品ID或分类名',
  `customer_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '客户类型:新客|老客|高意向|中意向|低意向',
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '问题类型:产品问题|价格问题|服务问题|效果问题|师资问题|其他',
  `relevance_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'AI相关度评分(0-100)',
  `quality_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '内容质量评分(0-100)',
  `usage_count` int NOT NULL DEFAULT '0' COMMENT '使用次数',
  `positive_feedback_count` int NOT NULL DEFAULT '0' COMMENT '正反馈次数',
  `negative_feedback_count` int NOT NULL DEFAULT '0' COMMENT '负反馈次数',
  `last_used_time` datetime DEFAULT NULL COMMENT '最后使用时间',
  `source_type` enum('manual','ai_mining','industry_recommend','file_import') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '来源类型',
  `source_id` int DEFAULT NULL COMMENT '来源记录ID(如chat_record_id)',
  `creator_id` int DEFAULT NULL COMMENT '创建人ID',
  `related_product_ids` json DEFAULT NULL COMMENT '关联的产品ID列表',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `status` enum('active','inactive','pending_review','auto_disabled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态',
  PRIMARY KEY (`id`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_status` (`status`),
  KEY `idx_question_type` (`question_type`),
  KEY `idx_customer_type` (`customer_type`),
  KEY `idx_product_category` (`product_category`),
  KEY `idx_scene_category` (`scene_category`),
  KEY `idx_ekb_status` (`status`),
  KEY `idx_ekb_scene_category` (`scene_category`),
  KEY `idx_ekb_product_category` (`product_category`),
  KEY `idx_ekb_customer_type` (`customer_type`),
  KEY `idx_ekb_question_type` (`question_type`),
  KEY `idx_ekb_source_type` (`source_type`),
  KEY `idx_ekb_priority` (`priority`),
  KEY `idx_ekb_usage_count` (`usage_count`),
  KEY `idx_ekb_negative_feedback` (`negative_feedback_count`),
  KEY `idx_ekb_create_time` (`create_time`),
  KEY `idx_ekb_status_priority` (`status`,`priority`),
  KEY `idx_ekb_status_usage` (`status`,`usage_count`),
  KEY `idx_ekb_status_priority_usage` (`status`,`priority`,`usage_count`),
  KEY `idx_ekb_scene_status` (`scene_category`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterprise_knowledge_base`
--

LOCK TABLES `enterprise_knowledge_base` WRITE;
/*!40000 ALTER TABLE `enterprise_knowledge_base` DISABLE KEYS */;
INSERT INTO `enterprise_knowledge_base` VALUES (1,'收费标准-一对一辅导','我们的一对一辅导收费标准如下：小学：150元/小时 初中：200元/小时 高中：250元/小时 艺考生：300元/小时。【优惠政策】1. 购买套餐课程可享受8-9折优惠 2. 一次性购买30小时以上享85折 3. 老学员续费享9折优惠 4. 首次体验课仅需99元，含免费学情测评。价格包含：专业教师授课、教材资料、课后答疑、学习报告','收费,价格,一对一,辅导,课时费',95,NULL,'产品介绍','一对一辅导','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(2,'小班课程介绍','我们的小班课程采用精品小班教学模式：【班级规模】3-8人小班，确保师生互动质量。【收费标准】小学：80元/小时 初中：100元/小时 高中：120元/小时。【优势特色】1. 同等水平分班，针对性强 2. 课堂互动氛围好，激发学习兴趣 3. 性价比高，比一对一节省40%费用 4. 固定时间上课，养成良好学习习惯','小班课,班课,收费,课程',90,NULL,'产品介绍','小班课','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(3,'上课时间安排','我们的上课时间非常灵活：【一对一辅导】周一至周五：16:00-21:00；周末：8:00-20:00；寒暑假：8:00-20:00。【小班课程】周末固定班、晚间班、寒暑假集训班。一对一可预约任意时段，提前24小时即可；支持临时调课（需提前24小时通知）','上课时间,时间安排,预约,调课',85,NULL,'产品介绍','课程服务','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(4,'师资力量介绍','我们的师资团队是我们最大的优势：【教师背景】全部来自重点学校在职或退休教师，拥有5年以上教学经验，本科及以上学历，持有教师资格证。【教学特色】1. 熟悉考试大纲和命题规律 2. 善于因材施教 3. 课堂生动有趣 4. 课后耐心答疑。【品质保障】所有老师经过严格筛选和培训，提供免费试听课，承诺：没效果无条件退费','师资,老师,教师,资质,经验',95,NULL,'产品介绍','师资服务','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(5,'线上课程vs线下课程','我们同时提供线上和线下两种授课方式：【线下课程】面对面互动效果好、老师监督到位、学习氛围浓厚。【线上课程】在家上课省时间、不受地域限制、可回放复习，9折优惠（比线下便宜10%）。无论线上还是线下，教学质量完全相同，线上课程采用专业直播平台','线上课,线下课,网课,区别,对比',80,NULL,'产品介绍','课程服务','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(6,'学习资料教材','我们为学员提供完善的学习资料：【教材配备】同步教材+专项练习册、知识点总结讲义、历年真题及模拟题、错题本。教材资料费已包含在课时费中，无额外收费。部分贵重教材可选购，电子资料免费提供','教材,资料,讲义,试卷,练习册',75,NULL,'产品介绍','教学资料','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(7,'艺考文化课冲刺','专为艺考生打造的文化课冲刺课程：【课程特色】1. 考纲精准定位 2. 3个月提升80-150分 3. 专属艺考教材 4. 小班+一对一。【时间安排】集训时间：12月-次年6月，全日制（周一至周六，早8:00-晚9:00）。【提分承诺】签约保分，不达目标退费。历年成绩：90%学员考上本科，60%考上一本','艺考,艺术生,文化课,冲刺,提分',90,NULL,'产品介绍','艺考文化课','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(8,'寒暑假集训营','寒暑假集训营，全封闭式高效学习：【集训时间】寒假班：20天；暑假班：30天/45天班。【课程内容】上学期复习+下学期预习+专项提升，每天8小时课程+2小时自习+1小时答疑。【收费标准】寒假班：3980元；暑假30天班：5980元；暑假45天班：7980元（含教材，不含食宿）。提前30天报名立减500元，老学员优惠300元','集训营,封闭班,寒假,暑假,训练营',85,NULL,'产品介绍','集训课程','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(9,'晚辅导托管班','晚辅导托管班，解决家长下班晚的烦恼：【服务时间】周一至周五：放学后-20:00，提供接送服务。【服务内容】作业辅导、答疑解惑、习惯培养、晚餐提供。【收费标准】包月：1200元/月（仅作业辅导）；包月含餐：1800元/月。每10名学生配1名专职老师+1名助教','托管,晚辅导,作业辅导,接送,晚托',80,NULL,'产品介绍','托管服务','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(10,'免费试听课说明','我们为所有新学员提供免费试听课：【试听流程】1. 预约试听时间 2. 免费学情测评（30分钟）3. 正式试听课（60分钟）4. 课后反馈和学习方案。【试听承诺】完全免费，不满意可更换老师再试听，试听后7天考虑期不催促报名。建议携带近期试卷或作业本','试听,体验课,免费,测评,试听课',90,NULL,'产品介绍','试听服务','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(11,'退费政策说明','我们承诺透明退费：【退费政策】1. 未上课程可全额退款（报名后7天内，扣除100元教材费）2. 已上课程按实际消耗扣除 3. 特殊情况说明：赠送课时不退款。【退费流程】提交申请→财务核算（3个工作日）→审批退款（7个工作日内）→原路退回','退费,退款,退钱,政策,规定',85,NULL,'售后服务','退费政策','现有客户','投诉',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(12,'请假调课规定','我们支持请假调课：【一对一课程】提前24小时请假可免费调课，临时请假扣除课时。【小班课程】提前48小时请假可安排补课，临时请假可观看录播。【注意事项】每月最多请假调课3次，课时有效期内未上完可申请延期（最多延长3个月）','请假,调课,换时间,临时有事',80,NULL,'售后服务','请假调课','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(13,'更换老师流程','我们支持免费更换老师：【更换流程】1. 联系班主任说明情况 2. 推荐3位同等水平老师供选择 3. 安排试听新老师的课程（免费）4. 确认合适后正式更换。前2次更换完全免费，更换老师不收取任何费用，课时不损耗','换老师,更换老师,不满意,老师不好',85,NULL,'售后服务','教师调换','现有客户','投诉',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(14,'学习效果不好怎么办','如果学习效果不理想，我们提供以下解决方案：【诊断分析】学习态度评估、知识掌握测试、课堂效果反馈、作业完成质量、家校配合分析。【改进方案】调整教学方法、增加练习巩固、加强课后辅导、更换老师、调整班型。【效果承诺】坚持上课3个月成绩必有提升，如无提升无条件退费','学习效果,没效果,成绩,不提分',90,NULL,'售后服务','效果跟踪','现有客户','投诉',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(15,'课时余额查询','您可以随时查询剩余课时：【查询方式】1. 微信公众号查询 2. APP查询 3. 电话查询 4. 到店查询。【查询内容】剩余课时数、课程有效期、已上课时记录、请假调课记录、账户余额。如对课时有疑问，提供上课记录明细核对','课时查询,余额,剩余,还有多少课',70,NULL,'售后服务','课时管理','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(16,'续费优惠政策','老学员续费享受专属优惠：【续费优惠】1. 续费9折 2. 续费赠课时：续费30课时赠3课时，60课时赠8课时，100课时赠15课时 3. 转介绍优惠：成功推荐1名新学员双方各得2课时 4. 早续费优惠：提前1个月额外9.5折。续费即送学习大礼包、错题打印机、学习资料包','续费,优惠,折扣,赠课,老学员',80,NULL,'售后服务','续费管理','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(17,'课程顾问服务','每位学员配备专属课程顾问（班主任）：【顾问职责】1. 学习规划 2. 跟踪服务（每周反馈，每月报告）3. 课程管理（排课、调课、请假）4. 问题解决。【服务标准】24小时内回复消息，每周至少1次主动沟通，每月提供学习报告','班主任,课程顾问,老师,联系方式',75,NULL,'售后服务','顾问服务','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(18,'家长会和反馈','我们定期举办家长会：【家长会安排】小班课程每月1次，一对一辅导每月1次电话沟通。【家长会内容】学习情况总结、问题分析、下阶段规划、家长提问。【日常反馈】课后点评、周报告、月报告。【线上沟通】家长微信群、一对一微信、电话沟通','家长会,反馈,沟通,家校联系',70,NULL,'售后服务','家校沟通','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(19,'投诉建议渠道','我们欢迎您的监督：【投诉建议渠道】1. 直接找课程顾问/班主任 2. 拨打客服热线400-XXX-XXXX 3. 微信公众号留言 4. 总部投诉邮箱 5. 校长信箱。【处理承诺】48小时内初步回复，7个工作日内彻底解决。采纳建议并改进，赠送课时或其他奖励','投诉,建议,意见,反馈,联系方式',75,NULL,'售后服务','投诉处理','现有客户','投诉',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(20,'学习资料补发','如果学习资料遗失或损坏，我们提供补发服务：【补发流程】联系班主任→确认资料→3个工作日内补发→到店领取或快递寄送。【收费标准】首次补发免费，再次补发成本价，故意损坏原价赔偿。大部分资料都有电子版，可随时下载打印','资料,补发,丢失,损坏,教材',60,NULL,'售后服务','资料管理','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(21,'新生报名优惠','新生报名享受超值优惠礼包！【限时优惠】1. 首次报名30小时以上立减500元 2. 首次报名任意课程享9折 3. 免费试听+测评。【新生专属礼包】精美书包、文具用品、学科资料包、错题打印机、3次免费答疑。长期有效（每月前50名）','新生,报名,优惠,活动,折扣',85,NULL,'营销活动','新生优惠','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(22,'转介绍奖励','推荐有礼，感恩回馈！【推荐奖励】成功推荐1名好友：推荐人奖励3课时或300元，被推荐人立减200元。成功推荐3名好友：推荐人奖励10课时或1000元，额外获得\"金牌推荐官\"称号。推荐人数不限，长期有效','转介绍,推荐,优惠,奖励,邀请',80,NULL,'营销活动','转介绍','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(23,'团报优惠','组团报名，优惠更多！【团报优惠】2人团报每人优惠200元，3人团报每人优惠300元，5人团报每人优惠500元，10人团报每人优惠800元。适用小班课程、一对一课程（30课时以上）、寒暑假集训营。我们可以帮您匹配同年级同需求的学员组团','团报,拼团,组团,优惠,多人',75,NULL,'营销活动','团报优惠','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(24,'寒暑假报名优惠','寒暑假预报名，抢占优质教师资源！【早鸟优惠】提前1个月9折，提前2个月85折，提前3个月8折。【寒暑假特惠套餐】多种套餐可选。【报名礼包】新学期教材资料、寒/暑假作业辅导（免费）、开学收心课、新学期学习规划。每期限额100人，满额即止','寒假,暑假,假期,集训,早鸟,优惠',90,NULL,'营销活动','假期促销','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(25,'老学员续费活动','老学员续费专属福利！【续费优惠】基础9折+额外赠课时。【忠诚学员特惠】在读1年额外9.5折，在读2年额外9折，在读3年及以上额外85折。【续费礼包】错题打印机/护眼台灯/学习资料大礼包三选一。续费同时推荐新学员额外赠送5课时','老学员,续费,优惠,赠课,回馈',85,NULL,'营销活动','续费促销','现有客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(26,'考前冲刺班','考前冲刺，快速提分！【课程特色】名师授课、考点精讲、真题演练、个性化辅导、30天提升50-100分。【冲刺时间】小升初冲刺：5-6月（2个月）；中考冲刺：4-6月（3个月）；高考冲刺：3-6月（4个月）。【提分承诺】签约保分，不达目标全额退费。95%学员达到目标分数','考前,冲刺,中考,高考,提分',90,NULL,'营销活动','冲刺班','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(27,'开学季活动','开学季钜惠，助力新学期！【活动时间】春季2-3月，秋季8-9月。【活动内容】1. 新学期课程8.5折 2. 报名即送开学礼包 3. 抽奖活动（iPad、学习机等）。【开学收心课】免费帮助孩子快速进入学习状态。多种特惠套餐可选','开学,新学期,活动,优惠,收心',85,NULL,'营销活动','开学季','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(28,'双十一活动','双十一教育狂欢节，全年最低价！【活动时间】11月1日-11月11日。【超级优惠】全场课程7折起、满减活动、秒杀活动。【定金膨胀】11月1-10日交100抵500，11月11日交100抵200。【赠品大放送】学习机、错题打印机、文具大礼包。错过等一年','双十一,11.11,活动,大促,狂欢',95,NULL,'营销活动','大促活动','潜在客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(29,'周年庆活动','XX教育周年庆，感恩回馈！【庆典优惠】1. 全场课程8折 2. 充值送豪礼 3. 老学员特别感恩（在读5年免费赠送20课时）。【周年庆礼包】学习机、全年学习资料、VIP会员卡、免费答疑服务、家庭教育讲座。【抽奖活动】特等奖免费学习1年','周年庆,活动,感恩,回馈,庆典',95,NULL,'营销活动','周年庆','全部客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active'),(30,'家庭教育讲座','免费家庭教育讲座，助力孩子成长！【讲座主题】每月一期，如何培养自主学习能力、家长如何陪伴、学习方法等。【讲师团队】知名教育专家、心理咨询师、一线名师。【讲座形式】线下讲座+线上直播，每月第2个周六下午14:00-16:00。【完全免费】所有家长免费参加','家庭教育,讲座,免费,活动,育儿',70,NULL,'营销活动','公益讲座','全部客户','咨询',0.00,0.00,0,0,0,NULL,'manual',NULL,NULL,NULL,'2025-11-17 20:07:31.299365','2025-11-17 20:07:31.299365','active');
/*!40000 ALTER TABLE `enterprise_knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '存储文件名',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件路径',
  `file_size` int NOT NULL COMMENT '文件大小（字节）',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件类型',
  `category` enum('avatar','customer_attachment','order_contract','ai_chat','other') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件用途',
  `related_id` int DEFAULT NULL COMMENT '关联ID',
  `upload_user_id` int NOT NULL COMMENT '上传用户ID',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '上传时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
INSERT INTO `file` VALUES (1,'èå¤©è®°å½.png','1762583702784_787xqh0ex0p.png','uploads/other/1762583702784_787xqh0ex0p.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:35:02.798787'),(2,'èå¤©è®°å½.png','1762583730730_535gfudzx7x.png','uploads/other/1762583730730_535gfudzx7x.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:35:30.737005'),(3,'èå¤©è®°å½.png','1762583875388_esih36n3038.png','uploads/other/1762583875388_esih36n3038.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:37:55.396627'),(4,'èå¤©è®°å½.png','1762584550937_4bpt1xi6y3g.png','uploads/other/1762584550937_4bpt1xi6y3g.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:49:10.949164'),(5,'èå¤©è®°å½.png','1762584589028_0b8lalgraf4k.png','uploads/other/1762584589028_0b8lalgraf4k.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:49:49.036409'),(6,'èå¤©è®°å½.png','1762584785818_nmoc1tzp35c.png','uploads/other/1762584785818_nmoc1tzp35c.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 14:53:05.851525'),(7,'èå¤©è®°å½.png','1762586232489_sy4pxxjcrw.png','uploads/other/1762586232489_sy4pxxjcrw.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 15:17:12.503825'),(8,'èå¤©è®°å½.png','1762587180498_wso6ffa7l4m.png','uploads/other/1762587180498_wso6ffa7l4m.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 15:33:00.512424'),(9,'èå¤©è®°å½.png','1762587543488_vppnllfxswf.png','uploads/other/1762587543488_vppnllfxswf.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 15:39:03.500840'),(10,'èå¤©è®°å½.png','1762588310233_rwjslwrx5h.png','uploads/other/1762588310233_rwjslwrx5h.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 15:51:50.245667'),(11,'èå¤©è®°å½.png','1762590291974_1jt6we2ex2r.png','uploads/other/1762590291974_1jt6we2ex2r.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 16:24:51.985224'),(12,'èå¤©è®°å½.png','1762590916840_usjnpdizbp.png','uploads/other/1762590916840_usjnpdizbp.png',856279,'image/png','ai_chat',NULL,1,'2025-11-08 16:35:16.850968'),(13,'èå¤©è®°å½.png','1762766332189_nqcek5efuyn.png','uploads/other/1762766332189_nqcek5efuyn.png',856279,'image/png','ai_chat',NULL,1,'2025-11-10 17:18:52.202336');
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `industry_question_library`
--

DROP TABLE IF EXISTS `industry_question_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industry_question_library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `industry_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '行业名称:教育|医疗|电商|金融等',
  `industry_sub_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '行业细分:K12教育|职业教育等',
  `answer_template` text COLLATE utf8mb4_unicode_ci COMMENT '答案模板(可包含变量)',
  `scene_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '场景分类',
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '问题类型',
  `source_type` enum('system_preset','ai_generate') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system_preset' COMMENT '来源类型',
  `usage_count` int NOT NULL DEFAULT '0' COMMENT '被使用次数',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '是否启用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '常见问题',
  PRIMARY KEY (`id`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_active` (`is_active`),
  KEY `idx_industry` (`industry_name`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industry_question_library`
--

LOCK TABLES `industry_question_library` WRITE;
/*!40000 ALTER TABLE `industry_question_library` DISABLE KEYS */;
INSERT INTO `industry_question_library` VALUES (1,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(2,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(3,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(4,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(5,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(6,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(7,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(8,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(9,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(10,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(11,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(12,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(13,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(14,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(15,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(16,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(17,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(18,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(19,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(20,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(21,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(22,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(23,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(24,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(25,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(26,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(27,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(28,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(29,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(30,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(31,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(32,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(33,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(34,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(35,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(36,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(37,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(38,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(39,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(40,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(41,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(42,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(43,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(44,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(45,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(46,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(47,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(48,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(49,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(50,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(51,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(52,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(53,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(54,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(55,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(56,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(57,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(58,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(59,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(60,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(61,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(62,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(63,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(64,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(65,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(66,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(67,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(68,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(69,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(70,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(71,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(72,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(73,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(74,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(75,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(76,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(77,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(78,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(79,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(80,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(81,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(82,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(83,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(84,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(85,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(86,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(87,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(88,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(89,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(90,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(91,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(92,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(93,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(94,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(95,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(96,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(97,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(98,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(99,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(100,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(101,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(102,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(103,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(104,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(105,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(106,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(107,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(108,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(109,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(110,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(111,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(112,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(113,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(114,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(115,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(116,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(117,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(118,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(119,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(120,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(121,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(122,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(123,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(124,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459',''),(125,'',NULL,NULL,NULL,NULL,'system_preset',0,1,'2025-11-17 14:07:28.748459','');
/*!40000 ALTER TABLE `industry_question_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `key_result`
--

DROP TABLE IF EXISTS `key_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `key_result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `okr_id` int NOT NULL COMMENT 'OKR ID',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关键结果描述',
  `target_value` decimal(10,2) NOT NULL COMMENT '目标值',
  `current_value` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '当前值',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '单位',
  `progress` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '完成度（0-100）',
  `weight` int NOT NULL DEFAULT '0' COMMENT '权重（用于计算总进度）',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `key_result`
--

LOCK TABLES `key_result` WRITE;
/*!40000 ALTER TABLE `key_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `key_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_feedback`
--

DROP TABLE IF EXISTS `knowledge_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `handled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已处理',
  `knowledge_id` int NOT NULL COMMENT '知识库ID',
  `user_id` int NOT NULL COMMENT '反馈用户ID',
  `customer_id` int DEFAULT NULL COMMENT '关联客户ID',
  `feedback_scene` enum('ai_chat','knowledge_search','ai_analysis','ai_recommendation') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '反馈场景',
  `function_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '具体功能名称',
  `conversation_topic` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '对话主题',
  `feedback_type` enum('positive','negative') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'negative' COMMENT '反馈类型',
  `feedback_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '反馈原因',
  `feedback_detail` text COLLATE utf8mb4_unicode_ci COMMENT '详细反馈内容',
  `conversation_context` json DEFAULT NULL COMMENT '完整对话上下文',
  `ai_analysis` text COLLATE utf8mb4_unicode_ci COMMENT 'AI对该反馈的分析',
  `optimization_suggestion` text COLLATE utf8mb4_unicode_ci COMMENT 'AI生成的优化建议',
  `handler_id` int DEFAULT NULL COMMENT '处理人ID',
  `handle_time` datetime DEFAULT NULL COMMENT '处理时间',
  `handle_result` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '处理结果',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_feedback_type` (`feedback_type`),
  KEY `idx_handled` (`handled`),
  KEY `idx_feedback_scene` (`feedback_scene`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_knowledge_id` (`knowledge_id`),
  KEY `idx_kf_customer_id` (`customer_id`),
  KEY `idx_kf_knowledge_id` (`knowledge_id`),
  KEY `idx_kf_feedback_scene` (`feedback_scene`),
  KEY `idx_kf_handled` (`handled`),
  KEY `idx_kf_create_time` (`create_time`),
  CONSTRAINT `FK_28524509fa96a28aa441013278e` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_2c76b6d072c71378fd9c3cda188` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_6617230cc7f94131aa4020ae521` FOREIGN KEY (`knowledge_id`) REFERENCES `enterprise_knowledge_base` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_feedback`
--

LOCK TABLES `knowledge_feedback` WRITE;
/*!40000 ALTER TABLE `knowledge_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_mining_batch`
--

DROP TABLE IF EXISTS `knowledge_mining_batch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_mining_batch` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '数据源类型（ai_chat AI对话、customer_feedback客户反馈、tickets工单等）',
  `sourceIds` json DEFAULT NULL COMMENT '数据源ID列表（JSON数组）',
  `dateRange` json NOT NULL COMMENT '时间范围（{startDate, endDate}）',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态（pending待处理、processing处理中、completed已完成、failed失败）',
  `totalCount` int DEFAULT '0' COMMENT '总记录数',
  `extractedCount` int DEFAULT '0' COMMENT '已提取数量',
  `approvedCount` int DEFAULT '0' COMMENT '已通过数量',
  `rejectedCount` int DEFAULT '0' COMMENT '已拒绝数量',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_kmb_status` (`status`),
  KEY `idx_kmb_source_type` (`sourceType`),
  KEY `idx_kmb_create_time` (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识挖掘批次表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_mining_batch`
--

LOCK TABLES `knowledge_mining_batch` WRITE;
/*!40000 ALTER TABLE `knowledge_mining_batch` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_mining_batch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_mining_candidate`
--

DROP TABLE IF EXISTS `knowledge_mining_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_mining_candidate` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `batchId` int NOT NULL COMMENT '挖掘批次ID',
  `sourceType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '数据源类型',
  `sourceId` int NOT NULL COMMENT '数据源记录ID',
  `extractedTitle` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提取的标题',
  `extractedContent` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提取的内容',
  `extractedKeywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '提取的关键词',
  `sceneCategory` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '场景分类',
  `productCategory` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '产品分类',
  `customerType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '客户类型',
  `questionType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '问题类型',
  `confidenceScore` int NOT NULL COMMENT 'AI置信度评分（0-100）',
  `scoreReason` text COLLATE utf8mb4_unicode_ci COMMENT '评分理由',
  `reviewStatus` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态（pending待审核、approved已通过、rejected已拒绝）',
  `reviewTime` datetime DEFAULT NULL COMMENT '审核时间',
  `rejectReason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '拒绝原因',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_batch_id` (`batchId`),
  KEY `idx_kmc_review_status` (`reviewStatus`),
  KEY `idx_kmc_confidence_score` (`confidenceScore`),
  KEY `idx_kmc_batch_review` (`batchId`,`reviewStatus`),
  KEY `idx_kmc_source_type` (`sourceType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='挖掘候选知识表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_mining_candidate`
--

LOCK TABLES `knowledge_mining_candidate` WRITE;
/*!40000 ALTER TABLE `knowledge_mining_candidate` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_mining_candidate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_pending_review`
--

DROP TABLE IF EXISTS `knowledge_pending_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_pending_review` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '挖掘的问题',
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '挖掘的答案',
  `keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI提取的关键词',
  `scene_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '场景分类',
  `product_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '产品分类',
  `customer_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '客户类型',
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '问题类型',
  `ai_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'AI质量评分(0-100)',
  `confidence_score` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'AI置信度(0-100)',
  `source_type` enum('chat_mining','industry_recommend') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源类型',
  `source_chat_record_id` int DEFAULT NULL COMMENT '来源聊天记录ID',
  `mining_reason` text COLLATE utf8mb4_unicode_ci COMMENT '挖掘理由(AI说明为什么推荐这个)',
  `review_status` enum('pending','approved','rejected','auto_approved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `reviewer_id` int DEFAULT NULL COMMENT '审核人ID',
  `review_time` datetime DEFAULT NULL COMMENT '审核时间',
  `review_comment` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核意见',
  `mining_batch_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '挖掘批次ID',
  `mining_time` datetime DEFAULT NULL COMMENT '挖掘时间',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_mining_batch` (`mining_batch_id`),
  KEY `idx_ai_score` (`ai_score`),
  KEY `idx_review_status` (`review_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_pending_review`
--

LOCK TABLES `knowledge_pending_review` WRITE;
/*!40000 ALTER TABLE `knowledge_pending_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_pending_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_usage_log`
--

DROP TABLE IF EXISTS `knowledge_usage_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_usage_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '使用者ID',
  `customer_id` int DEFAULT NULL COMMENT '关联客户ID',
  `query_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '查询问题',
  `matched_knowledge_ids` json DEFAULT NULL COMMENT '匹配到的知识库ID列表',
  `knowledge_scores` json DEFAULT NULL COMMENT '各知识库的评分',
  `ai_decision` enum('use_knowledge','use_ai_generate','hybrid') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI决策结果',
  `ai_decision_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'AI决策理由',
  `final_answer` text COLLATE utf8mb4_unicode_ci COMMENT '最终输出的答案',
  `usage_scene` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '使用场景',
  `feedback_id` int DEFAULT NULL COMMENT '关联的反馈ID(如果有)',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_usage_scene` (`usage_scene`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `FK_49bed063a41d06f9a76f374f629` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_cd5494bcdaa4ded96b8e91f4844` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_usage_log`
--

LOCK TABLES `knowledge_usage_log` WRITE;
/*!40000 ALTER TABLE `knowledge_usage_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_usage_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '接收用户ID',
  `type` enum('follow_reminder','order_update','commission_paid','system') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知内容',
  `related_id` int DEFAULT NULL COMMENT '关联ID（客户/订单等）',
  `is_read` tinyint NOT NULL DEFAULT '0' COMMENT '是否已读：1-已读，0-未读',
  `read_time` datetime DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,4,'follow_reminder','客户跟进提醒','客户\"张三\"需要在今天跟进，请及时联系',NULL,0,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(2,4,'order_update','新订单通知','客户\"吴九\"的订单已支付成功',NULL,1,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(3,5,'follow_reminder','客户跟进提醒','客户\"赵六\"明天需要跟进',NULL,0,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(4,5,'order_update','订单支付提醒','客户\"郑十\"的订单已支付',NULL,1,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(5,2,'system','系统通知','本月销售目标完成率75%，请继续努力',NULL,0,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(6,3,'system','团队通知','销售一组本月业绩排名第一，继续加油！',NULL,1,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(7,6,'follow_reminder','客户跟进提醒','客户\"孙七\"报价已发送3天，请跟进',NULL,0,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(8,7,'follow_reminder','客户跟进提醒','客户\"周八\"正在谈判中，请尽快推进',NULL,0,NULL,'2025-11-10 16:16:39.296736','2025-11-10 16:16:39.296736'),(9,4,'follow_reminder','客户回访提醒','客户【阳光少年】今天需要回访，请及时跟进！',1,0,NULL,'2025-11-11 09:00:00.047897','2025-11-11 09:00:00.047897'),(10,4,'follow_reminder','客户回访提醒','客户【努力学】今天需要回访，请及时跟进！',9,0,NULL,'2025-11-11 09:00:00.053446','2025-11-11 09:00:00.053446'),(11,7,'follow_reminder','客户回访提醒','客户【学习王】今天需要回访，请及时跟进！',11,0,NULL,'2025-11-11 09:00:00.056037','2025-11-11 09:00:00.056037'),(12,5,'follow_reminder','客户回访提醒','客户【快乐学习】今天需要回访，请及时跟进！',2,0,NULL,'2025-11-12 09:00:00.040901','2025-11-12 09:00:00.040901'),(13,5,'follow_reminder','客户回访提醒','客户【天天向上】今天需要回访，请及时跟进！',4,0,NULL,'2025-11-12 09:00:00.044850','2025-11-12 09:00:00.044850'),(14,7,'follow_reminder','客户回访提醒','客户【未来之星】今天需要回访，请及时跟进！',6,0,NULL,'2025-11-12 09:00:00.047957','2025-11-12 09:00:00.047957'),(15,5,'follow_reminder','客户回访提醒','客户【好学生】今天需要回访，请及时跟进！',10,0,NULL,'2025-11-12 09:00:00.050810','2025-11-12 09:00:00.050810'),(16,4,'follow_reminder','客户回访提醒','客户【好好学习】今天需要回访，请及时跟进！',3,0,NULL,'2025-11-13 09:00:00.035994','2025-11-13 09:00:00.035994'),(17,6,'follow_reminder','客户回访提醒','客户【聪明宝宝】今天需要回访，请及时跟进！',5,0,NULL,'2025-11-13 09:00:00.040666','2025-11-13 09:00:00.040666');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT 'ID',
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `isRead` tinyint NOT NULL DEFAULT '0',
  `relatedId` int DEFAULT NULL COMMENT 'ID',
  `relatedType` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_type` (`type`),
  KEY `idx_isRead` (`isRead`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `okr`
--

DROP TABLE IF EXISTS `okr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `okr` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'OKR标题',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'OKR描述',
  `owner_id` int NOT NULL COMMENT '负责人ID',
  `type` enum('individual','team','company') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'OKR类型：individual-个人, team-团队, company-公司',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `status` enum('draft','active','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT '状态：draft-草稿, active-进行中, completed-已完成, cancelled-已取消',
  `progress` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '完成度（0-100）',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `okr`
--

LOCK TABLES `okr` WRITE;
/*!40000 ALTER TABLE `okr` DISABLE KEYS */;
/*!40000 ALTER TABLE `okr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_accounts`
--

DROP TABLE IF EXISTS `operation_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform_type` enum('小红书','抖音','视频号') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '平台类型',
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号名称',
  `account_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '账号ID/链接',
  `campus_id` int NOT NULL COMMENT '关联校区ID',
  `operator_id` int NOT NULL COMMENT '负责运营人员ID',
  `account_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '专业号' COMMENT '账号类型',
  `status` enum('正常','风险','封号','掉号') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '正常' COMMENT '账号状态',
  `fans_count` int NOT NULL DEFAULT '0' COMMENT '粉丝量',
  `total_likes` int NOT NULL DEFAULT '0' COMMENT '总点赞量',
  `last_update_time` datetime DEFAULT NULL COMMENT '数据最后更新时间',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `FK_0c53a28d5f677985724ac2e3437` (`operator_id`),
  KEY `FK_d2022d3de6d9a69777e3cc6af6d` (`campus_id`),
  CONSTRAINT `FK_0c53a28d5f677985724ac2e3437` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_d2022d3de6d9a69777e3cc6af6d` FOREIGN KEY (`campus_id`) REFERENCES `campus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_accounts`
--

LOCK TABLES `operation_accounts` WRITE;
/*!40000 ALTER TABLE `operation_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_commission_records`
--

DROP TABLE IF EXISTS `operation_commission_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_commission_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operator_id` int NOT NULL COMMENT '运营人员ID',
  `customer_id` int NOT NULL COMMENT '客户ID',
  `order_id` int NOT NULL COMMENT '订单ID',
  `order_tag` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '订单标签',
  `order_amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `commission_amount` decimal(10,2) NOT NULL DEFAULT '200.00' COMMENT '提成金额',
  `status` enum('待发放','已发放','已拒绝') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待发放' COMMENT '状态',
  `payment_date` date DEFAULT NULL COMMENT '发放日期',
  `approver_id` int DEFAULT NULL COMMENT '审核人ID',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `FK_54c0b033a96c8471f34a7aece09` (`operator_id`),
  KEY `FK_95960bcbf22e4941cbcb3c1010e` (`customer_id`),
  KEY `FK_9dabcacd93a86b30076e7d32b92` (`order_id`),
  KEY `FK_e74c6fc0e2e804a57636d52db57` (`approver_id`),
  CONSTRAINT `FK_54c0b033a96c8471f34a7aece09` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_95960bcbf22e4941cbcb3c1010e` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_9dabcacd93a86b30076e7d32b92` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_e74c6fc0e2e804a57636d52db57` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_commission_records`
--

LOCK TABLES `operation_commission_records` WRITE;
/*!40000 ALTER TABLE `operation_commission_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_commission_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_daily_records`
--

DROP TABLE IF EXISTS `operation_daily_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_daily_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_date` date NOT NULL COMMENT '日报日期',
  `account_id` int NOT NULL COMMENT '账号ID',
  `operator_id` int NOT NULL COMMENT '运营人员ID',
  `update_count` int NOT NULL DEFAULT '0' COMMENT '更新次数',
  `content_tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '内容类型标签（逗号分隔）',
  `view_min` int NOT NULL DEFAULT '0' COMMENT '浏览量最小值',
  `view_max` int NOT NULL DEFAULT '0' COMMENT '浏览量最大值',
  `play_min` int NOT NULL DEFAULT '0' COMMENT '播放量最小值',
  `play_max` int NOT NULL DEFAULT '0' COMMENT '播放量最大值',
  `comment_min` int NOT NULL DEFAULT '0' COMMENT '评论数最小值',
  `comment_max` int NOT NULL DEFAULT '0' COMMENT '评论数最大值',
  `message_min` int NOT NULL DEFAULT '0' COMMENT '私信数最小值',
  `message_max` int NOT NULL DEFAULT '0' COMMENT '私信数最大值',
  `account_status_changed` tinyint NOT NULL DEFAULT '0' COMMENT '账号状态是否变化',
  `new_status` enum('正常','风险','封号','掉号') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '新状态',
  `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `FK_191bbd21aec6f1f1a0c0fe2ad54` (`account_id`),
  KEY `FK_60284041e2404012ae11af37a1f` (`operator_id`),
  CONSTRAINT `FK_191bbd21aec6f1f1a0c0fe2ad54` FOREIGN KEY (`account_id`) REFERENCES `operation_accounts` (`id`),
  CONSTRAINT `FK_60284041e2404012ae11af37a1f` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_daily_records`
--

LOCK TABLES `operation_daily_records` WRITE;
/*!40000 ALTER TABLE `operation_daily_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `operation_daily_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_log`
--

DROP TABLE IF EXISTS `operation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '操作用户ID',
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作模块',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `detail` text COLLATE utf8mb4_unicode_ci COMMENT '操作详情',
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT '用户代理',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态：1-成功，0-失败',
  `error_msg` text COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '操作时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_log`
--

LOCK TABLES `operation_log` WRITE;
/*!40000 ALTER TABLE `operation_log` DISABLE KEYS */;
INSERT INTO `operation_log` VALUES (1,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',0,'Data truncated for column \'category\' at row 1','2025-11-08 14:15:07.887840'),(2,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',0,'Data truncated for column \'category\' at row 1','2025-11-08 14:15:11.871667'),(3,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',0,'Data truncated for column \'category\' at row 1','2025-11-08 14:16:03.526397'),(4,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',0,'Data truncated for column \'category\' at row 1','2025-11-08 14:16:12.170083'),(5,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:35:02.811315'),(6,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:35:30.749415'),(7,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:37:55.407420'),(8,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:49:10.961826'),(9,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:49:49.050400'),(10,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 14:53:05.862564'),(11,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 15:17:12.520791'),(12,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 15:33:00.527435'),(13,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 15:39:03.515240'),(14,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 15:51:50.257121'),(15,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 16:24:51.995850'),(16,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','116.22.167.77','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-08 16:35:16.861882'),(17,1,'admin','文件管理','上传文件','{\"path\":\"/api/upload\",\"method\":\"POST\",\"params\":{},\"query\":{},\"body\":{}}','61.140.197.48','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1,NULL,'2025-11-10 17:18:52.217118');
/*!40000 ALTER TABLE `operation_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_sync_logs`
--

DROP TABLE IF EXISTS `order_sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_sync_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sync_batch_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sync_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '同步类型：create-新建, update-更新, skip-跳过, delete-删除',
  `old_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changes` json DEFAULT NULL COMMENT '变更字段详情',
  `external_data` json DEFAULT NULL COMMENT '海绵原始数据快照',
  `sync_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `result` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '同步结果：success-成功, failed-失败',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `execution_time` int DEFAULT NULL COMMENT '执行耗时（毫秒）',
  PRIMARY KEY (`id`),
  KEY `IDX_1d573163ac8ac59ef16cc78f53` (`sync_batch_id`),
  KEY `IDX_cf193154c219d787c7e6bf0fa0` (`order_no`),
  KEY `IDX_8c61de58b9da185a41c74453de` (`sync_time`),
  KEY `IDX_91e8fc6022653260795281f23b` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_sync_logs`
--

LOCK TABLES `order_sync_logs` WRITE;
/*!40000 ALTER TABLE `order_sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `wechat_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wechat_nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sales_id` int NOT NULL,
  `campus_id` int DEFAULT NULL,
  `course_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_time` datetime NOT NULL,
  `is_new_student` tinyint NOT NULL DEFAULT '1',
  `order_status` enum('待上课','上课中','已完成','已退款') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待上课',
  `teacher_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distributor_sales` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `data_source` enum('手工录入','小程序导入','海绵青年GO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '手工录入',
  `order_tag` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_scheme_id` int DEFAULT NULL,
  `commission_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `commission_calculated_at` datetime DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `is_external` tinyint NOT NULL DEFAULT '0' COMMENT '是否外部订单：0=否，1=是',
  `external_system` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '来源系统标识（如：HAIMIAN）',
  `external_status` int DEFAULT NULL COMMENT '海绵系统原始状态值（1-9）',
  `external_refund` int DEFAULT NULL COMMENT '海绵退款标识：0=默认 1=申请退款 2=已退款 3=不予退款',
  `external_refund_status` int DEFAULT NULL COMMENT '海绵退款状态：0=默认 1=通过 2=驳回',
  `sync_status` enum('未同步','已同步','同步失败') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '未同步' COMMENT '同步状态',
  `last_sync_time` datetime DEFAULT NULL COMMENT '最后同步时间',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '外部系统是否删除：0=否，1=是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_035026a83bef9740d7ad05df38` (`order_no`),
  KEY `FK_772d0ce0473ac2ccfa26060dbe9` (`customer_id`),
  CONSTRAINT `FK_772d0ce0473ac2ccfa26060dbe9` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD202501001',7,'wx_wujiu','学霸养成','13900000007',4,1,'初中数学精品班',16000.00,'2025-10-11 16:16:39',0,'上课中',NULL,NULL,NULL,'续费老客户，给予优惠','手工录入','续费',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0),(2,'ORD202501002',8,'wx_zhengshi','优等生','13900000008',5,1,'高三全科冲刺班',28000.00,'2025-10-16 16:16:39',1,'上课中',NULL,NULL,NULL,'高考冲刺，全科辅导','手工录入','新签',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0),(3,'ORD202501003',12,'wx_yangshiliu','拼搏者','13900000014',4,1,'高考全科冲刺套餐',32000.00,'2025-10-01 16:16:39',1,'上课中',NULL,NULL,NULL,'高三学生，冲刺985','手工录入','新签',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0),(4,'ORD202501004',13,'wx_heershi','学习小达人','13900000018',5,1,'小学全科班',13000.00,'2025-10-06 16:16:39',1,'上课中',NULL,NULL,NULL,'小学全科辅导','手工录入','新签',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0),(5,'ORD202501005',7,'wx_wujiu','学霸养成','13900000007',4,1,'寒假数学集训营',4700.00,'2025-10-21 16:16:39',0,'已完成',NULL,NULL,NULL,'寒假集训','手工录入','续费',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0),(6,'ORD202501006',8,'wx_zhengshi','优等生','13900000008',5,1,'物理竞赛班',11200.00,'2025-10-13 16:16:39',0,'上课中',NULL,NULL,NULL,'物理竞赛辅导','手工录入','续费',NULL,0.00,NULL,'2025-11-10 16:16:39.271502','2025-11-10 16:16:39.271502',0,NULL,NULL,NULL,NULL,'未同步',NULL,0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8dad765629e83229da6feda1c1` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'customer:view','查看客户','customer','查看客户列表和详情',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(2,'customer:create','创建客户','customer','创建新客户',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(3,'customer:update','编辑客户','customer','编辑客户信息',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(4,'customer:delete','删除客户','customer','删除客户',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(5,'customer:batch:assign','批量分配销售','customer','批量分配客户给销售',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(6,'customer:batch:update','批量修改客户','customer','批量修改客户意向等信息',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(7,'customer:batch:delete','批量删除客户','customer','批量删除客户',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(8,'customer:follow','跟进客户','customer','添加客户跟进记录',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(9,'customer:export','导出客户','customer','导出客户数据',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(10,'customer:import','导入客户','customer','导入客户数据',NULL,1,'2025-11-07 15:40:03.557342','2025-11-07 15:40:03.557342'),(11,'order:view','查看订单','order','查看订单列表和详情',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(12,'order:create','创建订单','order','创建新订单',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(13,'order:update','编辑订单','order','编辑订单信息',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(14,'order:delete','删除订单','order','删除订单',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(15,'order:export','导出订单','order','导出订单数据',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(16,'order:import','导入订单','order','导入订单数据',NULL,1,'2025-11-07 15:40:03.562051','2025-11-07 15:40:03.562051'),(17,'user:view','查看用户','user','查看用户列表和详情',NULL,1,'2025-11-07 15:40:03.565739','2025-11-07 15:40:03.565739'),(18,'user:create','创建用户','user','创建新用户',NULL,1,'2025-11-07 15:40:03.565739','2025-11-07 15:40:03.565739'),(19,'user:update','编辑用户','user','编辑用户信息',NULL,1,'2025-11-07 15:40:03.565739','2025-11-07 15:40:03.565739'),(20,'user:delete','删除用户','user','删除用户',NULL,1,'2025-11-07 15:40:03.565739','2025-11-07 15:40:03.565739'),(21,'user:reset-password','重置密码','user','重置用户密码',NULL,1,'2025-11-07 15:40:03.565739','2025-11-07 15:40:03.565739'),(22,'dashboard:view','查看数据看板','dashboard','查看数据看板',NULL,1,'2025-11-07 15:40:03.569761','2025-11-07 15:40:03.569761'),(23,'dashboard:all-data','查看全部数据','dashboard','查看全公司数据，不受数据权限限制',NULL,1,'2025-11-07 15:40:03.569761','2025-11-07 15:40:03.569761'),(24,'finance:view','查看财务报表','finance','查看财务数据',NULL,1,'2025-11-07 15:40:03.573571','2025-11-07 15:40:03.573571'),(25,'finance:commission','查看提成','finance','查看提成数据',NULL,1,'2025-11-07 15:40:03.573571','2025-11-07 15:40:03.573571'),(26,'system:role','角色管理','system','管理角色和权限',NULL,1,'2025-11-07 15:40:03.577445','2025-11-07 15:40:03.577445'),(27,'system:department','部门管理','system','管理部门',NULL,1,'2025-11-07 15:40:03.577445','2025-11-07 15:40:03.577445'),(28,'system:campus','校区管理','system','管理校区',NULL,1,'2025-11-07 15:40:03.577445','2025-11-07 15:40:03.577445'),(29,'system:dictionary','字典管理','system','管理数据字典',NULL,1,'2025-11-07 15:40:03.577445','2025-11-07 15:40:03.577445'),(35,'ai:report:view','查看AI报告','ai','查看和生成AI诊断报告',NULL,1,'2025-11-07 15:50:24.648423','2025-11-07 21:03:08.302248'),(36,'ai:chat:view','查看聊天分析','ai','查看AI聊天记录分析',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(37,'ai:chat:upload','上传聊天记录','ai','上传聊天截图进行分析',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(38,'ai:chat:delete','删除聊天记录','ai','删除聊天记录',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(39,'ai:knowledge:view','查看知识库','ai','查看AI知识库内容',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(40,'ai:knowledge:create','创建知识库','ai','创建知识库条目',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(41,'ai:knowledge:edit','编辑知识库','ai','编辑知识库内容',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(42,'ai:knowledge:delete','删除知识库','ai','删除知识库条目',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(43,'ai:script:view','查看话术库','ai','查看AI话术库',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(44,'ai:script:use','使用话术','ai','使用AI话术生成',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(45,'ai:risk:view','查看风险预警','ai','查看AI风险预警',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(46,'ai:risk:handle','处理风险预警','ai','处理风险预警',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(47,'ai:recovery:view','AI挽回建议查看','ai','查看AI挽回建议',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 18:36:25.162590'),(48,'ai:training:use','使用AI陪练','ai','使用AI培训功能',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(49,'ai:marketing:view','AI营销查看','ai','查看AI营销内容',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 18:36:25.162590'),(50,'ai:marketing:use','AI营销使用','ai','使用AI营销助手',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 18:36:25.162590'),(51,'ai:analytics:view','查看AI分析','ai','查看AI人效分析',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(52,'ai:report:generate','生成AI报告','ai','生成AI诊断报告',NULL,1,'2025-11-07 18:36:25.162590','2025-11-07 21:03:08.302248'),(53,'ai:chat:all','查看所有聊天记录','ai','查看所有销售的聊天记录（管理员）',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(54,'ai:tag:view','查看AI标签','ai','查看客户AI标签',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(55,'ai:tag:edit','编辑AI标签','ai','编辑和管理AI标签',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(56,'ai:script:create','创建话术','ai','创建话术',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(57,'ai:script:edit','编辑话术','ai','编辑话术',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(58,'ai:training:view','查看培训记录','ai','查看培训记录',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(59,'ai:training:all','查看所有培训记录','ai','查看所有人的培训记录（管理员）',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(60,'ai:risk:all','查看所有风险','ai','查看所有风险预警（管理员）',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(61,'ai:report:all','查看所有报告','ai','查看所有AI报告（管理员）',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(62,'ai:analytics:all','查看全部AI数据','ai','查看所有人的AI数据（管理员）',NULL,1,'2025-11-07 21:03:08.302248','2025-11-07 21:03:08.302248'),(63,'system:ai-config','AI配置管理','system','管理AI提示词配置',NULL,1,'2025-11-12 13:22:36.476608','2025-11-12 13:22:36.476608'),(64,'customer:smart-create','智能创建客户','customer','AI智能识别创建客户',NULL,1,'2025-11-12 13:22:36.485252','2025-11-12 13:22:36.485252'),(65,'ai-chat:view','查看聊天分析','ai',NULL,NULL,1,'2025-11-12 14:25:05.954820','2025-11-12 14:25:05.954820'),(66,'ai-knowledge:view','查看知识库','ai',NULL,NULL,1,'2025-11-12 14:25:05.954820','2025-11-12 14:25:05.954820'),(67,'ai-tools:view','AI工具查看','ai',NULL,NULL,1,'2025-11-12 14:25:05.954820','2025-11-12 14:25:05.954820'),(68,'ai-marketing:use','AI营销使用','ai',NULL,NULL,1,'2025-11-12 14:25:05.954820','2025-11-12 14:25:05.954820');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,5,'2025-11-07 15:40:03.584405'),(2,1,7,'2025-11-07 15:40:03.584405'),(3,1,6,'2025-11-07 15:40:03.584405'),(4,1,2,'2025-11-07 15:40:03.584405'),(5,1,4,'2025-11-07 15:40:03.584405'),(6,1,9,'2025-11-07 15:40:03.584405'),(7,1,8,'2025-11-07 15:40:03.584405'),(8,1,10,'2025-11-07 15:40:03.584405'),(9,1,3,'2025-11-07 15:40:03.584405'),(10,1,1,'2025-11-07 15:40:03.584405'),(11,1,23,'2025-11-07 15:40:03.584405'),(12,1,22,'2025-11-07 15:40:03.584405'),(13,1,25,'2025-11-07 15:40:03.584405'),(14,1,24,'2025-11-07 15:40:03.584405'),(15,1,12,'2025-11-07 15:40:03.584405'),(16,1,14,'2025-11-07 15:40:03.584405'),(17,1,15,'2025-11-07 15:40:03.584405'),(18,1,16,'2025-11-07 15:40:03.584405'),(19,1,13,'2025-11-07 15:40:03.584405'),(20,1,11,'2025-11-07 15:40:03.584405'),(21,1,28,'2025-11-07 15:40:03.584405'),(22,1,27,'2025-11-07 15:40:03.584405'),(23,1,29,'2025-11-07 15:40:03.584405'),(24,1,26,'2025-11-07 15:40:03.584405'),(25,1,18,'2025-11-07 15:40:03.584405'),(26,1,20,'2025-11-07 15:40:03.584405'),(27,1,21,'2025-11-07 15:40:03.584405'),(28,1,19,'2025-11-07 15:40:03.584405'),(29,1,17,'2025-11-07 15:40:03.584405'),(32,2,1,'2025-11-07 15:40:03.590963'),(33,2,2,'2025-11-07 15:40:03.590963'),(34,2,3,'2025-11-07 15:40:03.590963'),(35,2,4,'2025-11-07 15:40:03.590963'),(36,2,5,'2025-11-07 15:40:03.590963'),(37,2,6,'2025-11-07 15:40:03.590963'),(38,2,7,'2025-11-07 15:40:03.590963'),(39,2,8,'2025-11-07 15:40:03.590963'),(40,2,9,'2025-11-07 15:40:03.590963'),(41,2,10,'2025-11-07 15:40:03.590963'),(42,2,11,'2025-11-07 15:40:03.590963'),(43,2,12,'2025-11-07 15:40:03.590963'),(44,2,13,'2025-11-07 15:40:03.590963'),(45,2,14,'2025-11-07 15:40:03.590963'),(46,2,15,'2025-11-07 15:40:03.590963'),(47,2,16,'2025-11-07 15:40:03.590963'),(48,2,17,'2025-11-07 15:40:03.590963'),(49,2,18,'2025-11-07 15:40:03.590963'),(50,2,19,'2025-11-07 15:40:03.590963'),(51,2,20,'2025-11-07 15:40:03.590963'),(52,2,21,'2025-11-07 15:40:03.590963'),(53,2,22,'2025-11-07 15:40:03.590963'),(54,2,23,'2025-11-07 15:40:03.590963'),(55,2,24,'2025-11-07 15:40:03.590963'),(56,2,25,'2025-11-07 15:40:03.590963'),(63,3,2,'2025-11-07 15:40:03.596668'),(64,3,8,'2025-11-07 15:40:03.596668'),(65,3,3,'2025-11-07 15:40:03.596668'),(66,3,1,'2025-11-07 15:40:03.596668'),(67,3,22,'2025-11-07 15:40:03.596668'),(68,3,12,'2025-11-07 15:40:03.596668'),(69,3,13,'2025-11-07 15:40:03.596668'),(70,3,11,'2025-11-07 15:40:03.596668'),(78,4,1,'2025-11-07 15:40:03.600968'),(79,4,23,'2025-11-07 15:40:03.600968'),(80,4,22,'2025-11-07 15:40:03.600968'),(81,4,25,'2025-11-07 15:40:03.600968'),(82,4,24,'2025-11-07 15:40:03.600968'),(83,4,11,'2025-11-07 15:40:03.600968'),(84,1,30,'2025-11-07 15:50:33.276796'),(85,1,31,'2025-11-07 15:50:33.276796'),(86,1,32,'2025-11-07 15:50:33.276796'),(87,1,33,'2025-11-07 15:50:33.276796'),(88,1,34,'2025-11-07 15:50:33.276796'),(89,1,35,'2025-11-07 15:50:33.276796'),(91,2,30,'2025-11-07 15:53:42.990521'),(92,2,31,'2025-11-07 15:53:42.990521'),(93,2,32,'2025-11-07 15:53:42.990521'),(94,2,33,'2025-11-07 15:53:42.990521'),(95,2,34,'2025-11-07 15:53:42.990521'),(96,2,35,'2025-11-07 15:53:42.990521'),(98,3,30,'2025-11-07 15:54:08.049255'),(99,3,31,'2025-11-07 15:54:08.049255'),(100,3,33,'2025-11-07 15:54:08.049255'),(101,3,32,'2025-11-07 15:54:08.049255'),(102,3,35,'2025-11-07 15:54:08.049255'),(103,1,36,'2025-11-07 18:36:25.166030'),(104,1,37,'2025-11-07 18:36:25.166030'),(105,1,38,'2025-11-07 18:36:25.166030'),(106,1,39,'2025-11-07 18:36:25.166030'),(107,1,40,'2025-11-07 18:36:25.166030'),(108,1,41,'2025-11-07 18:36:25.166030'),(109,1,42,'2025-11-07 18:36:25.166030'),(110,1,43,'2025-11-07 18:36:25.166030'),(111,1,44,'2025-11-07 18:36:25.166030'),(112,1,45,'2025-11-07 18:36:25.166030'),(113,1,46,'2025-11-07 18:36:25.166030'),(114,1,47,'2025-11-07 18:36:25.166030'),(115,1,48,'2025-11-07 18:36:25.166030'),(116,1,49,'2025-11-07 18:36:25.166030'),(117,1,50,'2025-11-07 18:36:25.166030'),(118,1,51,'2025-11-07 18:36:25.166030'),(119,1,52,'2025-11-07 18:36:25.166030'),(134,2,36,'2025-11-07 18:36:25.172623'),(135,2,37,'2025-11-07 18:36:25.172623'),(136,2,38,'2025-11-07 18:36:25.172623'),(137,2,39,'2025-11-07 18:36:25.172623'),(138,2,40,'2025-11-07 18:36:25.172623'),(139,2,41,'2025-11-07 18:36:25.172623'),(140,2,42,'2025-11-07 18:36:25.172623'),(141,2,43,'2025-11-07 18:36:25.172623'),(142,2,44,'2025-11-07 18:36:25.172623'),(143,2,45,'2025-11-07 18:36:25.172623'),(144,2,46,'2025-11-07 18:36:25.172623'),(145,2,47,'2025-11-07 18:36:25.172623'),(146,2,48,'2025-11-07 18:36:25.172623'),(147,2,49,'2025-11-07 18:36:25.172623'),(148,2,50,'2025-11-07 18:36:25.172623'),(149,2,51,'2025-11-07 18:36:25.172623'),(150,2,52,'2025-11-07 18:36:25.172623'),(165,3,37,'2025-11-07 18:36:25.177830'),(166,3,36,'2025-11-07 18:36:25.177830'),(167,3,39,'2025-11-07 18:36:25.177830'),(168,3,50,'2025-11-07 18:36:25.177830'),(169,3,49,'2025-11-07 18:36:25.177830'),(170,3,47,'2025-11-07 18:36:25.177830'),(171,3,45,'2025-11-07 18:36:25.177830'),(172,3,44,'2025-11-07 18:36:25.177830'),(173,3,43,'2025-11-07 18:36:25.177830'),(174,3,48,'2025-11-07 18:36:25.177830'),(175,3,46,'2025-11-07 21:03:08.315424'),(176,3,54,'2025-11-07 21:03:08.315424'),(177,3,58,'2025-11-07 21:03:08.315424'),(178,2,62,'2025-11-07 21:03:08.320820'),(179,2,53,'2025-11-07 21:03:08.320820'),(180,2,61,'2025-11-07 21:03:08.320820'),(181,2,60,'2025-11-07 21:03:08.320820'),(182,2,56,'2025-11-07 21:03:08.320820'),(183,2,57,'2025-11-07 21:03:08.320820'),(184,2,55,'2025-11-07 21:03:08.320820'),(185,2,54,'2025-11-07 21:03:08.320820'),(186,2,59,'2025-11-07 21:03:08.320820'),(187,2,58,'2025-11-07 21:03:08.320820'),(193,1,62,'2025-11-07 21:03:08.325235'),(194,1,53,'2025-11-07 21:03:08.325235'),(195,1,61,'2025-11-07 21:03:08.325235'),(196,1,60,'2025-11-07 21:03:08.325235'),(197,1,56,'2025-11-07 21:03:08.325235'),(198,1,57,'2025-11-07 21:03:08.325235'),(199,1,55,'2025-11-07 21:03:08.325235'),(200,1,54,'2025-11-07 21:03:08.325235'),(201,1,59,'2025-11-07 21:03:08.325235'),(202,1,58,'2025-11-07 21:03:08.325235'),(203,1,64,'2025-11-12 14:21:43.122755'),(204,1,63,'2025-11-12 14:21:43.122755'),(206,1,65,'2025-11-12 14:25:05.966924'),(207,1,66,'2025-11-12 14:25:05.966924'),(208,1,68,'2025-11-12 14:25:05.966924'),(209,1,67,'2025-11-12 14:25:05.966924');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f6d54f95c31b73fb1bdd8e91d0` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','系统管理员','拥有系统所有权限',1,'2025-11-07 15:40:03.454563','2025-11-07 15:40:03.454563'),(2,'sales_manager','销售主管','销售团队管理',1,'2025-11-07 15:40:03.454563','2025-11-07 15:40:03.454563'),(3,'sales','销售顾问','客户跟进与订单处理',1,'2025-11-07 15:40:03.454563','2025-11-07 15:40:03.454563'),(4,'finance','财务人员','财务数据查看与报表',1,'2025-11-07 15:40:03.454563','2025-11-07 15:40:03.454563'),(5,'teacher','授课老师','查看课程与学员信息',1,'2025-11-07 15:40:03.454563','2025-11-07 15:40:03.454563');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_target`
--

DROP TABLE IF EXISTS `sales_target`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_target` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_amount` decimal(12,2) NOT NULL,
  `actual_amount` decimal(12,2) NOT NULL,
  `target_count` int NOT NULL,
  `actual_count` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `remark` text COLLATE utf8mb4_unicode_ci,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_target`
--

LOCK TABLES `sales_target` WRITE;
/*!40000 ALTER TABLE `sales_target` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_target` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_campus`
--

DROP TABLE IF EXISTS `user_campus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_campus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `campus_id` int NOT NULL,
  `is_primary` tinyint NOT NULL DEFAULT '0',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_e7ab83d22c8321093b7aec956c1` (`user_id`),
  CONSTRAINT `FK_e7ab83d22c8321093b7aec956c1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_campus`
--

LOCK TABLES `user_campus` WRITE;
/*!40000 ALTER TABLE `user_campus` DISABLE KEYS */;
INSERT INTO `user_campus` VALUES (67,2,1,1,'2025-11-10 16:16:39.237917'),(68,2,2,0,'2025-11-10 16:16:39.237917'),(69,2,3,0,'2025-11-10 16:16:39.237917'),(70,2,4,0,'2025-11-10 16:16:39.237917'),(71,3,1,1,'2025-11-10 16:16:39.237917'),(72,4,1,1,'2025-11-10 16:16:39.237917'),(73,5,1,1,'2025-11-10 16:16:39.237917'),(74,6,2,1,'2025-11-10 16:16:39.237917'),(75,7,2,1,'2025-11-10 16:16:39.237917'),(76,8,1,1,'2025-11-10 16:16:39.237917'),(77,8,2,0,'2025-11-10 16:16:39.237917');
/*!40000 ALTER TABLE `user_campus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `campus_id` int DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `last_login_time` datetime DEFAULT NULL,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `superior_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
  KEY `FK_a2cecd1a3531c0b041e29ba46e1` (`role_id`),
  CONSTRAINT `FK_a2cecd1a3531c0b041e29ba46e1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC','系统管理员','13800138000','admin@example.com',1,NULL,NULL,NULL,1,'2025-11-19 14:01:46','2025-11-07 15:40:03.463167','2025-11-19 14:01:45.000000',NULL),(2,'sales_director','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','张总监','13800000001','director@test.com',2,1,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(3,'sales_manager1','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','李经理','13800000002','manager1@test.com',2,5,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(4,'sales1','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','王销售','13800000003','sales1@test.com',3,5,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(5,'sales2','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','赵销售','13800000004','sales2@test.com',3,5,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(6,'sales3','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','刘销售','13800000005','sales3@test.com',3,6,2,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(7,'sales4','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','陈销售','13800000006','sales4@test.com',3,6,2,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(8,'marketing1','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','周市场','13800000007','marketing1@test.com',3,2,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(9,'service1','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','吴客服','13800000008','service1@test.com',3,4,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL),(10,'teacher1','$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J','郑老师','13800000009','teacher1@test.com',3,3,1,NULL,1,NULL,'2025-11-10 16:16:39.232567','2025-11-10 16:16:39.232567',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-19 18:20:25
