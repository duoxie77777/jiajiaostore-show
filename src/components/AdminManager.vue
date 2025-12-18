<template>
  <div class="admin-manager">
    <!-- 管理员列表 -->
    <div class="admin-list">
      <div class="list-header">
        <h3>管理员列表</h3>
        <button class="add-admin-btn" @click="openAddModal" v-if="adminStore.isSuperAdmin">
          <van-icon name="plus" />
          <span>新增</span>
        </button>
      </div>

      <div class="admin-item" v-for="admin in adminStore.admins" :key="admin.id">
        <div class="admin-info">
          <div class="admin-avatar">
            <van-icon name="manager" />
          </div>
          <div class="admin-detail">
            <div class="admin-name">
              {{ admin.username }}
              <span class="admin-role" :class="admin.role">
                {{ admin.role === 'super' ? '超级管理员' : '普通管理员' }}
              </span>
            </div>
            <div class="admin-time">创建于 {{ admin.createTime }}</div>
          </div>
        </div>
        <div class="admin-actions">
          <button 
            class="action-btn password" 
            @click="openPasswordModal(admin)"
            v-if="adminStore.isSuperAdmin || admin.id === adminStore.currentAdmin?.id"
          >
            <van-icon name="edit" />
          </button>
          <button 
            class="action-btn delete" 
            @click="confirmDeleteAdmin(admin)"
            v-if="adminStore.isSuperAdmin && admin.role !== 'super'"
          >
            <van-icon name="delete-o" />
          </button>
        </div>
      </div>
    </div>

    <!-- 当前账号密码修改 -->
    <div class="change-own-password" v-if="!adminStore.isSuperAdmin">
      <h3>修改我的密码</h3>
      <div class="form-group">
        <label>原密码</label>
        <input v-model="ownPassword.old" type="password" placeholder="请输入原密码" />
      </div>
      <div class="form-group">
        <label>新密码</label>
        <input v-model="ownPassword.new" type="password" placeholder="请输入新密码（至少6位）" />
      </div>
      <div class="form-group">
        <label>确认密码</label>
        <input v-model="ownPassword.confirm" type="password" placeholder="请再次输入新密码" />
      </div>
      <button class="save-btn" @click="changeOwnPassword">保存修改</button>
    </div>

    <!-- 新增管理员弹窗 -->
    <van-popup 
      v-model:show="showAddModal" 
      position="center" 
      :style="{ width: '90%', maxWidth: '360px', borderRadius: '12px' }"
    >
      <div class="modal-content">
        <h3 class="modal-title">新增管理员</h3>
        <div class="form-group">
          <label>用户名 <span class="required">*</span></label>
          <input v-model="newAdmin.username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label>密码 <span class="required">*</span></label>
          <input v-model="newAdmin.password" type="password" placeholder="请输入密码（至少6位）" />
        </div>
        <div class="form-group">
          <label>确认密码 <span class="required">*</span></label>
          <input v-model="newAdmin.confirmPassword" type="password" placeholder="请再次输入密码" />
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddModal = false">取消</button>
          <button class="submit-btn" @click="addNewAdmin">确认添加</button>
        </div>
      </div>
    </van-popup>

    <!-- 修改密码弹窗 -->
    <van-popup 
      v-model:show="showPasswordModal" 
      position="center" 
      :style="{ width: '90%', maxWidth: '360px', borderRadius: '12px' }"
    >
      <div class="modal-content">
        <h3 class="modal-title">修改密码</h3>
        <p class="modal-subtitle">用户：{{ editingAdmin?.username }}</p>
        
        <!-- 超级管理员可以直接重置 -->
        <template v-if="adminStore.isSuperAdmin && editingAdmin?.id !== adminStore.currentAdmin?.id">
          <div class="form-group">
            <label>新密码 <span class="required">*</span></label>
            <input v-model="passwordForm.new" type="password" placeholder="请输入新密码（至少6位）" />
          </div>
          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input v-model="passwordForm.confirm" type="password" placeholder="请再次输入新密码" />
          </div>
        </template>
        
        <!-- 修改自己的密码需要验证原密码 -->
        <template v-else>
          <div class="form-group">
            <label>原密码 <span class="required">*</span></label>
            <input v-model="passwordForm.old" type="password" placeholder="请输入原密码" />
          </div>
          <div class="form-group">
            <label>新密码 <span class="required">*</span></label>
            <input v-model="passwordForm.new" type="password" placeholder="请输入新密码（至少6位）" />
          </div>
          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input v-model="passwordForm.confirm" type="password" placeholder="请再次输入新密码" />
          </div>
        </template>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showPasswordModal = false">取消</button>
          <button class="submit-btn" @click="submitPasswordChange">确认修改</button>
        </div>
      </div>
    </van-popup>

    <!-- 删除确认 -->
    <van-dialog
      v-model:show="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除管理员「${adminToDelete?.username}」吗？`"
      show-cancel-button
      @confirm="deleteAdmin"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminStore } from '../stores/admin'
