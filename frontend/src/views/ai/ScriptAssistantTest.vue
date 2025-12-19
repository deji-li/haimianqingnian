<template>
  <div class="script-assistant-test">
    <h1>AI话术助手测试页面</h1>
    <p>如果你能看到这个页面，说明路由配置正常</p>
    <el-button type="primary">测试按钮</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('AI话术助手测试页��已加载')
})
</script>

<style scoped>
.script-assistant-test {
  padding: 20px;
  text-align: center;
}
</style>