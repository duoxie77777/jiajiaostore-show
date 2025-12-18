// 地图APP选项
const MAP_OPTIONS = [
  { name: '高德地图', key: 'amap' },
  { name: '百度地图', key: 'bmap' },
  { name: '腾讯地图', key: 'qqmap' },
  { name: '苹果地图', key: 'apple', ios: true }
]

// 打开地图导航 - 让用户选择
export function openMapNavigation(address) {
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  
  // 过滤可用地图（苹果地图仅iOS）
  const availableMaps = MAP_OPTIONS.filter(m => !m.ios || isIOS)
  
  // 创建选择弹窗
  showMapSelector(availableMaps, (mapKey) => {
    openMapApp(mapKey, address)
  })
}

// 显示地图选择器
function showMapSelector(maps, callback) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9998;
  `
  
  const panel = document.createElement('div')
  panel.style.cssText = `
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 16px 16px 0 0;
    z-index: 9999;
    padding-bottom: env(safe-area-inset-bottom);
  `
  
  const title = document.createElement('div')
  title.style.cssText = `
    padding: 16px;
    text-align: center;
    font-size: 14px;
    color: #969799;
    border-bottom: 1px solid #ebedf0;
  `
  title.textContent = '选择导航地图'
  panel.appendChild(title)
  
  maps.forEach(map => {
    const item = document.createElement('div')
    item.style.cssText = `
      padding: 14px 0;
      text-align: center;
      font-size: 16px;
      color: #323233;
      border-bottom: 1px solid #ebedf0;
      cursor: pointer;
    `
    item.textContent = map.name
    item.onclick = () => {
      cleanup()
      callback(map.key)
    }
    panel.appendChild(item)
  })
  
  const cancel = document.createElement('div')
  cancel.style.cssText = `
    padding: 14px 0;
    text-align: center;
    font-size: 16px;
    color: #323233;
    background: #f7f8fa;
    margin-top: 8px;
    cursor: pointer;
  `
  cancel.textContent = '取消'
  cancel.onclick = cleanup
  panel.appendChild(cancel)
  
  function cleanup() {
    overlay.remove()
    panel.remove()
  }
  
  overlay.onclick = cleanup
  
  document.body.appendChild(overlay)
  document.body.appendChild(panel)
}

// 打开指定地图APP
function openMapApp(mapKey, address) {
  const encodedAddress = encodeURIComponent(address)
  
  const urls = {
    amap: `https://uri.amap.com/search?keyword=${encodedAddress}&callnative=1`,
    bmap: `baidumap://map/geocoder?address=${encodedAddress}&src=webapp.jiajiao`,
    qqmap: `qqmap://map/search?keyword=${encodedAddress}&referer=jiajiao`,
    apple: `http://maps.apple.com/?q=${encodedAddress}`
  }
  
  const url = urls[mapKey]
  if (!url) return
  
  // 高德和苹果直接跳转
  if (mapKey === 'amap' || mapKey === 'apple') {
    window.location.href = url
    return
  }
  
  // 百度和腾讯尝试打开APP，失败则跳网页
  const startTime = Date.now()
  window.location.href = url
  
  setTimeout(() => {
    if (Date.now() - startTime < 2500) {
      // APP没打开，跳转网页版
      const webUrls = {
        bmap: `https://api.map.baidu.com/geocoder?address=${encodedAddress}&output=html&src=webapp.jiajiao`,
        qqmap: `https://apis.map.qq.com/uri/v1/search?keyword=${encodedAddress}&referer=jiajiao`
      }
      window.location.href = webUrls[mapKey]
    }
  }, 2000)
}