import { showToast } from 'vant'

const adminStore = useAdminStore()

// 新增管理员
const showAddModal = ref(false)
const newAdmin = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

function openAddModal() {
  newAdmin.value = { username: '', password: '', confirmPassword: '' }
  showAddModal.value = true
}

function addNewAdmin() {
  if (!newAdmin.value.username) {
    showToast('请输入用户名')
    return
  }
  if (!newAdmin.value.password || newAdmin.value.password.length < 6) {
    showToast('密码至少6位')
    return
  }
  if (newAdmin.value.password !== newAdmin.value.confirmPassword) {
    showToast('两次密码不一致')
    return
  }
  
  const result = adminStore.addAdmin(newAdmin.value.username, newAdmin.value.password)
  if (result.success) {
    showToast('添加成功')
    showAddModal.value = false
  } else {
    showToast(result.message)
  }
}

// 修改密码
const showPasswordModal = ref(false)
const editingAdmin = ref(null)
const passwordForm = ref({
  old: '',
  new: '',
  confirm: ''
})

function openPasswordModal(admin) {
  editingAdmin.value = admin
  passwordForm.value = { old: '', new: '', confirm: '' }
  showPasswordModal.value = true
}

function submitPasswordChange() {
  if (!passwordForm.value.new || passwordForm.value.new.length < 6) {
    showToast('新密码至少6位')
    return
  }
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showToast('两次密码不一致')
    return
  }

  let result
  // 超级管理员修改他人密码
  if (adminStore.isSuperAdmin && editingAdmin.value?.id !== adminStore.currentAdmin?.id) {
    result = adminStore.resetPassword(editingAdmin.value.id, passwordForm.value.new)
  } else {
    // 修改自己的密码
    if (!passwordForm.value.old) {
      showToast('请输入原密码')
      return
    }
    result = adminStore.changePassword(editingAdmin.value.id, passwordForm.value.old, passwordForm.value.new)
  }

  if (result.success) {
    showToast('修改成功')
    showPasswordModal.value = false
  } else {
    showToast(result.message)
  }
}

// 普通管理员修改自己密码
const ownPassword = ref({
  old: '',
  new: '',
  confirm: ''
})

function changeOwnPassword() {
  if (!ownPassword.value.old) {
    showToast('请输入原密码')
    return
  }
  if (!ownPassword.value.new || ownPassword.value.new.length < 6) {
    showToast('新密码至少6位')
    return
  }
  if (ownPassword.value.new !== ownPassword.value.confirm) {
    showToast('两次密码不一致')
    return
  }

  const result = adminStore.changePassword(
    adminStore.currentAdmin.id, 
    ownPassword.value.old, 
    ownPassword.value.new
  )
  
  if (result.success) {
    showToast('修改成功')
    ownPassword.value = { old: '', new: '', confirm: '' }
  } else {
    showToast(result.message)
  }
}

// 删除管理员
const showDeleteConfirm = ref(false)
const adminToDelete = ref(null)

function confirmDeleteAdmin(admin) {
  adminToDelete.value = admin
  showDeleteConfirm.value = true
}

function deleteAdmin() {
  const result = adminStore.deleteAdmin(adminToDelete.value.id)
  if (result.success) {
    showToast('删除成功')
  } else {
    showToast(result.message)
  }
  adminToDelete.value = null
}
</script>

<style scoped>
.admin-manager {
  padding: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  font-size: 15px;
  color: #333;
  margin: 0;
}

.add-admin-btn {
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

.admin-list {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.admin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.admin-item:last-child {
  border-bottom: none;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  background: #EFF6FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3B82F6;
  font-size: 20px;
}

.admin-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-role {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: normal;
}

.admin-role.super {
  background: #FEF3C7;
  color: #D97706;
}

.admin-role.normal {
  background: #E5E7EB;
  color: #6B7280;
}

.admin-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.admin-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-btn.password {
  background: #EFF6FF;
  color: #3B82F6;
}

.action-btn.delete {
  background: #FEE2E2;
  color: #EF4444;
}

/* 修改自己密码区域 */
.change-own-password {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.change-own-password h3 {
  font-size: 15px;
  color: #333;
  margin: 0 0 16px;
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

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
}

.form-group input:focus {
  border-color: #3B82F6;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

/* 弹窗样式 */
.modal-content {
  padding: 20px;
}

.modal-title {
  font-size: 17px;
  color: #333;
  text-align: center;
  margin: 0 0 8px;
}

.modal-subtitle {
  font-size: 13px;
  color: #999;
  text-align: center;
  margin: 0 0 20px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
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
</style>
