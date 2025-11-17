# 知识库集成补丁说明

**创建时间**: 2025-01-15
**状态**: 待手动应用

---

## 补丁1: AI分析报告集成知识库

**文件**: `backend/src/modules/ai-tools/ai-tools.service.ts`

### 1.1 添加导入
在文件顶部添加：
```typescript
import { KnowledgeIntegrationService } from '../enterprise-knowledge/knowledge-integration.service';
```

### 1.2 修改constructor
在constructor中注入KnowledgeIntegrationService：
```typescript
constructor(
  // ... 现有依赖保持不变
  private readonly knowledgeIntegrationService: KnowledgeIntegrationService,  // 新增
) {}
```

### 1.3 修改collectKeyMetrics方法
在`collectKeyMetrics`方法中添加知识库使用统计（约953行附近）：
```typescript
private async collectKeyMetrics(report: AiReport) {
  try {
    // ... 现有代码保持不变

    // 新增：7. 知识库使用统计
    const knowledgeUsageStats = await this.knowledgeIntegrationService
      .queryKnowledgeForAnalysis({
        topic: '客户分析报告',
        category: 'analysis',
      });

    const knowledgeUsageCount = knowledgeUsageStats?.length || 0;

    return {
      totalCustomers,
      newCustomers,
      highQualityLeads,
      conversionRate,
      avgResponseTime,
      aiUsageCount,
      customerSatisfaction,
      knowledgeUsageCount,  // 新增
      knowledgeReference: knowledgeUsageStats?.map(k => ({  // 新增
        id: k.id,
        title: k.title,
        category: k.sceneCategory,
      })).slice(0, 5),  // 取前5个作为参考
    };
  } catch (error) {
    // ... 错误处理
  }
}
```

### 1.4 修改Module配置
**文件**: `backend/src/modules/ai-tools/ai-tools.module.ts`

添加导入：
```typescript
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';

@Module({
  imports: [
    // ... 现有imports
    EnterpriseKnowledgeModule,  // 新增
  ],
  // ... 其他配置
})
```

---

## 补丁2: AI推荐内容集成知识库

**文件**: `backend/src/modules/ai-marketing/ai-marketing.service.ts`（如果存在）

### 2.1 添加导入
```typescript
import { KnowledgeIntegrationService } from '../enterprise-knowledge/knowledge-integration.service';
```

### 2.2 修改constructor
```typescript
constructor(
  // ... 现有依赖
  private readonly knowledgeIntegrationService: KnowledgeIntegrationService,  // 新增
) {}
```

### 2.3 修改推荐逻辑
在生成推荐内容的方法中添加：
```typescript
async generateRecommendations(customerId: number) {
  // 新增：优先获取知识库推荐内容
  const knowledgeRecommendations = await this.knowledgeIntegrationService
    .queryKnowledgeForRecommendation({
      customerId,
    });

  // 基于知识库内容生成推荐
  // ... 现有逻辑
}
```

### 2.4 修改Module配置
**文件**: `backend/src/modules/ai-marketing/ai-marketing.module.ts`

```typescript
import { EnterpriseKnowledgeModule } from '../enterprise-knowledge/enterprise-knowledge.module';

@Module({
  imports: [
    // ... 现有imports
    EnterpriseKnowledgeModule,  // 新增
  ],
  // ... 其他配置
})
```

---

## 补丁3: 前端知识搜索页面添加反馈按钮

**位置**: 前端知识搜索结果页面（Vue/React）

