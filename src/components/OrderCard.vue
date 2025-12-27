<template>
  <div class="order-card" :style="{ animationDelay: `${index * 0.05}s` }">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <span class="order-date">{{ order.date }}</span>
        <span class="order-id">#{{ order.id }}</span>
      </div>
      <div class="header-right">
        <button 
          class="copy-btn" 
          :class="{ copied: copyOrderSuccess }"
          @click="handleCopyOrder"
        >
          <van-icon :name="copyOrderSuccess ? 'success' : 'description'" />
          <span>{{ copyOrderSuccess ? '已复制' : '复制' }}</span>
        </button>
      </div>
    </div>
    
    <!-- 标题 -->
    <h3 class="order-title">{{ order.title }}</h3>
    
    <!-- 科目标签 -->
    <div class="subject-tags">
      <span 
        v-for="subject in order.subjects" 
        :key="subject"
        class="subject-tag"
        :class="getSubjectClass(subject)"
      >
        {{ subject }}
      </span>
      <span class="grade-tag">{{ order.grade }}</span>
    </div>
    
    <!-- 详情信息 -->
    <div class="order-details">
      <!-- 地址 -->
      <div class="detail-item address-item">
        <div class="detail-icon">
          <van-icon name="location-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">地址</span>
          <span class="detail-value">{{ order.address }}</span>
        </div>
        <div class="detail-actions">
          <button 
            class="action-btn" 
            :class="{ copied: copyAddressSuccess }"
            @click="handleCopyAddress"
          >
            <van-icon :name="copyAddressSuccess ? 'success' : 'description-o'" size="16" />
          </button>
          <button class="action-btn map-btn" @click="handleOpenMap">
            <van-icon name="guide-o" size="16" />
          </button>
        </div>
      </div>
      
      <!-- 学校 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="shop-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">学校</span>
          <span class="detail-value">{{ order.school || '-' }}</span>
        </div>
      </div>
      
      <!-- 成绩 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="chart-trending-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">平时分数</span>
          <span class="detail-value score">{{ order.score || '-' }}</span>
        </div>
      </div>
      
      <!-- 频率 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="clock-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">上课频率</span>
          <span class="detail-value">{{ order.frequency || '-' }}</span>
        </div>
      </div>
      
      <!-- 可选时间 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="calendar-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">可选时间</span>
          <div class="time-tags" v-if="order.availableTimesText || (order.availableTimes && order.availableTimes.length > 0)">
            <!-- 优先显示文本字段 -->
            <span v-if="order.availableTimesText" class="time-text">
              {{ order.availableTimesText }}
            </span>
            <!-- 兼容旧的数组字段 -->
            <span v-else v-for="time in order.availableTimes" :key="time" class="time-tag">
              {{ time }}
            </span>
          </div>
          <span v-else class="time-text">-</span>
        </div>
      </div>
      
      <!-- 价格 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="gold-coin-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">到手价</span>
          <span class="detail-value">{{ order.price || '-' }}</span>
        </div>
      </div>
      
      <!-- 教师类型 -->
      <div class="detail-item">
        <div class="detail-icon">
          <van-icon name="user-o" />
        </div>
        <div class="detail-content">
          <span class="detail-label">教师要求</span>
          <span class="detail-value teacher-type">{{ order.teacherType || '-' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 备注 -->
    <div class="order-note" v-if="order.note">
      <div class="note-label">
        <van-icon name="info-o" />
        <span>备注</span>
      </div>
      <p class="note-content">{{ order.note }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { copyToClipboard, formatOrderForCopy } from '../utils/clipboard'
import { openMapNavigation } from '../utils/map'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

// 复制状态
const copyOrderSuccess = ref(false)
const copyAddressSuccess = ref(false)

// 获取科目样式类
function getSubjectClass(subject) {
  const classMap = {
    '语文': 'chinese',
    '数学': 'math',
    '英语': 'english',
    '物理': 'physics',
    '化学': 'chemistry',
    '生物': 'biology',
    '历史': 'history',
    '地理': 'geography',
    '政治': 'politics'
  }
  return classMap[subject] || 'default'
}

// 复制整个订单
async function handleCopyOrder() {
  const text = formatOrderForCopy(props.order)
  const success = await copyToClipboard(text)
  if (success) {
    copyOrderSuccess.value = true
    setTimeout(() => {
      copyOrderSuccess.value = false
    }, 1500)
  }
}

// 复制地址
async function handleCopyAddress() {
  const success = await copyToClipboard(props.order.address)
  if (success) {
    copyAddressSuccess.value = true
    setTimeout(() => {
      copyAddressSuccess.value = false
    }, 1500)
  }
}

// 打开地图
function handleOpenMap() {
  openMapNavigation(props.order.address)
}
</script>

<style scoped>
.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin: 12px 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
  width: calc(100% - 10px);
  max-width: 100%;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-date {
  font-size: 12px;
  color: #999;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.order-id {
  font-size: 11px;
  color: #bbb;
  font-family: monospace;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 64px;
  justify-content: center;
}

.copy-btn:active {
  transform: scale(0.95);
}

.copy-btn.copied {
  background: #10B981;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  line-height: 1.4;
}

.subject-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.subject-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.subject-tag.chinese,
.subject-tag.math,
.subject-tag.english,
.subject-tag.physics,
.subject-tag.chemistry,
.subject-tag.biology,
.subject-tag.history,
.subject-tag.geography,
.subject-tag.politics,
.subject-tag.default { 
  background: #EFF6FF; 
  color: #3B82F6; 
}

.grade-tag {
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.detail-icon {
  width: 28px;
  height: 28px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.detail-value.score {
  color: #333;
  font-weight: 500;
}

.detail-value.price {
  color: #333;
  font-weight: 500;
}

.detail-value.teacher-type {
  color: #3B82F6;
  font-weight: 500;
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f7fa;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.copied {
  background: #10B981;
  color: #fff;
}

.action-btn.map-btn {
  background: #3B82F6;
  color: #fff;
}

.time-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.time-tag {
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 10px;
  font-size: 11px;
}

.time-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.order-note {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 10px;
}

.note-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.note-content {
  margin: 0;
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.address-item .detail-content {
  flex: 1;
}
</style>
