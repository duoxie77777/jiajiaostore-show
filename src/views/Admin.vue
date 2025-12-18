<template>
  <div class="admin-page">
    <!-- 头部 -->
    <div class="admin-header">
      <div class="header-top">
        <div class="header-left">
          <h1>后台管理</h1>
          <span class="order-count">共 {{ orders.length }} 个订单</span>
        </div>
        <div class="header-right">
          <button class="icon-btn user" @click="showAdminModal = true">
            <van-icon name="manager-o" />
          </button>
          <button class="icon-btn setting" @click="showConfigModal = true">
            <van-icon name="setting-o" />
          </button>
          <button class="icon-btn logout" @click="handleLogout">
            <van-icon name="revoke" />
          </button>
        </div>
      </div>
      <div class="header-bottom">
        <span class="welcome-text">欢迎，{{ adminStore.currentAdmin?.username }}</span>
        <button class="add-btn" @click="openAddModal">
          <van-icon name="plus" />
          <span>新增订单</span>
        </button>
      </div>
    </div>

    <!-- 搜索区域 - 固定 -->
    <div class="search-section">
      <div class="search-bar">
        <van-icon name="search" class="search-icon" />
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索订单标题、地区、年级、科目..."
          class="search-input"
          @input="onSearchChange"
        />
        <van-icon 
          v-if="searchKeyword" 
          name="clear" 
          class="clear-icon" 
          @click="clearSearch" 
        />
      </div>
      <div class="filter-row">
        <div class="filter-left">
          <select v-model="statusFilter" class="status-filter" @change="onFilterChange">
            <option value="">全部状态</option>
            <option value="active">上架中</option>
            <option value="inactive">已下架</option>
          </select>
          <input 
            type="date" 
            v-model="dateFrom" 
            class="date-filter"
            @change="onFilterChange"
            placeholder="开始日期"
          />
          <span class="date-separator">至</span>
          <input 
            type="date" 
            v-model="dateTo" 
            class="date-filter"
            @change="onFilterChange"
            placeholder="结束日期"
          />
        </div>
        <span class="filter-result">找到 {{ filteredOrders.length }} 个订单</span>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div 
        v-for="order in paginatedOrders" 
        :key="order.id" 
        class="order-card"
        :class="{ inactive: order.status !== 'active' }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="header-left">
            <span class="order-id">#{{ order.id }}</span>
            <span 
              class="status-badge"
              :class="order.status"
            >
              <span class="status-dot"></span>
              {{ order.status === 'active' ? '上架中' : '已下架' }}
            </span>
          </div>
          <span class="order-date">{{ order.date }}</span>
        </div>

        <!-- 订单标题 -->
        <h3 class="card-title">{{ order.title }}</h3>

        <!-- 核心信息区 -->
        <div class="info-grid">
          <div class="info-item">
            <van-icon name="location-o" />
            <div class="info-content">
              <span class="info-label">地区</span>
              <span class="info-value">{{ order.district }}</span>
            </div>
          </div>
          <div class="info-item">
            <van-icon name="user-o" />
            <div class="info-content">
              <span class="info-label">年级</span>
              <span class="info-value">{{ order.grade }}</span>
            </div>
          </div>
          <div class="info-item">
            <van-icon name="bookmark-o" />
            <div class="info-content">
              <span class="info-label">科目</span>
              <span class="info-value">{{ order.subjects.join('、') }}</span>
            </div>
          </div>
          <div class="info-item">
            <van-icon name="gold-coin-o" />
            <div class="info-content">
              <span class="info-label">薪资</span>
              <span class="info-value highlight">{{ order.price || '面议' }}</span>
            </div>
          </div>
        </div>

        <!-- 更多信息 -->
        <div class="extra-info" v-if="order.address || order.frequency || order.teacherType">
          <div class="extra-item" v-if="order.address">
            <span class="extra-label">地址：</span>
            <span class="extra-value">{{ order.address }}</span>
          </div>
          <div class="extra-item" v-if="order.frequency">
            <span class="extra-label">频率：</span>
            <span class="extra-value">{{ order.frequency }}</span>
          </div>
          <div class="extra-item" v-if="order.teacherType">
            <span class="extra-label">要求：</span>
            <span class="extra-value">{{ order.teacherType }}</span>
          </div>
          <div class="extra-item" v-if="order.availableTimes && order.availableTimes.length">
            <span class="extra-label">时间：</span>
            <span class="extra-value">{{ order.availableTimes.join('、') }}</span>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="contact-bar" v-if="order.contact">
          <van-icon name="phone-o" />
          <span class="contact-number">{{ order.contact }}</span>
          <button class="copy-btn" @click="copyContact(order.contact)">
            <van-icon name="records-o" />
            复制
          </button>
        </div>

        <!-- 备注 -->
        <div class="note-bar" v-if="order.note">
          <van-icon name="comment-o" />
          <span v-html="order.note"></span>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
          <button class="action-btn edit" @click="openEditModal(order)">
            <van-icon name="edit" />
            <span>编辑</span>
          </button>
          <button 
            class="action-btn toggle"
            :class="order.status"
            @click="confirmToggle(order)"
          >
            <van-icon :name="order.status === 'active' ? 'eye-o' : 'closed-eye'" />
            <span>{{ order.status === 'active' ? '下架' : '上架' }}</span>
          </button>
          <button class="action-btn delete" @click="confirmDelete(order)">
            <van-icon name="delete-o" />
            <span>删除</span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredOrders.length === 0">
        <van-icon name="notes-o" size="48" />
        <p v-if="orders.length === 0">暂无订单数据</p>
        <p v-else>没有找到匹配的订单</p>
        <button v-if="orders.length === 0" class="add-first-btn" @click="openAddModal">添加第一个订单</button>
        <button v-else class="add-first-btn" @click="clearSearch">清除搜索条件</button>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn prev" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <van-icon name="arrow-left" />
        </button>
        <div class="page-info">
          <span class="current">{{ currentPage }}</span>
          <span class="separator">/</span>
          <span class="total">{{ totalPages }}</span>
        </div>
        <button 
          class="page-btn next" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <van-icon name="arrow" />
        </button>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup 
      v-model:show="showModal" 
      position="bottom" 
      :style="{ height: '90%' }"
      round
      closeable
    >
      <div class="modal-content">
        <h2 class="modal-title">{{ isEdit ? '编辑订单' : '新增订单' }}</h2>
        
        <div class="form-scroll">
          <div class="form-group">
            <label>订单标题 <span class="required">*</span></label>
            <input v-model="form.title" placeholder="如：高三数学冲刺辅导" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>地区 <span class="required">*</span></label>
              <select v-model="form.district">
                <option value="">请选择</option>
                <option v-for="d in configStore.districts" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>学校</label>
              <input v-model="form.school" placeholder="学校名称" />
            </div>
          </div>

          <div class="form-group">
            <label>详细地址 <span class="required">*</span></label>
            <input v-model="form.address" placeholder="详细地址" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>学段 <span class="required">*</span></label>
              <select v-model="form.gradeCategory" @change="onGradeCategoryChange">
                <option value="">请选择</option>
                <option v-for="cat in configStore.gradeCategories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>年级 <span class="required">*</span></label>
              <select v-model="form.grade">
                <option value="">请选择</option>
                <option v-for="g in availableGrades" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>辅导科目 <span class="required">*</span></label>
            <div class="subject-select">
              <span 
                v-for="s in availableSubjects" 
                :key="s"
                class="subject-option"
                :class="{ selected: form.subjects.includes(s) }"
                @click="toggleSubject(s)"
              >
                {{ s }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>平时分数</label>
              <input v-model="form.score" placeholder="如：90/150" />
            </div>
            <div class="form-group">
              <label>上课频率</label>
              <input v-model="form.frequency" placeholder="如：2次/周" />
            </div>
          </div>

          <div class="form-group">
            <label>可选上课时间</label>
            <div class="time-select">
              <span 
                v-for="t in configStore.timeOptions" 
                :key="t"
                class="time-option"
                :class="{ selected: form.availableTimes.includes(t) }"
                @click="toggleTime(t)"
              >
                {{ t }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>到手价</label>
              <input v-model="form.price" placeholder="如：200-300元/2小时 或 面议" />
            </div>
            <div class="form-group">
              <label>教师要求</label>
              <select v-model="form.teacherType">
                <option value="">请选择</option>
                <option v-for="t in configStore.teacherTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>家长联系方式（仅后台可见）</label>
            <input v-model="form.contact" placeholder="手机号码" />
          </div>

          <div class="form-group">
            <label>备注说明</label>
            <div class="rich-editor-wrapper">
              <div class="rich-toolbar">
                <button type="button" class="tool-btn" @click="execCommand('bold')" title="加粗">
                  <strong>B</strong>
                </button>
                <button type="button" class="tool-btn" @click="execCommand('italic')" title="斜体">
                  <em>I</em>
                </button>
                <button type="button" class="tool-btn" @click="execCommand('underline')" title="下划线">
                  <u>U</u>
                </button>
                <span class="tool-divider"></span>
                <button type="button" class="tool-btn" @click="execCommand('insertUnorderedList')" title="无序列表">
                  <van-icon name="bars" />
                </button>
                <button type="button" class="tool-btn" @click="execCommand('insertOrderedList')" title="有序列表">
                  <van-icon name="orders-o" />
                </button>
                <span class="tool-divider"></span>
                <button type="button" class="tool-btn" @click="execCommand('removeFormat')" title="清除格式">
                  <van-icon name="clear" />
                </button>
              </div>
              <div 
                ref="editorRef"
                class="rich-editor-content"
                contenteditable="true"
                @input="onEditorInput"
                @paste="onEditorPaste"
                placeholder="其他需要说明的信息"
              ></div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="submit-btn" @click="submitForm">{{ isEdit ? '保存修改' : '确认添加' }}</button>
        </div>
      </div>
    </van-popup>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除订单「${orderToDelete?.title}」吗？\n删除后无法恢复！`"
      show-cancel-button
      confirm-button-text="确认删除"
      confirm-button-color="#EF4444"
      @confirm="deleteOrder"
    />

    <!-- 上下架确认 -->
    <van-dialog
      v-model:show="showToggleConfirm"
      :title="orderToToggle?.status === 'active' ? '确认下架' : '确认上架'"
      :message="orderToToggle?.status === 'active' 
        ? `下架后该订单将不会在前台展示，确定要下架「${orderToToggle?.title}」吗？` 
        : `上架后该订单将在前台展示，确定要上架「${orderToToggle?.title}」吗？`"
      show-cancel-button
      :confirm-button-text="orderToToggle?.status === 'active' ? '确认下架' : '确认上架'"
      :confirm-button-color="orderToToggle?.status === 'active' ? '#F59E0B' : '#10B981'"
      @confirm="toggleOrderStatus"
    />

    <!-- 配置管理弹窗 -->
    <van-popup 
      v-model:show="showConfigModal" 
      position="bottom" 
      :style="{ height: '85%' }"
      round
      closeable
    >
      <div class="config-modal">
        <h2 class="config-modal-title">配置管理</h2>
        <ConfigManager />
      </div>
    </van-popup>

    <!-- 管理员管理弹窗 -->
    <van-popup 
      v-model:show="showAdminModal" 
      position="bottom" 
      :style="{ height: '85%' }"
      round
      closeable
    >
      <div class="config-modal">
        <h2 class="config-modal-title">管理员管理</h2>
        <AdminManager />
      </div>
    </van-popup>

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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { useConfigStore } from '../stores/config'
import { useAdminStore } from '../stores/admin'
import { copyToClipboard } from '../utils/clipboard'
import { showToast } from 'vant'
import ConfigManager from '../components/ConfigManager.vue'
import AdminManager from '../components/AdminManager.vue'

const router = useRouter()
const orderStore = useOrderStore()
const configStore = useConfigStore()
const adminStore = useAdminStore()
const orders = computed(() => orderStore.orders)

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

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

// 过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(o => o.status === statusFilter.value)
  }
  
  // 日期筛选
  if (dateFrom.value) {
    result = result.filter(o => o.date >= dateFrom.value)
  }
  if (dateTo.value) {
    result = result.filter(o => o.date <= dateTo.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(o => {
      return (
        o.title?.toLowerCase().includes(keyword) ||
        o.district?.toLowerCase().includes(keyword) ||
        o.grade?.toLowerCase().includes(keyword) ||
        o.subjects?.some(s => s.toLowerCase().includes(keyword)) ||
        o.address?.toLowerCase().includes(keyword) ||
        o.school?.toLowerCase().includes(keyword) ||
        o.id?.toLowerCase().includes(keyword) ||
        o.note?.toLowerCase().includes(keyword)
      )
    })
  }
  
  return result
})

// 搜索变化
function onSearchChange() {
  currentPage.value = 1
}

function onFilterChange() {
  currentPage.value = 1
}

function clearSearch() {
  searchKeyword.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

// 分页
const pageSize = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const showModal = ref(false)
const showDeleteConfirm = ref(false)
const showToggleConfirm = ref(false)
const showConfigModal = ref(false)
const showAdminModal = ref(false)
const isEdit = ref(false)
const currentOrderId = ref(null)
const orderToDelete = ref(null)
const orderToToggle = ref(null)

// 表单数据
const defaultForm = {
  title: '',
  district: '',
  school: '',
  address: '',
  gradeCategory: '',
  grade: '',
  subjects: [],
  score: '',
  frequency: '',
  availableTimes: [],
  price: '',
  teacherType: '',
  contact: '',
  note: ''
}

const form = ref({ ...defaultForm })

// 根据学段获取年级
const availableGrades = computed(() => {
  if (!form.value.gradeCategory) return []
  return configStore.getGradesByCategory(form.value.gradeCategory)
})

// 根据学段获取科目
const availableSubjects = computed(() => {
  if (!form.value.gradeCategory) return configStore.allSubjects
  return configStore.getSubjectsByCategory(form.value.gradeCategory)
})

// 学段变化时清空年级和科目
function onGradeCategoryChange() {
  form.value.grade = ''
  form.value.subjects = []
}

// 切换科目选择
function toggleSubject(subject) {
  const index = form.value.subjects.indexOf(subject)
  if (index > -1) {
    form.value.subjects.splice(index, 1)
  } else {
    form.value.subjects.push(subject)
  }
}

// 切换时间选择
function toggleTime(time) {
  const index = form.value.availableTimes.indexOf(time)
  if (index > -1) {
    form.value.availableTimes.splice(index, 1)
  } else {
    form.value.availableTimes.push(time)
  }
}

// 打开新增弹窗
function openAddModal() {
  isEdit.value = false
  currentOrderId.value = null
  form.value = { ...defaultForm, subjects: [], availableTimes: [] }
  showModal.value = true
  setEditorContent('')
}

// 打开编辑弹窗
function openEditModal(order) {
  isEdit.value = true
  currentOrderId.value = order.id
  form.value = {
    title: order.title,
    district: order.district,
    school: order.school,
    address: order.address,
    gradeCategory: order.gradeCategory,
    grade: order.grade,
    subjects: [...order.subjects],
    score: order.score,
    frequency: order.frequency,
    availableTimes: [...order.availableTimes],
    price: order.price,
    teacherType: order.teacherType,
    contact: order.contact || '',
    note: order.note || ''
  }
  showModal.value = true
  setEditorContent(order.note || '')
}

// 提交表单
function submitForm() {
  // 验证必填项
  if (!form.value.title || !form.value.district || !form.value.address || 
      !form.value.gradeCategory || !form.value.grade || form.value.subjects.length === 0) {
    showToast('请填写必填项')
    return
  }

  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toLocaleString('zh-CN')

  if (isEdit.value) {
    // 编辑订单
    const index = orderStore.orders.findIndex(o => o.id === currentOrderId.value)
    if (index > -1) {
      orderStore.orders[index] = {
        ...orderStore.orders[index],
        ...form.value,
        updateTime: timeStr
      }
      showToast('修改成功')
    }
  } else {
    // 新增订单
    const newOrder = {
      id: `JJ${dateStr.replace(/-/g, '')}${String(orders.value.length + 1).padStart(3, '0')}`,
      date: dateStr,
      ...form.value,
      status: 'active',
      createTime: timeStr
    }
    orderStore.orders.unshift(newOrder)
    showToast('添加成功')
  }

  showModal.value = false
}

// 确认上下架
function confirmToggle(order) {
  orderToToggle.value = order
  showToggleConfirm.value = true
}

// 切换订单状态
function toggleOrderStatus() {
  if (orderToToggle.value) {
    orderToToggle.value.status = orderToToggle.value.status === 'active' ? 'inactive' : 'active'
    showToast(orderToToggle.value.status === 'active' ? '已上架' : '已下架')
    orderToToggle.value = null
  }
}

// 确认删除
function confirmDelete(order) {
  orderToDelete.value = order
  showDeleteConfirm.value = true
}

// 删除订单
function deleteOrder() {
  const index = orderStore.orders.findIndex(o => o.id === orderToDelete.value.id)
  if (index > -1) {
    orderStore.orders.splice(index, 1)
    showToast('删除成功')
  }
  orderToDelete.value = null
}

// 复制联系方式
function copyContact(contact) {
  copyToClipboard(contact)
}

// 富文本编辑器
const editorRef = ref(null)

function execCommand(command) {
  document.execCommand(command, false, null)
  editorRef.value?.focus()
}

function onEditorInput(e) {
  form.value.note = e.target.innerHTML
}

function onEditorPaste(e) {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

function setEditorContent(html) {
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = html || ''
    }
  })
}

// 退出登录
function handleLogout() {
  adminStore.logout()
  router.replace('/login')
  showToast('已退出登录')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

.admin-header {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left h1 {
  font-size: 20px;
  margin: 0 0 4px;
  color: #fff;
  font-weight: 600;
}

.order-count {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.header-right {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-btn.user {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.icon-btn.setting {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.icon-btn.logout {
  background: rgba(239,68,68,0.2);
  color: #FEE2E2;
}

.icon-btn:active {
  transform: scale(0.95);
}

.header-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #fff;
  color: #3B82F6;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.add-btn:active {
  transform: scale(0.98);
}

/* 搜索区域 - 固定 */
.search-section {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 108px;
  z-index: 99;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 0 12px;
  height: 42px;
}

.search-icon {
  font-size: 18px;
  color: #999;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-icon {
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.clear-icon:active {
  color: #666;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-filter {
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  background: #fff;
  outline: none;
}

.status-filter:focus {
  border-color: #3B82F6;
}

.date-filter {
  padding: 6px 10px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  background: #fff;
  outline: none;
  width: 130px;
}

.date-filter:focus {
  border-color: #3B82F6;
}

.date-separator {
  font-size: 12px;
  color: #999;
}

.filter-result {
  font-size: 12px;
  color: #999;
}

.order-list {
  padding: 5px;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.order-card.inactive {
  background: #fafafa;
}

.order-card.inactive .card-title {
  color: #999;
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
  gap: 10px;
}

.order-id {
  font-size: 12px;
  color: #999;
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.status-badge.active {
  background: #D1FAE5;
  color: #059669;
}

.status-badge.inactive {
  background: #F3F4F6;
  color: #9CA3AF;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.order-date {
  font-size: 12px;
  color: #999;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 16px;
  line-height: 1.4;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.info-item .van-icon {
  font-size: 18px;
  color: #3B82F6;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  color: #9CA3AF;
}

.info-value {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  word-break: break-all;
}

.info-value.highlight {
  color: #F59E0B;
}

/* 额外信息 */
.extra-info {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.extra-item {
  display: flex;
  font-size: 13px;
  line-height: 1.8;
}

.extra-label {
  color: #9CA3AF;
  flex-shrink: 0;
}

.extra-value {
  color: #6B7280;
}

/* 联系方式 */
.contact-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-radius: 10px;
  margin-bottom: 12px;
}

.contact-bar .van-icon {
  font-size: 18px;
  color: #3B82F6;
}

.contact-number {
  font-size: 15px;
  color: #1E40AF;
  font-weight: 600;
  font-family: monospace;
}

.copy-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.copy-btn:active {
  opacity: 0.9;
}

/* 备注 */
.note-bar {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #FFFBEB;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #92400E;
}

.note-bar .van-icon {
  font-size: 16px;
  color: #F59E0B;
  margin-top: 1px;
}

/* 操作按钮 */
.action-bar {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn .van-icon {
  font-size: 16px;
}

.action-btn.edit {
  background: #EFF6FF;
  color: #3B82F6;
}

.action-btn.edit:active {
  background: #DBEAFE;
}

.action-btn.toggle {
  background: #FEF3C7;
  color: #D97706;
}

.action-btn.toggle:active {
  background: #FDE68A;
}

.action-btn.toggle.inactive {
  background: #D1FAE5;
  color: #059669;
}

.action-btn.toggle.inactive:active {
  background: #A7F3D0;
}

.action-btn.delete {
  background: #FEE2E2;
  color: #DC2626;
}

.action-btn.delete:active {
  background: #FECACA;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin: 16px 0;
}

.add-first-btn {
  padding: 10px 24px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
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

.page-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
}

.page-info .current {
  color: #3B82F6;
  font-weight: 600;
  font-size: 18px;
}

.page-info .separator {
  color: #ccc;
}

.page-info .total {
  color: #999;
}

/* 弹窗样式 */
.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.form-group .required {
  color: #EF4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3B82F6;
}

.form-group textarea {
  resize: none;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.subject-select,
.time-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subject-option,
.time-option {
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.subject-option.selected,
.time-option.selected {
  background: #3B82F6;
  color: #fff;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f7fa;
  color: #666;
}

.submit-btn {
  background: #3B82F6;
  color: #fff;
}

.cancel-btn:active,
.submit-btn:active {
  opacity: 0.9;
}

/* 配置弹窗 */
.config-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-modal-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
}

/* 搜索区域 */
.search-section {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 10px;
  padding: 0 12px;
  height: 42px;
}

.search-icon {
  font-size: 18px;
  color: #999;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-icon {
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.clear-icon:active {
  color: #666;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.status-filter {
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  background: #fff;
  outline: none;
}

.status-filter:focus {
  border-color: #3B82F6;
}

.filter-result {
  font-size: 12px;
  color: #999;
}

/* 富文本编辑器 */
.rich-editor-wrapper {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.rich-editor-wrapper:focus-within {
  border-color: #3B82F6;
}

.rich-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #E5E7EB;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e5e7eb;
}

.tool-btn:active {
  background: #d1d5db;
}

.tool-divider {
  width: 1px;
  height: 20px;
  background: #E5E7EB;
  margin: 0 4px;
}

.rich-editor-content {
  min-height: 100px;
  max-height: 200px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  overflow-y: auto;
  outline: none;
}

.rich-editor-content:empty:before {
  content: attr(placeholder);
  color: #bbb;
  pointer-events: none;
}

.rich-editor-content ul,
.rich-editor-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.rich-editor-content li {
  margin: 4px 0;
}

/* 备注显示区域富文本样式 */
.note-bar span {
  flex: 1;
}

.note-bar span ul,
.note-bar span ol {
  padding-left: 16px;
  margin: 4px 0;
}

.note-bar span li {
  margin: 2px 0;
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

/* PC端适配 */
@media (min-width: 768px) {
  .admin-page {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .admin-header {
    border-radius: 0 0 20px 20px;
  }
  
  .search-section {
    border-radius: 0 0 16px 16px;
    top: 108px;
  }
  
  .order-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 20px;
  }
  
  .order-card {
    margin-bottom: 0;
  }
  
  .empty-state,
  .pagination {
    grid-column: 1 / -1;
  }
  
  .info-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .back-top-btn {
    right: calc(50% - 600px + 20px);
    bottom: 40px;
  }
}

@media (min-width: 1024px) {
  .order-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .admin-page {
    max-width: 1400px;
  }
  
  .back-top-btn {
    right: calc(50% - 700px + 20px);
  }
}
</style>