### 3.1 添加反馈按钮
```vue
<template>
  <div class="knowledge-search-results">
    <div v-for="knowledge in searchResults" :key="knowledge.id" class="knowledge-item">
      <h3>{{ knowledge.title }}</h3>
      <p>{{ knowledge.content }}</p>
      <div class="knowledge-meta">
        <span>分类: {{ knowledge.sceneCategory }}</span>
        <span>使用次数: {{ knowledge.usageCount }}</span>
      </div>

      <!-- 新增：反馈按钮 -->
      <div class="feedback-actions">
        <button @click="submitPositiveFeedback(knowledge.id)" class="btn-positive">
          满意
        </button>
        <button @click="showFeedbackDialog(knowledge.id)" class="btn-negative">
          不满意，反馈
        </button>
      </div>
    </div>
  </div>

  <!-- 反馈对话框 -->
  <el-dialog v-model="feedbackDialogVisible" title="提交反馈">
    <el-form :model="feedbackForm">
      <el-form-item label="反馈原因">
        <el-input
          v-model="feedbackForm.feedbackReason"
          type="textarea"
          placeholder="请说明为什么不满意..."
        />
      </el-form-item>
      <el-form-item label="期望答案（可选）">
        <el-input
          v-model="feedbackForm.expectedAnswer"
          type="textarea"
          placeholder="您期望的答案是..."
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="feedbackDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitNegativeFeedback">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const feedbackDialogVisible = ref(false);
const currentKnowledgeId = ref(null);
const feedbackForm = ref({
  feedbackReason: '',
  expectedAnswer: '',
});

// 显示反馈对话框
function showFeedbackDialog(knowledgeId) {
  currentKnowledgeId.value = knowledgeId;
  feedbackDialogVisible.value = true;
  feedbackForm.value = {
    feedbackReason: '',
    expectedAnswer: '',
  };
}

// 提交负面反馈
async function submitNegativeFeedback() {
  try {
    await axios.post('/api/enterprise-knowledge/feedback/submit', {
      knowledgeId: currentKnowledgeId.value,
      feedbackScene: 'knowledge_search',
      userQuestion: '搜索查询', // 从搜索框获取
      knowledgeAnswer: '...', // 从knowledge对象获取
      feedbackReason: feedbackForm.value.feedbackReason,
      expectedAnswer: feedbackForm.value.expectedAnswer,
    });

    ElMessage.success('反馈已提交，感谢您的宝贵意见！');
    feedbackDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('反馈提交失败');
  }
}

// 提交正面反馈（可选）
async function submitPositiveFeedback(knowledgeId) {
  // 可以调用相同的API，但satisfied=true
  ElMessage.success('感谢您的反馈！');
}
</script>
```

---

## 补丁4: 初始化更多行业问题数据

**文件**: `backend/database/migrations/007_init_more_industry_questions.sql`

```sql
-- 金融行业常见问题（50条）
INSERT INTO industry_question_library (industry, question, answer, category, importance, tags, source_type) VALUES
('金融', '如何开通网上银行？', '您可以通过以下三种方式开通网上银行：1. 通过我行官网自助注册；2. 携带身份证和银行卡到任意网点柜台办理；3. 通过手机银行APP在线开通。开通后即可享受24小时在线转账、理财等服务。', '开户服务', 'high', '网上银行,开户', 'preset'),
('金融', '信用卡额度如何提升？', '信用卡额度提升需要满足以下条件：1. 持卡满6个月；2. 良好的还款记录；3. 经常使用信用卡消费；4. 收入证明提升。您可以通过手机银行APP或致电客服申请额度调整。', '信用卡服务', 'medium', '信用卡,额度', 'preset'),
('金融', '如何办理贷款？', '办理贷款需要准备：1. 身份证明；2. 收入证明；3. 征信报告；4. 抵押物证明（如房产证）。您可以通过手机银行APP预约，我们会有专员联系您办理。', '贷款服务', 'high', '贷款,申请', 'preset'),
-- ... 更多金融行业问题

-- 医疗行业常见问题（50条）
INSERT INTO industry_question_library (industry, question, answer, category, importance, tags, source_type) VALUES
('医疗', '如何预约挂号？', '您可以通过以下方式预约挂号：1. 微信公众号在线预约；2. 支付宝生活号预约；3. 拨打预约电话；4. 现场自助机挂号。建议提前1-7天预约。', '就医指南', 'high', '挂号,预约', 'preset'),
('医疗', '医保如何报销？', '医保报销流程：1. 就诊时出示医保卡；2. 费用自动结算，个人只需支付自费部分；3. 如需事后报销，请保存发票和病历，到医保窗口办理。', '医保服务', 'high', '医保,报销', 'preset'),
-- ... 更多医疗行业问题

-- 零售行业常见问题（50条）
INSERT INTO industry_question_library (industry, question, answer, category, importance, tags, source_type) VALUES
('零售', '如何办理会员卡？', '办理会员卡非常简单：1. 关注我们的微信公众号；2. 点击"会员中心"；3. 填写手机号验证；4. 即可获得电子会员卡。首次办卡还有专属优惠哦！', '会员服务', 'high', '会员,办卡', 'preset'),
('零售', '退换货政策是什么？', '我们支持7天无理由退换货：1. 商品未使用且包装完好；2. 保留购物小票；3. 到店或联系客服办理；4. 部分特价商品除外。具体以商品详情页说明为准。', '售后服务', 'high', '退换货,售后', 'preset'),
-- ... 更多零售行业问题

-- IT/软件行业常见问题（50条）
INSERT INTO industry_question_library (industry, question, answer, category, importance, tags, source_type) VALUES
('IT/软件', '如何重置密码？', '重置密码步骤：1. 点击登录页面的"忘记密码"；2. 输入注册邮箱或手机号；3. 接收验证码；4. 设置新密码。如遇问题请联系技术支持。', '账户管理', 'high', '密码,重置', 'preset'),
('IT/软件', '软件如何升级？', '软件升级方法：1. 打开软件，点击"检查更新"；2. 确认升级版本信息；3. 点击"立即升级"；4. 等待下载安装完成。建议开启自动升级功能。', '技术支持', 'medium', '升级,更新', 'preset'),
-- ... 更多IT行业问题
```

