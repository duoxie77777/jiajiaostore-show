<template>
  <div class="empty-state">
    <div class="empty-icon">
      <van-icon name="search" size="48" />
    </div>
    <h3 class="empty-title">暂无匹配的家教订单</h3>
    <p class="empty-desc">试试调整筛选条件或清空筛选</p>
    <button class="reset-btn" @click="$emit('reset')">
      <van-icon name="replay" />
      <span>重置筛选</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['reset'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 24px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}
</style>
