import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API基础地址
const API_BASE = import.meta.env.VITE_API_BASE || 'https://jiajiaostore.top:8889/api'

export const useAdminStore = defineStore('admin', () => {
  // 管理员列表
  const admins = ref([])

  // 当前登录的管理员
  const currentAdmin = ref(null)

  // 是否已登录
  const isLoggedIn = computed(() => currentAdmin.value !== null)

  // 是否是超级管理员
  const isSuperAdmin = computed(() => currentAdmin.value?.role === 'super')

  // 登录
  async function login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()
      
      // 后端返回的数据格式统一为 { success, message?, token?, user? }
      if (data.success && data.token) {
        // 登录成功
        localStorage.setItem('admin_token', data.token)
        // 保存管理员信息 (后端返回的是 user 字段)
        currentAdmin.value = data.user
        return { success: true }
      } else {
        // 登录失败，返回后端的错误信息
        return { success: false, message: data.message || '登录失败' }
      }
    } catch (e) {
      console.error('登录失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  // 登出
  function logout() {
    currentAdmin.value = null
    localStorage.removeItem('admin_token')
  }

  // 检查登录状态（从后端获取当前用户信息）
  async function checkAuth() {
    const token = localStorage.getItem('admin_token')
    if (!token) return false

    try {
      const res = await fetch(`${API_BASE}/admins/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const admin = await res.json()
        currentAdmin.value = admin
        return true
      } else {
        // Token 无效，清除
        logout()
        return false
      }
    } catch (e) {
      console.error('验证登录状态失败:', e)
      logout()
      return false
    }
  }

  // 加载所有管理员
  async function loadAdmins() {
    const token = localStorage.getItem('admin_token')
    if (!token) return { success: false, message: '未登录' }

    try {
      const res = await fetch(`${API_BASE}/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        admins.value = data
        return { success: true }
      } else {
        return { success: false, message: '加载失败' }
      }
    } catch (e) {
      console.error('加载管理员列表失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  // 新增管理员
  async function addAdmin(username, password) {
    const token = localStorage.getItem('admin_token')
    if (!token) return { success: false, message: '未登录' }

    try {
      const res = await fetch(`${API_BASE}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        const newAdmin = await res.json()
        // 重新加载管理员列表
        await loadAdmins()
        return { success: true, data: newAdmin }
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '创建失败' }
      }
    } catch (e) {
      console.error('创建管理员失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  // 修改密码
  async function changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('admin_token')
    if (!token) return { success: false, message: '未登录' }

    try {
      const res = await fetch(`${API_BASE}/admins/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (res.ok) {
        const data = await res.json()
        return data
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '修改失败' }
      }
    } catch (e) {
      console.error('修改密码失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  // 重置密码（超级管理员专用）
  async function resetPassword(adminId, newPassword) {
    const token = localStorage.getItem('admin_token')
    if (!token) return { success: false, message: '未登录' }

    try {
      const res = await fetch(`${API_BASE}/admins/${adminId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })

      if (res.ok) {
        const data = await res.json()
        return data
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '重置失败' }
      }
    } catch (e) {
      console.error('重置密码失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  // 删除管理员
  async function deleteAdmin(adminId) {
    const token = localStorage.getItem('admin_token')
    if (!token) return { success: false, message: '未登录' }

    try {
      const res = await fetch(`${API_BASE}/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        // 重新加载管理员列表
        await loadAdmins()
        return { success: true }
      } else {
        const error = await res.json()
        return { success: false, message: error.message || '删除失败' }
      }
    } catch (e) {
      console.error('删除管理员失败:', e)
      return { success: false, message: '网络错误' }
    }
  }

  return {
    admins,
    currentAdmin,
    isLoggedIn,
    isSuperAdmin,
    login,
    logout,
    checkAuth,
    loadAdmins,
    addAdmin,
    changePassword,
    resetPassword,
    deleteAdmin
  }
})