---

## 补丁5: 示例知识库数据

**文件**: `backend/database/migrations/008_init_sample_knowledge_data.sql`

```sql
-- 教育行业示例知识库（50-100条）
INSERT INTO enterprise_knowledge_base (
  title, content, keywords, scene_category, product_category,
  customer_type, question_type, priority, source_type, status
) VALUES
('收费标准-一对一辅导', '我们的一对一辅导收费标准如下：小学150元/小时，初中200元/小时，高中250元/小时。购买套餐课程可享受8-9折优惠。首次体验课仅需99元，可免费测评学习情况。', '收费,价格,一对一', '产品介绍', '一对一辅导', '潜在客户', '咨询', 90, 'manual', 'active'),
('上课时间安排', '我们的上课时间非常灵活：周一至周五晚上18:00-21:00，周末全天8:00-20:00。您可以根据孩子的时间自由选择，支持临时调课（需提前24小时）。', '时间,上课,安排', '产品介绍', '课程服务', '潜在客户', '咨询', 85, 'manual', 'active'),
('师资力量介绍', '我们的老师均来自重点学校，拥有5年以上教学经验。所有老师经过严格筛选和培训，持证上岗。您可以免费试听，不满意随时更换老师。', '老师,师资,教师', '产品介绍', '师资服务', '潜在客户', '咨询', 95, 'manual', 'active'),
-- ... 更多示例数据

-- 多场景覆盖
('退费政策说明', '我们承诺透明退费：未上课程可全额退款，已上课程按实际消耗扣除，其余部分7个工作日内退回。退费无需任何理由，保障您的权益。', '退费,退款,政策', '售后服务', '售后政策', '现有客户', '投诉', 80, 'manual', 'active'),
('试听课安排', '试听课流程：1. 预约时间；2. 免费学情测评（30分钟）；3. 正式试听课（60分钟）；4. 课后反馈和学习方案。整个过程完全免费，无任何强制消费。', '试听,体验,免费', '营销活动', '体验课', '潜在客户', '咨询', 90, 'manual', 'active'),
-- ... 更多示例数据
```

---

## 应用顺序

1. ✅ **补丁1 & 2**: 后端集成（AI分析报告、AI推荐）- **优先级：中**
2. ✅ **补丁3**: 前端反馈按钮 - **优先级：中**
3. ✅ **补丁4 & 5**: 数据初始化 - **优先级：低**

---

## 注意事项

1. 应用补丁1和2时，需要重启后端服务
2. 确保EnterpriseKnowledgeModule已正确导出KnowledgeIntegrationService
3. 前端补丁需要根据实际使用的前端框架（Vue/React）进行调整
4. 数据初始化SQL需要根据实际行业需求补充完整

---

**状态**: 补丁文档已创建，等待手动应用

