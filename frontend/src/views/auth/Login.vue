<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>海绵青年工作管理系统</h1>
        <p>Sponge Youth Work Management System</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 动态背景元素 -->
    <div class="bg-animation">
      <!-- SVG连接线画布 -->
      <svg class="connection-lines" xmlns="http://www.w3.org/2000/svg">
        <line class="line line-1" x1="10%" y1="10%" x2="70%" y2="20%"></line>
        <line class="line line-2" x1="80%" y1="60%" x2="15%" y2="80%"></line>
        <line class="line line-3" x1="70%" y1="20%" x2="85%" y2="40%"></line>
        <line class="line line-4" x1="10%" y1="10%" x2="15%" y2="80%"></line>
        <line class="line line-5" x1="85%" y1="40%" x2="15%" y2="80%"></line>
        <line class="line line-6" x1="15%" y1="15%" x2="25%" y2="60%"></line>
      </svg>

      <!-- 圆形元素 -->
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-4"></div>
      <div class="circle circle-5"></div>
      <div class="circle circle-6"></div>
      <div class="circle circle-7"></div>
      <div class="circle circle-8"></div>

      <!-- 方形元素 -->
      <div class="square square-1"></div>
      <div class="square square-2"></div>
      <div class="square square-3"></div>
      <div class="square square-4"></div>
      <div class="square square-5"></div>

      <!-- 三角形元素 -->
      <div class="triangle triangle-1"></div>
      <div class="triangle triangle-2"></div>
      <div class="triangle triangle-3"></div>

      <!-- 星形元素 -->
      <div class="star star-1">★</div>
      <div class="star star-2">★</div>
      <div class="star star-3">★</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #FFB800 0%, #FF9800 100%);
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 26px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .login-button {
    width: 100%;
    font-size: 16px;
    font-weight: 500;
  }
}

// 动态背景动画
.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
}

// SVG连接线
.connection-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
}

.line {
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 2;
  stroke-dasharray: 10, 5;
  animation: dash 20s linear infinite, pulse 3s ease-in-out infinite;
}

.line-1 { animation-delay: 0s; }
.line-2 { animation-delay: 1s; }
.line-3 { animation-delay: 2s; }
.line-4 { animation-delay: 3s; }
.line-5 { animation-delay: 4s; }
.line-6 { animation-delay: 5s; }

@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}

@keyframes pulse {
  0%, 100% {
    stroke-width: 1;
    opacity: 0.3;
  }
  50% {
    stroke-width: 3;
    opacity: 0.8;
  }
}

// 圆形元素
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
  background: rgba(255, 255, 255, 0.25);
  animation-duration: 15s;
}

.circle-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  left: 80%;
  background: rgba(255, 255, 255, 0.15);
  animation-delay: 2s;
  animation-duration: 18s;
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 80%;
  left: 15%;
  background: rgba(255, 255, 255, 0.2);
  animation-delay: 4s;
  animation-duration: 20s;
}

.circle-4 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 70%;
  background: rgba(255, 255, 255, 0.18);
  animation-delay: 1s;
  animation-duration: 16s;
}

.circle-5 {
  width: 180px;
  height: 180px;
  top: 40%;
  left: 85%;
  background: rgba(255, 255, 255, 0.12);
  animation-delay: 3s;
  animation-duration: 22s;
}

.circle-6 {
  width: 90px;
  height: 90px;
  top: 5%;
  left: 50%;
  background: rgba(255, 255, 255, 0.22);
  animation-delay: 5s;
  animation-duration: 19s;
}

.circle-7 {
  width: 110px;
  height: 110px;
  bottom: 10%;
  left: 60%;
  background: rgba(255, 255, 255, 0.17);
  animation-delay: 6s;
  animation-duration: 21s;
}

.circle-8 {
  width: 70px;
  height: 70px;
  top: 35%;
  left: 25%;
  background: rgba(255, 255, 255, 0.19);
  animation-delay: 7s;
  animation-duration: 17s;
}

// 方形元素
.square {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
  animation: rotate 25s infinite linear;
}

.square-1 {
  width: 100px;
  height: 100px;
  top: 15%;
  right: 15%;
  background: rgba(255, 255, 255, 0.2);
}

.square-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  right: 25%;
  background: rgba(255, 255, 255, 0.18);
  animation-delay: 2s;
  animation-duration: 20s;
}

.square-3 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: 5%;
  background: rgba(255, 255, 255, 0.12);
  animation-delay: 4s;
  animation-duration: 30s;
}

.square-4 {
  width: 90px;
  height: 90px;
  bottom: 30%;
  left: 40%;
  background: rgba(255, 255, 255, 0.16);
  animation-delay: 6s;
  animation-duration: 28s;
}

.square-5 {
  width: 70px;
  height: 70px;
  top: 70%;
  right: 40%;
  background: rgba(255, 255, 255, 0.14);
  animation-delay: 8s;
  animation-duration: 24s;
}

// 三角形元素
.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 87px solid rgba(255, 255, 255, 0.15);
  animation: spin 20s infinite linear;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.triangle-1 {
  top: 25%;
  left: 30%;
  animation-duration: 25s;
}

.triangle-2 {
  bottom: 35%;
  right: 35%;
  animation-delay: 3s;
  animation-duration: 22s;
  border-bottom-color: rgba(255, 255, 255, 0.18);
}

.triangle-3 {
  top: 65%;
  left: 70%;
  animation-delay: 6s;
  animation-duration: 28s;
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

// 星形元素
.star {
  position: absolute;
  font-size: 40px;
  color: rgba(255, 255, 255, 0.25);
  animation: twinkle 3s infinite ease-in-out, float 15s infinite ease-in-out;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.star-1 {
  top: 12%;
  right: 30%;
  font-size: 50px;
}

.star-2 {
  bottom: 25%;
  left: 20%;
  font-size: 35px;
  animation-delay: 1s;
}

.star-3 {
  top: 55%;
  right: 10%;
  font-size: 45px;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.5;
  }
  25% {
    transform: translateY(-40px) translateX(30px);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-80px) translateX(-30px);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-40px) translateX(-50px);
    opacity: 0.7;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: rotate(180deg) scale(1.3);
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg) translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: rotate(180deg) translateY(-20px);
    opacity: 0.7;
  }
  100% {
    transform: rotate(360deg) translateY(0);
    opacity: 0.4;
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.3);
  }
}
</style>
