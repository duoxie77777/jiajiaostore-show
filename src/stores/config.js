import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API基础地址
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

export const useConfigStore = defineStore('config', () => {
  // 是否已加载
  const loaded = ref(false)
  
  // 地区配置
  const districts = ref([
    { value: '南山区', label: '南山区' },
    { value: '福田区', label: '福田区' },
    { value: '罗湖区', label: '罗湖区' },
    { value: '宝安区', label: '宝安区' },
    { value: '龙岗区', label: '龙岗区' },
    { value: '龙华区', label: '龙华区' },
    { value: '光明区', label: '光明区' },
    { value: '坪山区', label: '坪山区' },
    { value: '盐田区', label: '盐田区' },
    { value: '大鹏新区', label: '大鹏新区' }
  ])

  // 学段配置
  const gradeCategories = ref([
    { 
      value: 'elementary', 
      label: '小学',
      grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
    },
    { 
      value: 'junior', 
      label: '初中',
      grades: ['初一', '初二', '初三']
    },
    { 
      value: 'senior', 
      label: '高中',
      grades: ['高一', '高二', '高三']
    }
  ])

  // 科目配置（按学段）
  const subjects = ref({
    elementary: ['语文', '数学', '英语', '科学', '道德与法治', '美术', '音乐'],
    junior: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'],
    senior: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治']
  })

  // 教师类型配置
  const teacherTypes = ref(['大学生', '机构老师', '专职老师', '在职老师', '不限'])

  // 可选时间配置
  const timeOptions = ref(['周一', '周二', '周三', '周四', '周五', '周六', '周日', '上午', '下午', '晚上', '寒暑假', '随时可约'])

  // 从后端加载配置
  async function loadConfigs() {
    try {
      const res = await fetch(`${API_BASE}/configs`)
      if (res.ok) {
        const data = await res.json()
        if (data.districts) districts.value = data.districts
        if (data.gradeCategories) {
          gradeCategories.value = data.gradeCategories
          // 同步科目数据
          const newSubjects = {}
          data.gradeCategories.forEach(cat => {
            if (cat.subjects) {
              newSubjects[cat.value] = cat.subjects
            }
          })
          if (Object.keys(newSubjects).length > 0) {
            subjects.value = newSubjects
          }
        }
        if (data.teacherTypes) teacherTypes.value = data.teacherTypes
        if (data.timeOptions) timeOptions.value = data.timeOptions
        loaded.value = true
        console.log('✅ 配置已从服务器加载')
      }
    } catch (e) {
      console.warn('⚠️ 无法连接服务器，使用本地配置', e)
    }
  }

  // 保存配置到后端
  async function saveConfig(key, value) {
    const token = localStorage.getItem('admin_token')
    if (!token) return false
    
    try {
      const res = await fetch(`${API_BASE}/configs/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      })
      return res.ok
    } catch (e) {
      console.error('保存配置失败:', e)
      return false
    }
  }

  // 保存地区配置
  async function syncDistricts() {
    return saveConfig('districts', districts.value)
  }

  // 保存学段配置（包含科目）
  async function syncGradeCategories() {
    // 将科目合并到学段数据中
    const data = gradeCategories.value.map(cat => ({
      ...cat,
      subjects: subjects.value[cat.value] || []
    }))
    return saveConfig('gradeCategories', data)
  }

  // 保存教师类型配置
  async function syncTeacherTypes() {
    return saveConfig('teacherTypes', teacherTypes.value)
  }

  // 保存时间选项配置
  async function syncTimeOptions() {
    return saveConfig('timeOptions', timeOptions.value)
  }

  // 获取所有年级（扁平化）
  const allGrades = computed(() => {
    const result = []
    gradeCategories.value.forEach(cat => {
      cat.grades.forEach(grade => {
        result.push({ value: grade, label: grade, category: cat.value })
      })
    })
    return result
  })

  // 获取所有科目（扁平化）
  const allSubjects = computed(() => {
    const set = new Set()
    Object.values(subjects.value).forEach(arr => {
      arr.forEach(s => set.add(s))
    })
    return Array.from(set)
  })

  // 根据学段获取年级
  function getGradesByCategory(category) {
    const cat = gradeCategories.value.find(c => c.value === category)
    return cat ? cat.grades : []
  }

  // 根据学段获取科目
  function getSubjectsByCategory(category) {
    return subjects.value[category] || allSubjects.value
  }

  // ========== 地区操作 ==========
  function addDistrict(name) {
    if (!name || districts.value.some(d => d.value === name)) return false
    districts.value.push({ value: name, label: name })
    return true
  }

  function updateDistrict(oldValue, newValue) {
    const index = districts.value.findIndex(d => d.value === oldValue)
    if (index > -1 && newValue) {
      districts.value[index] = { value: newValue, label: newValue }
      return true
    }
    return false
  }

  function deleteDistrict(value) {
    const index = districts.value.findIndex(d => d.value === value)
    if (index > -1) {
      districts.value.splice(index, 1)
      return true
    }
    return false
  }

  // ========== 学段操作 ==========
  function addGradeCategory(label, grades = []) {
    const value = `category_${Date.now()}`
    if (!label) return false
    gradeCategories.value.push({ value, label, grades })
    subjects.value[value] = []
    return true
  }

  function updateGradeCategory(value, newLabel) {
    const cat = gradeCategories.value.find(c => c.value === value)
    if (cat && newLabel) {
      cat.label = newLabel
      return true
    }
    return false
  }

  function deleteGradeCategory(value) {
    const index = gradeCategories.value.findIndex(c => c.value === value)
    if (index > -1) {
      gradeCategories.value.splice(index, 1)
      delete subjects.value[value]
      return true
    }
    return false
  }

  // ========== 年级操作 ==========
  function addGrade(categoryValue, gradeName) {
    const cat = gradeCategories.value.find(c => c.value === categoryValue)
    if (cat && gradeName && !cat.grades.includes(gradeName)) {
      cat.grades.push(gradeName)
      return true
    }
    return false
  }

  function updateGrade(categoryValue, oldName, newName) {
    const cat = gradeCategories.value.find(c => c.value === categoryValue)
    if (cat && newName) {
      const index = cat.grades.indexOf(oldName)
      if (index > -1) {
        cat.grades[index] = newName
        return true
      }
    }
    return false
  }

  function deleteGrade(categoryValue, gradeName) {
    const cat = gradeCategories.value.find(c => c.value === categoryValue)
    if (cat) {
      const index = cat.grades.indexOf(gradeName)
      if (index > -1) {
        cat.grades.splice(index, 1)
        return true
      }
    }
    return false
  }

  // ========== 科目操作 ==========
  function addSubject(categoryValue, subjectName) {
    if (!subjects.value[categoryValue]) {
      subjects.value[categoryValue] = []
    }
    if (subjectName && !subjects.value[categoryValue].includes(subjectName)) {
      subjects.value[categoryValue].push(subjectName)
      return true
    }
    return false
  }

  function updateSubject(categoryValue, oldName, newName) {
    if (subjects.value[categoryValue] && newName) {
      const index = subjects.value[categoryValue].indexOf(oldName)
      if (index > -1) {
        subjects.value[categoryValue][index] = newName
        return true
      }
    }
    return false
  }

  function deleteSubject(categoryValue, subjectName) {
    if (subjects.value[categoryValue]) {
      const index = subjects.value[categoryValue].indexOf(subjectName)
      if (index > -1) {
        subjects.value[categoryValue].splice(index, 1)
        return true
      }
    }
    return false
  }

  // ========== 教师类型操作 ==========
  function addTeacherType(name) {
    if (name && !teacherTypes.value.includes(name)) {
      teacherTypes.value.push(name)
      return true
    }
    return false
  }

  function updateTeacherType(oldName, newName) {
    const index = teacherTypes.value.indexOf(oldName)
    if (index > -1 && newName) {
      teacherTypes.value[index] = newName
      return true
    }
    return false
  }

  function deleteTeacherType(name) {
    const index = teacherTypes.value.indexOf(name)
    if (index > -1) {
      teacherTypes.value.splice(index, 1)
      return true
    }
    return false
  }

  // ========== 时间选项操作 ==========
  function addTimeOption(name) {
    if (name && !timeOptions.value.includes(name)) {
      timeOptions.value.push(name)
      return true
    }
    return false
  }

  function updateTimeOption(oldName, newName) {
    const index = timeOptions.value.indexOf(oldName)
    if (index > -1 && newName) {
      timeOptions.value[index] = newName
      return true
    }
    return false
  }

  function deleteTimeOption(name) {
    const index = timeOptions.value.indexOf(name)
    if (index > -1) {
      timeOptions.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    loaded,
    districts,
    gradeCategories,
    subjects,
    teacherTypes,
    timeOptions,
    allGrades,
    allSubjects,
    getGradesByCategory,
    getSubjectsByCategory,
    // API同步
    loadConfigs,
    syncDistricts,
    syncGradeCategories,
    syncTeacherTypes,
    syncTimeOptions,
    // 地区
    addDistrict,
    updateDistrict,
    deleteDistrict,
    // 学段
    addGradeCategory,
    updateGradeCategory,
    deleteGradeCategory,
    // 年级
    addGrade,
    updateGrade,
    deleteGrade,
    // 科目
    addSubject,
    updateSubject,
    deleteSubject,
    // 教师类型
    addTeacherType,
    updateTeacherType,
    deleteTeacherType,
    // 时间选项
    addTimeOption,
    updateTimeOption,
    deleteTimeOption
  }
})
