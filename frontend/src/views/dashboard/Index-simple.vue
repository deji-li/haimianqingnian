<template>
  <div class="dashboard-container">
    <h2>数据分析看板</h2>
    <p>这是一个简化的看板页面</p>
    <el-button @click="testClick">测试按钮</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const testClick = () => {
  console.log('Dashboard test clicked')
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
</style>