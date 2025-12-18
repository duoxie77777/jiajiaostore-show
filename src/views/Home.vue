<template>
  <div class="home-page">
    <!-- 头部定位区域 -->
    <LocationHeader />
    
    <!-- 筛选区域 -->
    <FilterSection />
    
    <!-- 订单列表 -->
    <div class="order-list">
      <!-- 结果统计 -->
      <div class="list-header" v-if="filteredOrders.length > 0">
        <span class="result-count">共 {{ filteredOrders.length }} 个家教订单</span>
        <span class="sort-hint">按发布时间排序</span>
      </div>
      
      <!-- 订单卡片 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="filteredOrders.length > 0" class="order-grid">
          <OrderCard 
            v-for="(order, index) in paginatedOrders" 
            :key="order.id"
            :order="order"
            :index="index"
          />
          
          <!-- 分页 -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              class="page-btn prev" 
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <van-icon name="arrow-left" />
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in displayPages" 
                :key="page"
                class="page-num"
                :class="{ active: page === currentPage, dots: page === '...' }"
                :disabled="page === '...'"
                @click="page !== '...' && goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn next" 
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <van-icon name="arrow" />
            </button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <EmptyState v-else @reset="handleReset" />
      </van-pull-refresh>
    </div>
    
    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <button 
        v-show="showBackTop" 
        class="back-top-btn"
        @click="scrollToTop"
      >
        <van-icon name="back-top" />
      </button>
    </transition>
    
    <!-- 底部安全区 -->
    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '../stores/order'
import LocationHeader from '../components/LocationHeader.vue'
import FilterSection from '../components/FilterSection.vue'
import OrderCard from '../components/OrderCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { showToast } from 'vant'

const orderStore = useOrderStore()
const filteredOrders = computed(() => orderStore.filteredOrders)

// 分页相关
const pageSize = 10
const currentPage = ref(1)
const refreshing = ref(false)

// 返回顶部
const showBackTop = ref(false)

function handleScroll() {
  showBackTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))

// 当前页显示的订单
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

// 显示的页码
const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
})

// 跳转页面
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 下拉刷新
function onRefresh() {
  setTimeout(() => {
    refreshing.value = false
    currentPage.value = 1
    showToast({
      message: '刷新成功',
      type: 'success',
      duration: 1000
    })
  }, 1000)
}

// 重置筛选
function handleReset() {
  orderStore.resetFilters()
}

// 监听筛选条件变化，重置分页
watch(() => orderStore.filters, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.order-list {
  padding-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 4px;
}

.result-count {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.sort-hint {
  font-size: 12px;
  color: #999;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 16px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #fff;
  color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
}

.page-btn:disabled {
  background: #f5f7fa;
  color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.page-btn:not(:disabled):active {
  transform: scale(0.95);
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-num {
  min-width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: #fff;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  transition: all 0.2s;
}

.page-num.active {
  background: #3B82F6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}

.page-num.dots {
  background: transparent;
  box-shadow: none;
  cursor: default;
  color: #999;
}

.page-num:not(.active):not(.dots):active {
  background: #f0f0f0;
}

/* 返回顶部按钮 */
.back-top-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3B82F6;
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  z-index: 200;
  transition: all 0.3s;
}

.back-top-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.back-top-btn:active {
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.safe-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  min-height: 20px;
}

:deep(.van-pull-refresh) {
  min-height: 300px;
}

/* PC端适配 */
@media (min-width: 768px) {
  .home-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .order-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .pagination {
    grid-column: 1 / -1;
  }
  
  .back-top-btn {
    right: calc(50% - 600px + 20px);
    bottom: 40px;
  }
}

@media (min-width: 1024px) {
  .order-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .home-page {
    max-width: 1400px;
  }
  
  .back-top-btn {
    right: calc(50% - 700px + 20px);
  }
}
</style>
