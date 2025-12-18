// 学科分类数据
export const gradeCategories = {
  elementary: {
    name: '小学',
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    subjects: ['语文', '数学', '英语', '科学', '道德与法治', '美术', '音乐', '体育']
  },
  junior: {
    name: '初中',
    grades: ['初一', '初二', '初三'],
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '体育']
  },
  senior: {
    name: '高中',
    grades: ['高一', '高二', '高三'],
    subjects: [
      { name: '语文', type: '必修' },
      { name: '数学', type: '必修' },
      { name: '英语', type: '必修' },
      { name: '物理', type: '选修' },
      { name: '化学', type: '选修' },
      { name: '生物', type: '选修' },
      { name: '历史', type: '选修' },
      { name: '地理', type: '选修' },
      { name: '政治', type: '选修' }
    ]
  }
}

// 扁平化的年级列表
export const allGrades = [
  { value: 'grade1', label: '一年级', category: 'elementary' },
  { value: 'grade2', label: '二年级', category: 'elementary' },
  { value: 'grade3', label: '三年级', category: 'elementary' },
  { value: 'grade4', label: '四年级', category: 'elementary' },
  { value: 'grade5', label: '五年级', category: 'elementary' },
  { value: 'grade6', label: '六年级', category: 'elementary' },
  { value: 'junior1', label: '初一', category: 'junior' },
  { value: 'junior2', label: '初二', category: 'junior' },
  { value: 'junior3', label: '初三', category: 'junior' },
  { value: 'senior1', label: '高一', category: 'senior' },
  { value: 'senior2', label: '高二', category: 'senior' },
  { value: 'senior3', label: '高三', category: 'senior' }
]

// 所有科目
export const allSubjects = [
  '语文', '数学', '英语', '物理', '化学', '生物', 
  '历史', '地理', '政治', '科学', '道德与法治', 
  '美术', '音乐', '体育', '全科'
]

// 根据学段获取对应科目
export function getSubjectsByCategory(category) {
  const categoryData = gradeCategories[category]
  if (!categoryData) return allSubjects
  
  return categoryData.subjects.map(s => typeof s === 'string' ? s : s.name)
}

// 教师类型
export const teacherTypes = ['大学生', '机构老师', '专职老师', '在职老师', '不限']

// 上课时间选项
export const availableTimes = [
  '周一', '周二', '周三', '周四', '周五', '周六', '周日',
  '上午', '下午', '晚上', '寒暑假', '随时可约'
]
