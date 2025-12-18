<template>
  <div class="login-page">
    <!-- 头部装饰 -->
    <div class="header-bg">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="brand-content">
        <div class="brand-icon">
          <van-icon name="bookmark-o" size="32" />
        </div>
        <h1>家教信息平台</h1>
        <p>后台管理系统</p>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h2>管理员登录</h2>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper" :class="{ focused: usernameFocused }">
            <van-icon name="user-o" class="input-icon" />
            <input 
              v-model="username" 
              type="text" 
              placeholder="请输入用户名"
              @focus="usernameFocused = true"
              @blur="usernameFocused = false"
              @keyup.enter="handleLogin"
            />
          </div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper" :class="{ focused: passwordFocused }">
            <van-icon name="lock" class="input-icon" />
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="请输入密码"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false"
              @keyup.enter="handleLogin"
            />
            <van-icon 
              :name="showPassword ? 'eye-o' : 'closed-eye'" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            />
          </div>
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <van-loading v-if="loading" size="20" color="#fff" />
          <span v-else>登 录</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/admin'
import { showToast } from 'vant'

const router = useRouter()
const adminStore = useAdminStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const usernameFocused = ref(false)
const passwordFocused = ref(false)

function handleLogin() {
  if (!username.value) {
    showToast('请输入用户名')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }

  loading.value = true
  
  // 模拟登录延迟
  setTimeout(() => {
    const result = adminStore.login(username.value, password.value)
    loading.value = false
    
    if (result.success) {
      showToast('登录成功')
      router.replace('/back')
    } else {
      showToast(result.message)
    }
  }, 500)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 头部装饰 */
.header-bg {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  padding: 48px 24px 80px;
  position: relative;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50%;
  right: -20%;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30%;
  left: -10%;
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}

.brand-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  backdrop-filter: blur(10px);
}

.brand-content h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
  letter-spacing: 1px;
}

.brand-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* 登录卡片 */
.login-card {
  background: #fff;
  margin: -40px 16px 0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.login-form {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  transition: all 0.2s;
}

.input-wrapper.focused {
  border-color: #3B82F6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #999;
  font-size: 18px;
}

.input-wrapper.focused .input-icon {
  color: #3B82F6;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 44px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #bbb;
}

.toggle-password {
  position: absolute;
  right: 14px;
  color: #999;
  font-size: 18px;
  cursor: pointer;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
