# 🎬 全站动效系统使用指南

## 🌟 已实现的动感优化

### 1. **页面路由过渡动画** ✅
所有页面切换时自动应用流畅过渡效果：
- fade-slide（默认）- 淡入+横向滑动
- scale - 缩放过渡
- slide-up - 向上滑动
- flip - 翻转效果

### 2. **全局背景动效** ✅
主内容区自动应用：
- 波浪背景（15s/20s循环）
- 粒子飘动效果（8s循环）

### 3. **丰富的动效类库** ✅
位置：`frontend/src/styles/animations.scss`

包含40+动效类，可直接在HTML上使用class！

## 📚 动效类使用示例

### 卡片类动效

```vue
<!-- 3D倾斜卡片 -->
<el-card class="card-3d">
  <div class="card-3d-shine"></div>
  内容...
</el-card>

<!-- 悬浮弹跳 -->
<el-card class="hover-bounce">
  鼠标悬停时会弹跳
</el-card>

<!-- 脉冲光晕 -->
<el-card class="pulse-glow">
  悬停时会有黄色光晕脉冲
</el-card>
```

### 列表动效

```vue
<template>
  <div>
    <!-- 添加stagger-item类 -->
    <el-card
      v-for="item in list"
      :key="item.id"
      class="stagger-item"
    >
      {{ item.name }}
    </el-card>
  </div>
</template>

<script setup>
import { useStaggerAnimation } from '@/composables/usePageAnimation'

// 自动应用交错进入动画（50ms延迟）
useStaggerAnimation('.stagger-item', 50)
</script>
```

### 滚动渐现

```vue
<template>
  <div>
    <section class="scroll-reveal">
      滚动到视口时才出现
    </section>
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/usePageAnimation'

useScrollReveal('.scroll-reveal')
</script>
```

### 按钮动效

```vue
<!-- 波纹效果 -->
<el-button class="btn-ripple">点击看波纹</el-button>

<!-- 摇晃效果 -->
<el-button class="btn-shake">悬停会摇晃</el-button>

<!-- 呼吸效果 -->
<el-button class="btn-breathe">持续呼吸动画</el-button>
```

### 文字动效

```vue
<!-- 渐变色文字 -->
<h1 class="gradient-text">会变色的标题</h1>

<!-- 霓虹灯效果 -->
<span class="neon-glow">霓虹灯闪烁</span>

<!-- 打字效果 -->
<p class="typing-text">打字机效果</p>
```

### 加载动效

```vue
<!-- 骨架屏 -->
<div class="skeleton" style="height: 100px"></div>

<!-- 旋转加载 -->
<div class="spinner"></div>

<!-- 点点加载 -->
<div class="dots-loading">
  <span></span>
  <span></span>
  <span></span>
</div>
```

## 🎯 高级Composable

### 3D卡片鼠标跟随

```vue
<script setup>
import { use3DCardTilt } from '@/composables/usePageAnimation'

// 自动为所有.card-3d元素添加鼠标跟随3D效果
use3DCardTilt('.card-3d')
</script>
```

### 数字滚动计数

```vue
<template>
  <div>
    <h2>{{ current }}</h2>
  </div>
</template>

<script setup>
import { useCountUp } from '@/composables/usePageAnimation'

// 从0滚动到12345，持续2秒
const { current } = useCountUp(12345, 2000)
</script>
```

### 磁吸效果

```vue
<template>
  <el-button class="magnetic">
    鼠标靠近会被吸引
  </el-button>
</template>

<script setup>
import { useMagneticEffect } from '@/composables/usePageAnimation'

useMagneticEffect('.magnetic')
</script>
```

## 🎨 推荐使用PageContainer

所有页面推荐使用PageContainer包装，自动获得：
- 波浪背景
- 页面进入动画
- 标题渐变效果
- 统一间距

```vue
<template>
  <PageContainer title="客户列表" description="管理所有客户信息">
    <template #extra>
      <el-button type="primary">新增客户</el-button>
    </template>

    <!-- 页面内容 -->
    <el-card class="stagger-item">...</el-card>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer.vue'
import { useStaggerAnimation } from '@/composables/usePageAnimation'

useStaggerAnimation('.stagger-item', 50)
</script>
```

## 🚀 性能优化建议

1. **大列表使用虚拟滚动** - 不要对超过100项的列表使用stagger动画
2. **使用GPU加速** - 为动画元素添加`gpu-accelerated`类
3. **避免同时启用太多粒子** - particle-background已优化为2个粒子
4. **使用will-change** - 已自动应用于关键动画元素

## 📊 全站已自动应用

- ✅ 页面路由过渡（App.vue）
- ✅ 主内容区波浪+粒子背景（DefaultLayout）
- ✅ 工作台所有卡片入场动画（workspace/Index.vue）
- ✅ 所有按钮悬停上移3px（element-plus-override.scss）
- ✅ 所有表格行悬停动效（element-plus-override.scss）
- ✅ 所有输入框focus光晕（element-plus-override.scss）
- ✅ 所有卡片悬停动效（element-plus-override.scss）
- ✅ 空状态浮动动画（element-plus-override.scss）
- ✅ 加载动画增强（element-plus-override.scss）

## 🎁 现在只需3步让任何页面充满动感：

### 步骤1：使用PageContainer包装
```vue
<PageContainer title="页面标题">
  <!-- 内容 -->
</PageContainer>
```

### 步骤2：为列表项添加class
```vue
<el-card
  v-for="item in list"
  class="stagger-item hover-bounce pulse-glow"
>
```

### 步骤3：在script中启用动画
```vue
<script setup>
import { useStaggerAnimation, use3DCardTilt } from '@/composables/usePageAnimation'

useStaggerAnimation('.stagger-item', 50)
use3DCardTilt('.hover-bounce')
</script>
```

完成！你的页面现在充满2024现代动感！🎉
