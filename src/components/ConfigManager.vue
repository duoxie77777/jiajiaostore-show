<template>
  <div class="config-manager">
    <!-- 配置类型切换 -->
    <div class="config-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        class="config-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 地区配置 -->
    <div v-if="activeTab === 'district'" class="config-section">
      <div class="section-header">
        <h3>地区管理</h3>
        <button class="add-btn" @click="openAddModal('district')">
          <van-icon name="plus" /> 新增
        </button>
      </div>
      <div class="config-list">
        <div v-for="item in configStore.districts" :key="item.value" class="config-item">
          <span class="item-name">{{ item.label }}</span>
          <div class="item-actions">
            <button class="edit-btn" @click="openEditModal('district', item.value, item.label)">
              <van-icon name="edit" />
            </button>
            <button class="delete-btn" @click="handleDelete('district', item.value)">
              <van-icon name="delete-o" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 学段与年级配置 -->
    <div v-if="activeTab === 'grade'" class="config-section">
      <div class="section-header">
        <h3>学段与年级管理</h3>
        <button class="add-btn" @click="openAddModal('gradeCategory')">
          <van-icon name="plus" /> 新增学段
        </button>
      </div>
      <div class="grade-categories">
        <div v-for="cat in configStore.gradeCategories" :key="cat.value" class="category-block">
          <div class="category-header">
            <span class="category-name">{{ cat.label }}</span>
            <div class="category-actions">
              <button class="edit-btn" @click="openEditModal('gradeCategory', cat.value, cat.label)">
                <van-icon name="edit" />
              </button>
              <button class="delete-btn" @click="handleDelete('gradeCategory', cat.value)">
                <van-icon name="delete-o" />
              </button>
            </div>
          </div>
          <div class="grade-list">
            <span 
              v-for="grade in cat.grades" 
              :key="grade" 
              class="grade-tag"
            >
              {{ grade }}
              <van-icon name="edit" class="tag-edit" @click="openEditModal('grade', grade, grade, cat.value)" />
              <van-icon name="cross" class="tag-delete" @click="handleDelete('grade', grade, cat.value)" />
            </span>
            <button class="add-grade-btn" @click="openAddModal('grade', cat.value)">
              <van-icon name="plus" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 科目配置 -->
    <div v-if="activeTab === 'subject'" class="config-section">
      <div class="section-header">
        <h3>辅导科目管理</h3>
      </div>
      <div class="grade-categories">
        <div v-for="cat in configStore.gradeCategories" :key="cat.value" class="category-block">
          <div class="category-header">
            <span class="category-name">{{ cat.label }}</span>
          </div>
          <div class="grade-list">
            <span 
              v-for="subject in configStore.subjects[cat.value]" 
              :key="subject" 
              class="grade-tag subject-tag"
            >
              {{ subject }}
              <van-icon name="edit" class="tag-edit" @click="openEditModal('subject', subject, subject, cat.value)" />
              <van-icon name="cross" class="tag-delete" @click="handleDelete('subject', subject, cat.value)" />
            </span>
            <button class="add-grade-btn" @click="openAddModal('subject', cat.value)">
              <van-icon name="plus" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 教师类型配置 -->
    <div v-if="activeTab === 'teacher'" class="config-section">
      <div class="section-header">
        <h3>教师类型管理</h3>
        <button class="add-btn" @click="openAddModal('teacher')">
          <van-icon name="plus" /> 新增
        </button>
      </div>
      <div class="config-list">
        <div v-for="item in configStore.teacherTypes" :key="item" class="config-item">
          <span class="item-name">{{ item }}</span>
          <div class="item-actions">
            <button class="edit-btn" @click="openEditModal('teacher', item, item)">
              <van-icon name="edit" />
            </button>
            <button class="delete-btn" @click="handleDelete('teacher', item)">
              <van-icon name="delete-o" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-dialog
      v-model:show="showModal"
      :title="modalTitle"
      show-cancel-button
      @confirm="handleSubmit"
    >
      <div class="modal-form">
        <input 
          v-model="inputValue" 
          :placeholder="inputPlaceholder"
          class="modal-input"
        />
      </div>
    </van-dialog>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      message="确定要删除吗？"
      show-cancel-button
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '../stores/config'
import { showToast, showLoadingToast, closeToast } from 'vant'

const configStore = useConfigStore()

const tabs = [
  { key: 'district', label: '地区' },
  { key: 'grade', label: '学段/年级' },
  { key: 'subject', label: '科目' },
  { key: 'teacher', label: '教师类型' }
]

const activeTab = ref('district')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const inputValue = ref('')
const syncing = ref(false)

// 当前操作信息
const currentAction = ref({
  type: '', // district, gradeCategory, grade, subject, teacher, time
  mode: '', // add, edit
  oldValue: '',
  categoryValue: '' // 用于年级和科目
})

// 弹窗标题
const modalTitle = ref('')
const inputPlaceholder = ref('')

// 删除信息
const deleteInfo = ref({
  type: '',
  value: '',
  categoryValue: ''
})

// 加载配置
onMounted(async () => {
  await configStore.loadConfigs()
})

