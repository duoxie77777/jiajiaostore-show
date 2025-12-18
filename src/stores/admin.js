import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  // 管理员列表
  const admins = ref([
    { id: 1, username: 'admin', password: '123456', role: 'super', createTime: '2024-01-01' }
  ])

  // 当前登录的管理员
  const currentAdmin = ref(null)

  // 是否已登录
  const isLoggedIn = computed(() => currentAdmin.value !== null)

  // 是否是超级管理员
  const isSuperAdmin = computed(() => currentAdmin.value?.role === 'super')

  // 登录
  function login(username, password) {
    const admin = admins.value.find(a => a.username === username && a.password === password)
    if (admin) {
      currentAdmin.value = { ...admin }
      // 保存登录状态到 localStorage
      localStorage.setItem('adminToken', JSON.stringify({ id: admin.id, username: admin.username }))
      return { success: true }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  // 登出
  function logout() {
    currentAdmin.value = null
    localStorage.removeItem('adminToken')
  }

  // 检查登录状态（从 localStorage 恢复）
  function checkAuth() {
    const token = localStorage.getItem('adminToken')
    if (token) {
      try {
        const { id, username } = JSON.parse(token)
        const admin = admins.value.find(a => a.id === id && a.username === username)
        if (admin) {
          currentAdmin.value = { ...admin }
          return true
        }
      } catch (e) {
        localStorage.removeItem('adminToken')
      }
    }
    return false
  }

  // 新增管理员
  function addAdmin(username, password) {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' }
    }
    if (admins.value.some(a => a.username === username)) {
      return { success: false, message: '用户名已存在' }
    }
    const newAdmin = {
      id: Date.now(),
      username,
      password,
      role: 'normal',
      createTime: new Date().toISOString().split('T')[0]
    }
    admins.value.push(newAdmin)
    return { success: true }
  }

  // 修改密码
  function changePassword(adminId, oldPassword, newPassword) {
    const admin = admins.value.find(a => a.id === adminId)
    if (!admin) {
      return { success: false, message: '管理员不存在' }
    }
    if (admin.password !== oldPassword) {
      return { success: false, message: '原密码错误' }
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: '新密码至少6位' }
    }
    admin.password = newPassword
    return { success: true }
  }

  // 重置密码（超级管理员专用）
  function resetPassword(adminId, newPassword) {
    if (!isSuperAdmin.value) {
      return { success: false, message: '无权限操作' }
    }
    const admin = admins.value.find(a => a.id === adminId)
    if (!admin) {
      return { success: false, message: '管理员不存在' }
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: '新密码至少6位' }
    }
    admin.password = newPassword
    return { success: true }
  }

  // 删除管理员
  function deleteAdmin(adminId) {
    if (!isSuperAdmin.value) {
      return { success: false, message: '无权限操作' }
    }
    const admin = admins.value.find(a => a.id === adminId)
    if (!admin) {
      return { success: false, message: '管理员不存在' }
    }
    if (admin.role === 'super') {
      return { success: false, message: '不能删除超级管理员' }
    }
    const index = admins.value.findIndex(a => a.id === adminId)
    admins.value.splice(index, 1)
    return { success: true }
  }

  return {
    admins,
    currentAdmin,
    isLoggedIn,
    isSuperAdmin,
    login,
    logout,
    checkAuth,
    addAdmin,
    changePassword,
    resetPassword,
    deleteAdmin
  }
})
