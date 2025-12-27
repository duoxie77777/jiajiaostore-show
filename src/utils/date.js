/**
 * 日期时间格式化工具
 */

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或ISO字符串
 * @param {string} format - 格式 'datetime' | 'date' | 'time'
 * @returns {string} 格式化后的字符串
 */
export function formatDateTime(date, format = 'datetime') {
  if (!date) return '-'
  
  const d = new Date(date)
  
  // 检查是否为有效日期
  if (isNaN(d.getTime())) return '-'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * 格式化为友好的相对时间
 * @param {string|Date} date - 日期对象或ISO字符串
 * @returns {string} 如 "刚刚"、"3分钟前"、"2小时前"
 */
export function formatRelativeTime(date) {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const now = new Date()
  const diff = now - d // 毫秒差
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 格式化为简洁日期
 * @param {string|Date} date - 日期对象或ISO字符串
 * @returns {string} 如 "2024-01-01"
 */
export function formatDate(date) {
  return formatDateTime(date, 'date')
}

/**
 * 格式化为简洁时间
 * @param {string|Date} date - 日期对象或ISO字符串
 * @returns {string} 如 "14:30:00"
 */
export function formatTime(date) {
  return formatDateTime(date, 'time')
}

/**
 * 格式化为友好的日期时间
 * @param {string|Date} date - 日期对象或ISO字符串
 * @returns {string} 如 "今天 14:30" 或 "昨天 14:30" 或 "2024-01-01"
 */
export function formatFriendlyDateTime(date) {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`
  
  if (dateOnly.getTime() === today.getTime()) {
    return `今天 ${time}`
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return `昨天 ${time}`
  } else {
    return formatDate(date)
  }
}
