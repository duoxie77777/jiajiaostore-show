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

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-bar">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索订单标题、地区、年级、科目..."
          shape="round"
          background="transparent"
          @input="onSearchChange"
          @clear="clearSearchInput"
        />
      </div>
      
      <!-- 横向滚动筛选栏 -->
      <div class="filter-tabs-wrapper">
        <div class="filter-tabs">
          <div 
            class="filter-tab"
            :class="{ active: statusFilter }"
            @click="openFilterSheet('status')"
          >
            <span>{{ statusFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab"
            :class="{ active: districtFilter }"
            @click="openFilterSheet('district')"
          >
            <span>{{ districtFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab"
            :class="{ active: gradeCategoryFilter }"
            @click="openFilterSheet('gradeCategory')"
          >
            <span>{{ gradeCategoryFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab"
            :class="{ active: gradeFilter }"
            @click="openFilterSheet('grade')"
          >
            <span>{{ gradeFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab"
            :class="{ active: subjectFilter }"
            @click="openFilterSheet('subject')"
          >
            <span>{{ subjectFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab"
            :class="{ active: teacherTypeFilter }"
            @click="openFilterSheet('teacherType')"
          >
            <span>{{ teacherTypeFilterLabel }}</span>
            <van-icon name="arrow-down" size="10" />
          </div>
          
          <div 
            class="filter-tab date-tab"
            :class="{ active: dateRange && dateRange.length > 0 }"
            @click="showDatePicker = true"
          >
            <van-icon name="calendar-o" size="14" />
            <span>{{ dateRangeLabel || '日期' }}</span>
          </div>
        </div>
        
        <!-- 筛选结果 & 重置 -->
        <div class="filter-footer" v-if="hasActiveFilters">
          <span class="filter-result">
            <van-icon name="records-o" />
            找到 <strong>{{ filteredOrders.length }}</strong> 个订单
          </span>
          <button class="reset-btn" @click="clearAllFilters">
            <van-icon name="replay" />
            重置
          </button>
        </div>
      </div>
    </div>
    
    <!-- 筛选选择器 -->
    <van-action-sheet 
      v-model:show="showFilterSheet" 
      :title="filterSheetTitle"
    >
      <div class="picker-content">
        <div 
          v-for="item in filterSheetOptions" 
          :key="item.value"
          class="picker-item"
          :class="{ active: isFilterSelected(item.value) }"
          @click="onSelectFilter(item)"
        >
          <span>{{ item.label }}</span>
          <van-icon v-if="isFilterSelected(item.value)" name="success" class="check-icon" />
        </div>
      </div>
    </van-action-sheet>
    
    <!-- 日期范围选择器 -->
    <van-calendar 
      v-model:show="showDatePicker"
      type="range"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="onDateConfirm"
      title="选择日期范围"
      confirm-text="确定"
      confirm-disabled-text="请选择日期范围"
    />

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
        <div class="extra-info">
          <div class="extra-item">
            <span class="extra-label">地址：</span>
            <span class="extra-value">{{ order.address || '-' }}</span>
          </div>
          <div class="extra-item">
            <span class="extra-label">学校：</span>
            <span class="extra-value">{{ order.school || '-' }}</span>
          </div>
          <div class="extra-item">
            <span class="extra-label">频率：</span>
            <span class="extra-value">{{ order.frequency || '-' }}</span>
          </div>
          <div class="extra-item">
            <span class="extra-label">要求：</span>
            <span class="extra-value">{{ order.teacherType || '-' }}</span>
          </div>
          <div class="extra-item">
            <span class="extra-label">时间：</span>
            <span class="extra-value">{{ 
              order.availableTimesText || 
              (order.availableTimes && order.availableTimes.length > 0 ? order.availableTimes.join('、') : '-') 
            }}</span>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="contact-bar" v-if="order.contact">
          <van-icon name="phone-o" />
          <span class="contact-number">{{ order.contact }}</span>
          <button class="copy-btn" @click="copyContact(order.contact)">
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
        
        <!-- 新增模式选择 -->
        <div class="mode-selector" v-if="!isEdit">
          <div 
            class="mode-tab"
            :class="{ active: fillMode === 'quick' }"
            @click="fillMode = 'quick'"
          >
            <van-icon name="flash" />
            <span>快速填入</span>
          </div>
          <div 
            class="mode-tab"
            :class="{ active: fillMode === 'manual' }"
            @click="fillMode = 'manual'"
          >
            <van-icon name="edit" />
            <span>逐项填入</span>
          </div>
        </div>
        
        <!-- 快速填入模式 -->
        <div class="quick-fill-mode" v-if="!isEdit && fillMode === 'quick'">
          <div class="quick-fill-hint">
            <van-icon name="info-o" />
            <span>粘贴订单文本，一键解析填充所有信息</span>
          </div>
          
          <!-- 模板参考 -->
          <div class="template-reference">
            <div class="template-header">
              <span class="template-title">📋 参考模板</span>
              <button class="copy-template-btn" @click="copyTemplate">
                <van-icon name="records-o" />
                复制模板
              </button>
            </div>
          </div> 
          
          <textarea 
            v-model="quickFillText"
            class="quick-fill-textarea"
            placeholder="在此粘贴订单文本，支持解析以下字段：&#10;✓ 标题、地区、学校、年级、科目&#10;✓ 分数、频率、时间、薪资、要求&#10;✓ 联系方式、备注&#10;&#10;支持中英文冒号，字段顺序不限"
          ></textarea>
          
          <div class="quick-fill-buttons">
            <button 
              class="parse-fill-btn primary" 
              @click="parseAndFill"
              :disabled="!quickFillText.trim()"
            >
              <van-icon name="completed" />
              <span>一键解析填充</span>
            </button>
            <button 
              class="parse-fill-btn secondary" 
              @click="quickFillText = ''"
              :disabled="!quickFillText.trim()"
            >
              <van-icon name="clear" />
              <span>清空</span>
            </button>
          </div>
        </div>
        
        <!-- 逐项填入模式 -->
        <div class="form-scroll" v-if="isEdit || fillMode === 'manual'">
          <div class="form-group">
            <label>订单标题 <span class="required">*</span></label>
            <input v-model="form.title" placeholder="如：高三数学冲刺辅导" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>地区 <span class="required">*</span></label>
              <el-select v-model="form.district" placeholder="请选择" clearable>
                <el-option 
                  v-for="d in configStore.districts" 
                  :key="d.value" 
                  :value="d.value"
                  :label="d.label"
                />
              </el-select>
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
              <el-select 
                v-model="form.gradeCategory" 
                @change="onGradeCategoryChange"
                placeholder="请选择"
                clearable
              >
                <el-option 
                  v-for="cat in configStore.gradeCategories" 
                  :key="cat.value" 
                  :value="cat.value"
                  :label="cat.label"
                />
              </el-select>
            </div>
            <div class="form-group">
              <label>年级 <span class="required">*</span></label>
              <el-select v-model="form.grade" placeholder="请选择" clearable>
                <el-option 
                  v-for="g in availableGrades" 
                  :key="g" 
                  :value="g"
                  :label="g"
                />
              </el-select>
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
            <input v-model="form.availableTimesText" placeholder="如：周末下午、周一到周五晚上" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>到手价</label>
              <input v-model="form.price" placeholder="如：200-300元/2小时 或 面议" />
            </div>
            <div class="form-group">
              <label>教师要求</label>
              <el-select v-model="form.teacherType" placeholder="请选择" clearable>
                <el-option 
                  v-for="t in configStore.teacherTypes" 
                  :key="t" 
                  :value="t"
                  :label="t"
                />
              </el-select>
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
import { showToast, showLoadingToast, closeToast } from 'vant'
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
const districtFilter = ref('')
const gradeCategoryFilter = ref('')
const gradeFilter = ref('')
const subjectFilter = ref('')
const teacherTypeFilter = ref('')
const dateRange = ref([])
const showDatePicker = ref(false)
const showFilterSheet = ref(false)
const currentFilterType = ref('')

// 日期范围限制
const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2030, 11, 31)

// 返回顶部
const showBackTop = ref(false)

function handleScroll() {
  showBackTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  // 加载配置和订单数据
  await configStore.loadConfigs()
  await orderStore.loadAdminOrders()
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
  
  // 地区筛选
  if (districtFilter.value) {
    result = result.filter(o => o.district === districtFilter.value)
  }
  
  // 学段筛选
  if (gradeCategoryFilter.value) {
    result = result.filter(o => o.gradeCategory === gradeCategoryFilter.value)
  }
  
  // 年级筛选
  if (gradeFilter.value) {
    result = result.filter(o => o.grade === gradeFilter.value)
  }
  
  // 科目筛选
  if (subjectFilter.value) {
    result = result.filter(o => o.subjects && o.subjects.includes(subjectFilter.value))
  }
  
  // 教师要求筛选
  if (teacherTypeFilter.value) {
    result = result.filter(o => o.teacherType === teacherTypeFilter.value)
  }
  
  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    result = result.filter(o => o.date >= startStr && o.date <= endStr)
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

// 获取所有科目
const allSubjects = computed(() => {
  return configStore.allSubjects
})

// 根据筛选学段获取年级
const filterAvailableGrades = computed(() => {
  if (!gradeCategoryFilter.value) {
    let grades = []
    configStore.gradeCategories.forEach(cat => {
      grades = grades.concat(cat.grades)
    })
    return grades
  }
  return configStore.getGradesByCategory(gradeCategoryFilter.value)
})

// 判断是否有激活的筛选
const hasActiveFilters = computed(() => {
  return statusFilter.value || districtFilter.value || gradeCategoryFilter.value || 
         gradeFilter.value || subjectFilter.value || teacherTypeFilter.value ||
         (dateRange.value && dateRange.value.length > 0)
})

// 筛选标签文本
const statusFilterLabel = computed(() => {
  if (!statusFilter.value) return '状态'
  return statusFilter.value === 'active' ? '上架' : '下架'
})

const districtFilterLabel = computed(() => {
  if (!districtFilter.value) return '地区'
  const d = configStore.districts.find(item => item.value === districtFilter.value)
  return d?.label || districtFilter.value
})

const gradeCategoryFilterLabel = computed(() => {
  if (!gradeCategoryFilter.value) return '学段'
  const c = configStore.gradeCategories.find(item => item.value === gradeCategoryFilter.value)
  return c?.label || gradeCategoryFilter.value
})

const gradeFilterLabel = computed(() => {
  return gradeFilter.value || '年级'
})

const subjectFilterLabel = computed(() => {
  return subjectFilter.value || '科目'
})

const teacherTypeFilterLabel = computed(() => {
  return teacherTypeFilter.value || '要求'
})

const dateRangeLabel = computed(() => {
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    return `${formatDate(start)} ~ ${formatDate(end)}`
  }
  return ''
})

// 筛选器弹窗标题
const filterSheetTitle = computed(() => {
  const titles = {
    status: '选择状态',
    district: '选择地区',
    gradeCategory: '选择学段',
    grade: '选择年级',
    subject: '选择科目',
    teacherType: '选择教师要求'
  }
  return titles[currentFilterType.value] || ''
})

// 筛选器选项
const filterSheetOptions = computed(() => {
  switch (currentFilterType.value) {
    case 'status':
      return [
        { label: '全部状态', value: '' },
        { label: '上架中', value: 'active' },
        { label: '已下架', value: 'inactive' }
      ]
    case 'district':
      return [
        { label: '全部地区', value: '' },
        ...configStore.districts.map(d => ({ label: d.label, value: d.value }))
      ]
    case 'gradeCategory':
      return [
        { label: '全部学段', value: '' },
        ...configStore.gradeCategories.map(c => ({ label: c.label, value: c.value }))
      ]
    case 'grade':
      return [
        { label: '全部年级', value: '' },
        ...filterAvailableGrades.value.map(g => ({ label: g, value: g }))
      ]
    case 'subject':
      return [
        { label: '全部科目', value: '' },
        ...allSubjects.value.map(s => ({ label: s, value: s }))
      ]
    case 'teacherType':
      return [
        { label: '全部要求', value: '' },
        ...configStore.teacherTypes.map(t => ({ label: t, value: t }))
      ]
    default:
      return []
  }
})

// 格式化日期
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 搜索变化
function onSearchChange() {
  currentPage.value = 1
}

function onFilterChange() {
  currentPage.value = 1
}

function clearSearchInput() {
  searchKeyword.value = ''
  currentPage.value = 1
}

function clearSearch() {
  searchKeyword.value = ''
  statusFilter.value = ''
  districtFilter.value = ''
  gradeCategoryFilter.value = ''
  gradeFilter.value = ''
  subjectFilter.value = ''
  teacherTypeFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
}

// 清空所有筛选
function clearAllFilters() {
  statusFilter.value = ''
  districtFilter.value = ''
  gradeCategoryFilter.value = ''
  gradeFilter.value = ''
  subjectFilter.value = ''
  teacherTypeFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
}

// 打开筛选器
function openFilterSheet(type) {
  currentFilterType.value = type
  showFilterSheet.value = true
}

// 判断是否选中
function isFilterSelected(value) {
  const filterMap = {
    status: statusFilter.value,
    district: districtFilter.value,
    gradeCategory: gradeCategoryFilter.value,
    grade: gradeFilter.value,
    subject: subjectFilter.value,
    teacherType: teacherTypeFilter.value
  }
  return filterMap[currentFilterType.value] === value
}

// 选择筛选项
function onSelectFilter(item) {
  const filterMap = {
    status: statusFilter,
    district: districtFilter,
    gradeCategory: gradeCategoryFilter,
    grade: gradeFilter,
    subject: subjectFilter,
    teacherType: teacherTypeFilter
  }
  
  const targetFilter = filterMap[currentFilterType.value]
  if (targetFilter) {
    targetFilter.value = item.value
  }
  
  // 学段变化时清空年级
  if (currentFilterType.value === 'gradeCategory') {
    gradeFilter.value = ''
  }
  
  showFilterSheet.value = false
  currentPage.value = 1
}

// 日期范围确认
function onDateConfirm(values) {
  dateRange.value = values
  showDatePicker.value = false
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
  availableTimesText: '',
  price: '',
  teacherType: '',
  contact: '',
  note: ''
}

const form = ref({ ...defaultForm })

// 填充模式：quick 快速填入, manual 逐项填入
const fillMode = ref('quick')
const quickFillText = ref('')

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

// 快速填入解析函数
function parseAndFill() {
  const text = quickFillText.value.trim()
  if (!text) return
  
  try {
    // 解析标题
    const titleMatch = text.match(/(?:标题)[：:]\s*([^\n]+)/i)
    if (titleMatch) {
      form.value.title = titleMatch[1].trim()
    }
    
    // 解析地区 - 支持多种格式
    const districtMatch = text.match(/(?:地址|地区)[：:]\s*([^-\n]+?)(?:[-\s]|$)/i)
    if (districtMatch) {
      const districtText = districtMatch[1].trim()
      const district = configStore.districts.find(d => 
        districtText.includes(d.label) || d.label.includes(districtText)
      )
      if (district) form.value.district = district.value
    }
    
    // 解析详细地址 - 完整地址行
    const addressMatch = text.match(/(?:地址|地区)[：:]\s*(.+?)(?:\n|$)/i)
    if (addressMatch) {
      let fullAddress = addressMatch[1].trim()
      // 提取地区后的详细地址
      const detailMatch = fullAddress.match(/[^-]*-(.+)/)
      if (detailMatch) {
        form.value.address = detailMatch[1].trim()
      } else {
        form.value.address = fullAddress
      }
    }
    
    // 解析学校
    const schoolMatch = text.match(/(?:学校)[：:]\s*([^\n]+)/i)
    if (schoolMatch) {
      form.value.school = schoolMatch[1].trim()
    }
    
    // 解析年级和学段 - 支持多种格式
    let gradeMatch = text.match(/(?:年级|学生)[：:]\s*([^\n]+)/i)
    if (!gradeMatch) {
      gradeMatch = text.match(/([小初高][一二三四五六]|初[一二三]|高[一二三]|[一二三四五六]年级)(?:女生|男生|学生)?/i)
    }
    
    if (gradeMatch) {
      const gradeText = (gradeMatch[1] || gradeMatch[2] || '').trim()
      
      // 智能判断学段
      if (gradeText.includes('小学') || gradeText.includes('小') || /[一二三四五六]年级/.test(gradeText)) {
        form.value.gradeCategory = 'primary'
      } else if (gradeText.includes('初') || gradeText.includes('中考')) {
        form.value.gradeCategory = 'junior'
      } else if (gradeText.includes('高') || gradeText.includes('高考')) {
        form.value.gradeCategory = 'senior'
      }
      
      // 匹配具体年级
      const gradeMap = {
        '一年级': '一年级', '二年级': '二年级', '三年级': '三年级',
        '四年级': '四年级', '五年级': '五年级', '六年级': '六年级',
        '小一': '一年级', '小二': '二年级', '小三': '三年级',
        '小四': '四年级', '小五': '五年级', '小六': '六年级',
        '初一': '初一', '初二': '初二', '初三': '初三',
        '高一': '高一', '高二': '高二', '高三': '高三'
      }
      
      for (const [key, value] of Object.entries(gradeMap)) {
        if (gradeText.includes(key)) {
          form.value.grade = value
          break
        }
      }
    }
    
    // 解析科目 - 支持多科目和中英文分隔符
    const subjectsMatch = text.match(/(?:科目)[：:]\s*([^\n]+)/i)
    if (subjectsMatch) {
      const subjectsText = subjectsMatch[1].trim()
      const allSubjects = configStore.allSubjects
      const foundSubjects = []
      
      allSubjects.forEach(subject => {
        if (subjectsText.includes(subject)) {
          foundSubjects.push(subject)
        }
      })
      
      if (foundSubjects.length > 0) {
        form.value.subjects = foundSubjects
      }
    }
    
    // 解析分数/成绩
    const scoreMatch = text.match(/(?:分数|成绩|平时分)[：:]\s*([^\n]+)/i)
    if (scoreMatch) {
      form.value.score = scoreMatch[1].trim()
    }
    
    // 解析时间 - 区分频率和可选时间
    const frequencyMatch = text.match(/(?:频率|上课频率)[：:]\s*([^\n]+)/i)
    if (frequencyMatch) {
      form.value.frequency = frequencyMatch[1].trim()
    }
    
    const timeMatch = text.match(/(?:时间|上课时间|可选时间)[：:]\s*([^\n]+)/i)
    if (timeMatch) {
      const timeText = timeMatch[1].trim()
      
      // 如果包含频率关键词，存入频率字段
      if (/\d+次/.test(timeText) || timeText.includes('/周') || timeText.includes('/月') || timeText.includes('每周')) {
        if (!form.value.frequency) {
          form.value.frequency = timeText
        }
      } else {
        // 否则作为可选时间文本存储
        form.value.availableTimesText = timeText
      }
    }
    
    // 解析薪资 - 支持多种表达
    const priceMatch = text.match(/(?:薪资|价格|工资|到手价|薪酬)[：:]\s*([^\n]+)/i)
    if (priceMatch) {
      form.value.price = priceMatch[1].trim()
    }
    
    // 解析教师要求
    const requirementMatch = text.match(/(?:要求|教师要求|老师要求)[：:]\s*([^\n]+)/i)
    if (requirementMatch) {
      const reqText = requirementMatch[1].trim()
      const matchedType = configStore.teacherTypes.find(t => 
        reqText.includes(t) || t.includes(reqText)
      )
      if (matchedType) {
        form.value.teacherType = matchedType
      } else {
        // 如果没有匹配到，直接使用文本
        form.value.teacherType = reqText
      }
    }
    
    // 解析联系方式
    const contactMatch = text.match(/(?:联系方式|联系电话|电话|手机)[：:]\s*([^\n]+)/i)
    if (contactMatch) {
      form.value.contact = contactMatch[1].trim()
    }
    
    // 解析备注 - 支持多行
    const noteMatch = text.match(/(?:备注|说明|其他)[：:]\s*([\s\S]+?)(?=(?:\n[^\n]*[：:]|$))/i)
    if (noteMatch) {
      form.value.note = noteMatch[1].trim()
    }
    
    // 自动生成标题（如果没有解析到标题）
    if (!form.value.title && form.value.grade && form.value.subjects.length > 0) {
      form.value.title = `${form.value.grade}${form.value.subjects.join('、')}辅导`
    }
    
    // 切换到逐项填入模式查看结果
    fillMode.value = 'manual'
    
    // 同步更新富文本编辑器内容
    nextTick(() => {
      setEditorContent(form.value.note || '')
    })
    
    showToast('解析成功！请检查并补充信息')
    
  } catch (error) {
    console.error('解析失败:', error)
    showToast('解析失败，请检查文本格式')
  }
}

// 复制模板
function copyTemplate() {
  const template = `标题：初三数学英语辅导
地区：同安区-禹洲天境
学校：厦门一中
年级：初三女生
科目：数学、英语
分数：85/150（基础较差）
频率：2次/周
时间：周末下午
薪资：200-240元/2小时
要求：大学生
联系方式：138****8888
备注：学生比较内向，需要耐心引导`
  
  copyToClipboard(template)
  showToast('模板已复制！')
}

// 打开新增弹窗
function openAddModal() {
  isEdit.value = false
  currentOrderId.value = null
  form.value = { ...defaultForm, subjects: [] }
  fillMode.value = 'quick'
  quickFillText.value = ''
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
    availableTimesText: order.availableTimesText || (order.availableTimes && order.availableTimes.length > 0 ? order.availableTimes.join('、') : ''),
    price: order.price,
    teacherType: order.teacherType,
    contact: order.contact || '',
    note: order.note || ''
  }
  showModal.value = true
  setEditorContent(order.note || '')
}

// 提交表单
async function submitForm() {
  // 验证必填项
  if (!form.value.title || !form.value.district || !form.value.address || 
      !form.value.gradeCategory || !form.value.grade || form.value.subjects.length === 0) {
    showToast('请填写必填项')
    return
  }

  showLoadingToast({ message: isEdit.value ? '保存中...' : '添加中...', forbidClick: true })

  if (isEdit.value) {
    // 编辑订单
    const result = await orderStore.updateOrder(currentOrderId.value, form.value)
    closeToast()
    if (result.success) {
      showToast('修改成功')
      showModal.value = false
    } else {
      showToast(result.message || '修改失败')
    }
  } else {
    // 新增订单
    const result = await orderStore.createOrder(form.value)
    closeToast()
    if (result.success) {
      showToast('添加成功')
      showModal.value = false
    } else {
      showToast(result.message || '添加失败')
    }
  }
}

// 确认上下架
function confirmToggle(order) {
  orderToToggle.value = order
  showToggleConfirm.value = true
}

// 切换订单状态
async function toggleOrderStatus() {
  if (orderToToggle.value) {
    showLoadingToast({ message: '处理中...', forbidClick: true })
    const result = await orderStore.toggleOrderStatus(orderToToggle.value.id)
    closeToast()
    
    if (result.success) {
      showToast(result.data.status === 'active' ? '已上架' : '已下架')
    } else {
      showToast(result.message || '操作失败')
    }
    orderToToggle.value = null
  }
}

// 确认删除
function confirmDelete(order) {
  orderToDelete.value = order
  showDeleteConfirm.value = true
}

// 删除订单
async function deleteOrder() {
  if (orderToDelete.value) {
    showLoadingToast({ message: '删除中...', forbidClick: true })
    const result = await orderStore.deleteOrder(orderToDelete.value.id)
    closeToast()
    
    if (result.success) {
      showToast('删除成功')
    } else {
      showToast(result.message || '删除失败')
    }
    orderToDelete.value = null
  }
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
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.admin-header {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  max-width: 100%;
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

/* 搜索筛选区域 */
.search-section {
  background: #fff;
  position: sticky;
  top: 108px;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.search-bar {
  padding: 8px 8px 0;
}

.search-bar :deep(.van-search__content) {
  background: #f5f7fa;
  border-radius: 20px;
}

.search-bar :deep(.van-search) {
  padding: 8px 0;
}

/* 横向滚动筛选栏 */

.filter-tabs {
  display: flex;
  padding: 12px 16px 8px;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  background: #f5f7fa;
  border-radius: 18px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.filter-tab:active {
  transform: scale(0.95);
}

.filter-tab.active {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.filter-tab span {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.filter-tab.date-tab {
  gap: 5px;
}

.filter-tab.date-tab span {
  max-width: 140px;
  font-size: 12px;
}

.filter-tab .van-icon {
  flex-shrink: 0;
}

/* 筛选底栏 */
.filter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #f0f0f0;
}

.filter-result {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.filter-result .van-icon {
  font-size: 15px;
  color: #3B82F6;
}

.filter-result strong {
  color: #3B82F6;
  font-weight: 600;
  font-size: 15px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #fff;
  color: #666;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.reset-btn:active {
  transform: scale(0.95);
  background: #f1f5f9;
}

.reset-btn .van-icon {
  font-size: 13px;
}

/* 选择器弹窗 */
.picker-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px 0 20px;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  font-size: 15px;
  color: #333;
  transition: background 0.2s;
  cursor: pointer;
}

.picker-item:active {
  background: #f5f7fa;
}

.picker-item.active {
  color: #3B82F6;
  font-weight: 500;
  background: #eff6ff;
}

.picker-item .check-icon {
  color: #3B82F6;
  font-size: 18px;
}

:deep(.van-action-sheet__header) {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  padding: 16px;
}

:deep(.van-calendar__header-title) {
  font-weight: 600;
}

:deep(.van-calendar__confirm) {
  color: #3B82F6;
}

.order-list {
  padding: 5px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
  width: 100%;
}

/* 模式选择器 */
.mode-selector {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #eee;
}

.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #fff;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-tab .van-icon {
  font-size: 18px;
}

.mode-tab.active {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  border-color: #3B82F6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.mode-tab:not(.active):active {
  transform: scale(0.97);
}

/* 快速填入模式 */
.quick-fill-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  gap: 12px;
}

.quick-fill-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #EFF6FF;
  border-radius: 10px;
  font-size: 13px;
  color: #2563EB;
}

.quick-fill-hint .van-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* 模板参考卡片 */
.template-reference {
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
}

.template-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.template-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400E;
}

.copy-template-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #F59E0B;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-template-btn:active {
  transform: scale(0.95);
  background: #D97706;
}

.template-content {
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.template-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
  color: #78350F;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.quick-fill-textarea {
  flex: 1;
  width: 100%;
  min-height: 200px;
  padding: 14px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
}

.quick-fill-textarea:focus {
  outline: none;
  border-color: #3B82F6;
  background: #F9FAFB;
}

.quick-fill-textarea::placeholder {
  color: #9CA3AF;
  line-height: 1.8;
}

.quick-fill-buttons {
  display: flex;
  gap: 10px;
}

.parse-fill-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.parse-fill-btn.primary {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.parse-fill-btn.primary:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.parse-fill-btn.secondary {
  background: #F3F4F6;
  color: #6B7280;
}

.parse-fill-btn.secondary:not(:disabled):active {
  background: #E5E7EB;
}

.parse-fill-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.parse-fill-btn .van-icon {
  font-size: 18px;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
.form-group textarea:focus {
  border-color: #3B82F6;
}

.form-group textarea {
  resize: none;
}

/* Element Plus Select 在 form-group 中的样式 */
.form-group :deep(.el-select) {
  width: 100%;
}

.form-group :deep(.el-select .el-input__wrapper) {
  background: #f9fafb;
  transition: all 0.2s;
}

.form-group :deep(.el-select .el-input__wrapper:hover) {
  background: #fff;
}

.form-group :deep(.el-select.is-focus .el-input__wrapper) {
  background: #fff;
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
    position: sticky;
    top: 0;
    border-radius: 16px;
    margin: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .filter-tabs {
    justify-content: flex-start;
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
