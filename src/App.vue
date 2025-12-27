<template>
  <div class="app-container">
    <router-view v-if="!initializing" />
    <div v-else class="loading-container">
      <van-loading size="24px" color="#3B82F6">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from './stores/admin'
import { Loading as VanLoading } from 'vant'

const adminStore = useAdminStore()
const initializing = ref(true)

// 应用启动时检查登录状态
onMounted(async () => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    // 有 token，尝试恢复登录状态
    await adminStore.checkAuth()
  }
  initializing.value = false
})
</script>

<style>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
</style>
