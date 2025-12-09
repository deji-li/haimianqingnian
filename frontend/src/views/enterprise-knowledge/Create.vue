<template>
  <div class="enterprise-knowledge-create">
    <div class="page-header">
      <h2>创建企业知识库</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <div class="create-content">
      <CreateKnowledgeForm @success="handleCreateSuccess" @cancel="goBack" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CreateKnowledgeForm from '@/views/ai/components/CreateKnowledgeForm.vue'

const router = useRouter()

const goBack = () => {
  router.push('/ai/enterprise-knowledge/management')
}

const handleCreateSuccess = (result: any) => {
  ElMessage.success('知识库创建成功')
  router.push('/ai/enterprise-knowledge/management')
}
</script>

<style lang="scss" scoped>
.enterprise-knowledge-create {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .create-content {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>