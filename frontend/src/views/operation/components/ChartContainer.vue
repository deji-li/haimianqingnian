<template>
  <div class="chart-container">
    <div v-if="loading" class="chart-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div
      v-else
      ref="chartRef"
      class="chart-content"
      :style="{ height: height }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface Props {
  options: any
  height?: string
  loading?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  theme: 'light'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) return

  await nextTick()
  chartInstance = echarts.init(chartRef.value, props.theme)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.options) return
  chartInstance.setOption(props.options, true)
}

// 响���式处理
const handleResize = () => {
  chartInstance?.resize()
}

// 监听options变化
watch(
  () => props.options,
  () => {
    updateChart()
  },
  { deep: true }
)

// 监听loading变化
watch(
  () => props.loading,
  (newVal) => {
    if (newVal) {
      chartInstance?.showLoading()
    } else {
      chartInstance?.hideLoading()
      updateChart()
    }
  }
)

// 暴露图表实例
defineExpose({
  getInstance: () => chartInstance
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  width: 100%;
}
</style>