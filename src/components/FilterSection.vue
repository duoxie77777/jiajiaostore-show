<template>
  <div class="filter-section">
    <!-- 搜索框 -->
    <div class="search-bar">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索订单标题、地区、年级、科目..."
        shape="round"
        background="transparent"
        @search="handleSearch"
        @clear="handleClear"
        @input="handleSearch"
      />
    </div>
    
    <!-- 快捷筛选标签 -->
    <div class="filter-tabs">
      <div 
        class="filter-tab"
        :class="{ active: activeTab === 'district' }"
        @click="openPicker('district')"
      >
        <span>{{ filters.district || '地区' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div 
        class="filter-tab"
        :class="{ active: activeTab === 'gradeCategory' }"
        @click="openPicker('gradeCategory')"
      >
        <span>{{ gradeCategoryLabel || '学段' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div 
        class="filter-tab"
        :class="{ active: activeTab === 'grade' }"
        @click="openPicker('grade')"
      >
        <span>{{ filters.grade || '年级' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div 
        class="filter-tab"
        :class="{ active: activeTab === 'subject' }"
        @click="openPicker('subject')"
      >
        <span>{{ filters.subject || '科目' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div 
        class="filter-tab date-tab"
        :class="{ active: showDatePicker }"
        @click="showDatePicker = !showDatePicker"
      >
        <van-icon name="calendar-o" />
        <span>{{ dateLabel || '日期' }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
    </div>
    
    <!-- 日期筛选展开区 -->
    <div class="date-picker-row" v-show="showDatePicker">
      <div class="date-inputs">
        <el-date-picker
          v-model="dateFrom"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          size="small"
          class="custom-date-picker"
        />
        <span class="date-separator">至</span>
        <el-date-picker
          v-model="dateTo"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          size="small"
          class="custom-date-picker"
        />
      </div>
      <button class="date-clear" v-if="dateFrom || dateTo" @click="clearDate">
        清除
      </button>
    </div>
    
    <!-- 更多筛选 & 重置 -->
    <div class="filter-actions">
      <div class="filter-count" v-if="activeFiltersCount > 0">
        已筛选 {{ activeFiltersCount }} 项
      </div>
      <div class="filter-reset" v-if="activeFiltersCount > 0" @click="handleReset">
        <van-icon name="replay" />
        <span>重置</span>
      </div>
    </div>
    
    <!-- 选择器弹窗 -->
    <van-action-sheet 
      v-model:show="showPicker" 
      :title="pickerTitle"
      :close-on-click-action="false"
    >
      <div class="picker-content">
        <div 
          v-for="item in pickerColumns" 
          :key="item.value"
          class="picker-item"
          :class="{ active: isItemSelected(item.value) }"
          @click="onSelectItem(item)"
        >
          <span>{{ item.text }}</span>
          <van-icon v-if="isItemSelected(item.value)" name="success" class="check-icon" />
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '../stores/order'
import { useConfigStore } from '../stores/config'
import { schools } from '../data/mockData'

const orderStore = useOrderStore()
const configStore = useConfigStore()
const filters = orderStore.filters

const searchKeyword = ref('')
const showPicker = ref(false)
const showDatePicker = ref(false)
const activeTab = ref('')
const currentPickerType = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// 日期标签
const dateLabel = computed(() => {
  if (dateFrom.value && dateTo.value) {
    return `${dateFrom.value} ~ ${dateTo.value}`
  } else if (dateFrom.value) {
    return `${dateFrom.value} 起`
  } else if (dateTo.value) {
    return `至 ${dateTo.value}`
  }
  return ''
})

// 当前学段标签
const gradeCategoryLabel = computed(() => {
  const cat = configStore.gradeCategories.find(c => c.value === filters.gradeCategory)
  return cat ? cat.label : ''
})

// 活跃筛选条件数量
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.district) count++
  if (filters.school) count++
  if (filters.gradeCategory) count++
  if (filters.grade) count++
  if (filters.subject) count++
  if (filters.searchKeyword) count++
  if (filters.dateFrom || filters.dateTo) count++
  return count
})

// 选择器标题
const pickerTitle = computed(() => {
  const titles = {
    district: '选择地区',
    school: '选择学校',
    gradeCategory: '选择学段',
    grade: '选择年级',
    subject: '选择科目'
  }
  return titles[currentPickerType.value] || ''
})

// 选择器列数据
const pickerColumns = computed(() => {
  switch (currentPickerType.value) {
    case 'district':
      return [
        { text: '全部地区', value: '' },
        ...configStore.districts.map(d => ({ text: d.label, value: d.value }))
      ]
    
    case 'school':
      const district = filters.district
      const schoolList = district ? (schools[district] || []) : Object.values(schools).flat()
      return [
        { text: '全部学校', value: '' },
        ...schoolList.map(s => ({ text: s, value: s }))
      ]
    
    case 'gradeCategory':
      return [
        { text: '全部学段', value: '' },
        ...configStore.gradeCategories.map(c => ({ text: c.label, value: c.value }))
      ]
    
    case 'grade':
      let grades = []
      if (filters.gradeCategory) {
        grades = configStore.getGradesByCategory(filters.gradeCategory)
      } else {
        configStore.gradeCategories.forEach(cat => {
          grades = grades.concat(cat.grades)
        })
      }
      return [
        { text: '全部年级', value: '' },
        ...grades.map(g => ({ text: g, value: g }))
      ]
    
    case 'subject':
      let subjects = configStore.allSubjects
      if (filters.gradeCategory) {
        subjects = configStore.getSubjectsByCategory(filters.gradeCategory)
      }
      return [
        { text: '全部科目', value: '' },
        ...subjects.map(s => ({ text: s, value: s }))
      ]
    
    default:
      return []
  }
})

// 打开选择器
function openPicker(type) {
  currentPickerType.value = type
  activeTab.value = type
  showPicker.value = true
}

// 确认选择
function onConfirm({ selectedOptions }) {
  const value = selectedOptions[0]?.value || ''
  orderStore.setFilter(currentPickerType.value, value)
  showPicker.value = false
  activeTab.value = ''
  
  // 学段变化时清空年级和科目
  if (currentPickerType.value === 'gradeCategory') {
    orderStore.setFilter('grade', '')
    orderStore.setFilter('subject', '')
  }
  
  // 地区变化时清空学校
  if (currentPickerType.value === 'district') {
    orderStore.setFilter('school', '')
  }
}

// 判断是否选中
function isItemSelected(value) {
  return filters[currentPickerType.value] === value
}

// 选择项目
function onSelectItem(item) {
  orderStore.setFilter(currentPickerType.value, item.value)
  showPicker.value = false
  activeTab.value = ''
  
  // 学段变化时清空年级和科目
  if (currentPickerType.value === 'gradeCategory') {
    orderStore.setFilter('grade', '')
    orderStore.setFilter('subject', '')
  }
  
  // 地区变化时清空学校
  if (currentPickerType.value === 'district') {
    orderStore.setFilter('school', '')
  }
}

// 搜索
function handleSearch() {
  orderStore.setFilter('searchKeyword', searchKeyword.value)
}

// 清空搜索
function handleClear() {
  orderStore.setFilter('searchKeyword', '')
}

// 日期筛选
function handleDateChange() {
  orderStore.setFilter('dateFrom', dateFrom.value)
  orderStore.setFilter('dateTo', dateTo.value)
}

function clearDate() {
  dateFrom.value = ''
  dateTo.value = ''
  orderStore.setFilter('dateFrom', '')
  orderStore.setFilter('dateTo', '')
}

// 重置筛选
function handleReset() {
  orderStore.resetFilters()
  searchKeyword.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  showDatePicker.value = false
}

// 监听弹窗关闭
watch(showPicker, (val) => {
  if (!val) {
    activeTab.value = ''
  }
})
</script>

<style scoped>
.filter-section {
  background: #fff;
  border-radius: 16px 16px 0 0;
  margin-top: -16px;
  position: relative;
  z-index: 10;
  padding: 12px 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.search-bar {
  padding: 0 8px;
  width: 100%;
  max-width: 100%;
}

.search-bar :deep(.van-search__content) {
  background: #f5f7fa;
}

.filter-tabs {
  display: flex;
  padding: 12px 16px;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s;
  flex-shrink: 0;
}

.filter-tab.active,
.filter-tab:active {
  background: #3B82F6;
  color: #fff;
}

.filter-tab span {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-tab.date-tab {
  gap: 6px;
}

.filter-tab.date-tab span {
  max-width: 120px;
}

/* 日期筛选展开区 */
.date-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  gap: 10px;
  width: 100%;
  max-width: 100%;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.custom-date-picker {
  flex: 1;
  max-width: 150px;
}

.custom-date-picker :deep(.el-input__wrapper) {
  padding: 6px 10px;
  background: #fff;
}

.custom-date-picker :deep(.el-input__inner) {
  font-size: 13px;
}

.date-separator {
  font-size: 12px;
  color: #999;
  margin: 0 4px;
}

.date-clear {
  padding: 8px 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.date-clear:active {
  background: #e5e7eb;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
}

.filter-count {
  font-size: 12px;
  color: #999;
}

.filter-reset {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--primary-color);
  cursor: pointer;
}

.filter-reset:active {
  opacity: 0.7;
}

/* 选择器弹窗样式 */
.picker-content {
  max-height: 50vh;
  overflow-y: auto;
  padding: 8px 0 16px;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 15px;
  color: #333;
  transition: background 0.2s;
}

.picker-item:active {
  background: #f5f7fa;
}

.picker-item.active {
  color: #3B82F6;
  font-weight: 500;
}

.picker-item .check-icon {
  color: #3B82F6;
  font-size: 18px;
}

:deep(.van-action-sheet__header) {
  font-weight: 600;
  color: #333;
}

/* PC端适配 */
@media (min-width: 768px) {
  .filter-section {
    position: sticky;
    top: 0;
    z-index: 50;
  }
  
  .filter-tabs {
    justify-content: flex-start;
  }
  
  .date-inputs {
    max-width: 400px;
  }
  
  .date-inputs :deep(.el-date-editor) {
    max-width: 180px;
  }
}
</style>
