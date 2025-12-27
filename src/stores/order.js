import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API基础地址
const API_BASE = import.meta.env.VITE_API_BASE || 'https://jiajiaostore.top:8889/api'

export const useOrderStore = defineStore('order', () => {
  // 所有订单
  const orders = ref([])
  
  // 加载状态
  const loading = ref(false)
  const loaded = ref(false)
  
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
    city: '厦门市',
    district: '',
    address: '正在定位...'
  })
  
  // 从后端加载订单（前台）
  async function loadOrders() {
    if (loaded.value && orders.value.length > 0) return
    
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/orders`)
      if (res.ok) {
        const data = await res.json()
        orders.value = data.list || []
        loaded.value = true
        console.log('✅ 订单已从服务器加载')
      }
    } catch (e) {
      console.error('⚠️ 无法连接服务器:', e)
    } finally {
      loading.value = false
    }
  }
  
  // 从后端加载订单（后台管理）
  async function loadAdminOrders() {
    loading.value = true
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        console.warn('未登录')
        return
      }
      
      const res = await fetch(`${API_BASE}/orders/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        orders.value = data.list || []
        loaded.value = true
        console.log('✅ 订单已从服务器加载（管理员）')
      }
    } catch (e) {
      console.error('⚠️ 无法连接服务器:', e)
    } finally {
      loading.value = false
    }
  }
  
  // 创建订单
  async function createOrder(orderData) {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return { success: false, message: '未登录' }
      
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })
      
      if (res.ok) {
        const newOrder = await res.json()
        orders.value.unshift(newOrder)
        return { success: true, data: newOrder }
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '创建失败' }
      }
    } catch (e) {
      console.error('创建订单失败:', e)
      return { success: false, message: '网络错误' }
    }
  }
  
  // 更新订单
  async function updateOrder(id, orderData) {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return { success: false, message: '未登录' }
      
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })
      
      if (res.ok) {
        const updatedOrder = await res.json()
        const index = orders.value.findIndex(o => o.id === id)
        if (index > -1) {
          orders.value[index] = updatedOrder
        }
        return { success: true, data: updatedOrder }
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '更新失败' }
      }
    } catch (e) {
      console.error('更新订单失败:', e)
      return { success: false, message: '网络错误' }
    }
  }
  
  // 切换订单状态
  async function toggleOrderStatus(id) {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return { success: false, message: '未登录' }
      
      const res = await fetch(`${API_BASE}/orders/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const updatedOrder = await res.json()
        const index = orders.value.findIndex(o => o.id === id)
        if (index > -1) {
          orders.value[index] = updatedOrder
        }
        return { success: true, data: updatedOrder }
      } else {
        return { success: false, message: '切换失败' }
      }
    } catch (e) {
      console.error('切换状态失败:', e)
      return { success: false, message: '网络错误' }
    }
  }
  
  // 删除订单
  async function deleteOrder(id) {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return { success: false, message: '未登录' }
      
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const index = orders.value.findIndex(o => o.id === id)
        if (index > -1) {
          orders.value.splice(index, 1)
        }
        return { success: true }
      } else {
        return { success: false, message: '删除失败' }
      }
    } catch (e) {
      console.error('删除订单失败:', e)
      return { success: false, message: '网络错误' }
    }
  }
  
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
        order.subjects && order.subjects.includes(filters.value.subject)
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
    loading,
    loaded,
    filters,
    currentLocation,
    filteredOrders,
    // API方法
    loadOrders,
    loadAdminOrders,
    createOrder,
    updateOrder,
    toggleOrderStatus,
    deleteOrder,
    // 工具方法
    setFilter,
    resetFilters,
    updateLocation,
    getOrderById
  }
})
