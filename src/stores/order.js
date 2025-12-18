import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockOrders } from '../data/mockData'

export const useOrderStore = defineStore('order', () => {
  // 所有订单
  const orders = ref([...mockOrders])
  
  // 筛选条件
  const filters = ref({
    district: '',
    school: '',
    gradeCategory: '',
    grade: '',
    subject: '',
    searchKeyword: '',
    dateFrom: '',
    dateTo: ''
  })
  
  // 当前位置
  const currentLocation = ref({
    city: '深圳市',
    district: '',
    address: '正在定位...'
  })
  
  // 筛选后的订单
  const filteredOrders = computed(() => {
    let result = orders.value.filter(order => order.status === 'active')
    
    // 关键词搜索
    if (filters.value.searchKeyword) {
      const keyword = filters.value.searchKeyword.toLowerCase()
      result = result.filter(order => 
        order.id?.toLowerCase().includes(keyword) ||
        order.title?.toLowerCase().includes(keyword) ||
        order.district?.toLowerCase().includes(keyword) ||
        order.grade?.toLowerCase().includes(keyword) ||
        order.subjects?.some(s => s.toLowerCase().includes(keyword)) ||
        order.address?.toLowerCase().includes(keyword) ||
        order.school?.toLowerCase().includes(keyword)
      )
    }
    
    // 日期筛选
    if (filters.value.dateFrom) {
      result = result.filter(order => order.date >= filters.value.dateFrom)
    }
    if (filters.value.dateTo) {
      result = result.filter(order => order.date <= filters.value.dateTo)
    }
    
    // 地区筛选
    if (filters.value.district) {
      result = result.filter(order => order.district === filters.value.district)
    }
    
    // 学校筛选
    if (filters.value.school) {
      result = result.filter(order => order.school === filters.value.school)
    }
    
    // 学段筛选
    if (filters.value.gradeCategory) {
      result = result.filter(order => order.gradeCategory === filters.value.gradeCategory)
    }
    
    // 年级筛选
    if (filters.value.grade) {
      result = result.filter(order => order.grade === filters.value.grade)
    }
    
    // 科目筛选
    if (filters.value.subject) {
      result = result.filter(order => 
        order.subjects.includes(filters.value.subject)
      )
    }
    
    // 按日期排序（最新的在前）
    return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  })
  
  // 设置筛选条件
  function setFilter(key, value) {
    filters.value[key] = value
  }
  
  // 重置筛选
  function resetFilters() {
    filters.value = {
      district: '',
      school: '',
      gradeCategory: '',
      grade: '',
      subject: '',
      searchKeyword: '',
      dateFrom: '',
      dateTo: ''
    }
  }
  
  // 更新位置
  function updateLocation(location) {
    currentLocation.value = { ...currentLocation.value, ...location }
  }
  
  // 获取订单详情
  function getOrderById(id) {
    return orders.value.find(order => order.id === id)
  }
  
  return {
    orders,
    filters,
    currentLocation,
    filteredOrders,
    setFilter,
    resetFilters,
    updateLocation,
    getOrderById
  }
})
