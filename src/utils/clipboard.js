import { showToast } from 'vant'

// 复制文本到剪贴板
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      showToast({
        message: '复制成功',
        type: 'success',
        duration: 1500
      })
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        showToast({
          message: '复制成功',
          type: 'success',
          duration: 1500
        })
        return true
      }
      throw new Error('复制失败')
    }
  } catch (err) {
    showToast({
      message: '复制失败，请手动复制',
      type: 'fail',
      duration: 1500
    })
    return false
  }
}

// 格式化订单信息用于复制
export function formatOrderForCopy(order) {
  const lines = [
    `【${order.title}】`,
    `订单编号：${order.id}`,
    `发布日期：${order.date}`,
    ``,
    `📍 地址：${order.address}`,
    `🏫 学校：${order.school}`,
    `📚 年级：${order.grade}`,
    `📖 辅导科目：${order.subjects.join('、')}`,
    `📊 平时成绩：${order.score}`,
    `⏰ 上课频率：${order.frequency}`,
    `📅 可选时间：${order.availableTimes.join('、')}`,
    `💰 到手价：${order.price}`,
    `👨‍🏫 教师类型：${order.teacherType}`,
  ]
  
  if (order.note) {
    lines.push(``, `📝 备注：${order.note}`)
  }
  
  return lines.join('\n')
}