// 同步到后端
async function syncToServer(type) {
  syncing.value = true
  let success = false
  
  switch (type) {
    case 'district':
      success = await configStore.syncDistricts()
      break
    case 'gradeCategory':
    case 'grade':
    case 'subject':
      success = await configStore.syncGradeCategories()
      break
    case 'teacher':
      success = await configStore.syncTeacherTypes()
      break
  }
  
  syncing.value = false
  return success
}

// 打开新增弹窗
function openAddModal(type, categoryValue = '') {
  currentAction.value = {
    type,
    mode: 'add',
    oldValue: '',
    categoryValue
  }
  inputValue.value = ''
  
  const titles = {
    district: '新增地区',
    gradeCategory: '新增学段',
    grade: '新增年级',
    subject: '新增科目',
    teacher: '新增教师类型'
  }
  modalTitle.value = titles[type]
  inputPlaceholder.value = `请输入${titles[type].replace('新增', '')}名称`
  showModal.value = true
}

// 打开编辑弹窗
function openEditModal(type, oldValue, currentValue, categoryValue = '') {
  currentAction.value = {
    type,
    mode: 'edit',
    oldValue,
    categoryValue
  }
  inputValue.value = currentValue
  
  const titles = {
    district: '编辑地区',
    gradeCategory: '编辑学段',
    grade: '编辑年级',
    subject: '编辑科目',
    teacher: '编辑教师类型'
  }
  modalTitle.value = titles[type]
  inputPlaceholder.value = `请输入新名称`
  showModal.value = true
}

// 提交表单
async function handleSubmit() {
  const { type, mode, oldValue, categoryValue } = currentAction.value
  const value = inputValue.value.trim()
  
  if (!value) {
    showToast('请输入内容')
    return
  }

  let success = false

  if (mode === 'add') {
    switch (type) {
      case 'district':
        success = configStore.addDistrict(value)
        break
      case 'gradeCategory':
        success = configStore.addGradeCategory(value)
        break
      case 'grade':
        success = configStore.addGrade(categoryValue, value)
        break
      case 'subject':
        success = configStore.addSubject(categoryValue, value)
        break
      case 'teacher':
        success = configStore.addTeacherType(value)
        break
    }
  } else {
    switch (type) {
      case 'district':
        success = configStore.updateDistrict(oldValue, value)
        break
      case 'gradeCategory':
        success = configStore.updateGradeCategory(oldValue, value)
        break
      case 'grade':
        success = configStore.updateGrade(categoryValue, oldValue, value)
        break
      case 'subject':
        success = configStore.updateSubject(categoryValue, oldValue, value)
        break
      case 'teacher':
        success = configStore.updateTeacherType(oldValue, value)
        break
    }
  }

  if (success) {
    showLoadingToast({ message: '同步中...', forbidClick: true })
    const synced = await syncToServer(type)
    closeToast()
    showToast(synced ? (mode === 'add' ? '添加成功' : '修改成功') : '本地已保存，同步失败')
  } else {
    showToast('操作失败，可能已存在相同项')
  }
}

// 删除
function handleDelete(type, value, categoryValue = '') {
  deleteInfo.value = { type, value, categoryValue }
  showDeleteConfirm.value = true
}

// 确认删除
async function confirmDelete() {
  const { type, value, categoryValue } = deleteInfo.value
  let success = false

  switch (type) {
    case 'district':
      success = configStore.deleteDistrict(value)
      break
    case 'gradeCategory':
      success = configStore.deleteGradeCategory(value)
      break
    case 'grade':
      success = configStore.deleteGrade(categoryValue, value)
      break
    case 'subject':
      success = configStore.deleteSubject(categoryValue, value)
      break
    case 'teacher':
      success = configStore.deleteTeacherType(value)
      break
  }

  if (success) {
    showLoadingToast({ message: '同步中...', forbidClick: true })
    const synced = await syncToServer(type)
    closeToast()
    showToast(synced ? '删除成功' : '本地已删除，同步失败')
  } else {
    showToast('删除失败')
  }
}
</script>

<style scoped>
.config-manager {
  padding: 16px;
}

.config-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.config-tab {
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.config-tab.active {
  background: #3B82F6;
  color: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 10px;
}

.item-name {
  font-size: 14px;
  color: #333;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-btn {
  background: #EFF6FF;
  color: #3B82F6;
}

.delete-btn {
  background: #FEE2E2;
  color: #EF4444;
}

.grade-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-block {
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.category-actions {
  display: flex;
  gap: 6px;
}

.category-actions .edit-btn,
.category-actions .delete-btn {
  width: 28px;
  height: 28px;
}

.grade-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.grade-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
}

.subject-tag {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #3B82F6;
}

.tag-edit,
.tag-delete {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.tag-edit:hover {
  color: #3B82F6;
}

.tag-delete:hover {
  color: #EF4444;
}

.add-grade-btn {
  width: 32px;
  height: 32px;
  border: 1px dashed #ccc;
  border-radius: 50%;
  background: #fff;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-grade-btn:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.modal-form {
  padding: 20px 16px;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.modal-input:focus {
  border-color: #3B82F6;
}
</style>
