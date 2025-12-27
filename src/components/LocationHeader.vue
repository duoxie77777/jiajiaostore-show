<template>
  <div class="location-header">
    <div class="header-title">
      <h1>家教信息平台</h1>
      <p>优质家教，一键匹配</p>
    </div>
  </div>
</template>

<script setup>
// 简化版头部，无定位功能
</script>

<style scoped>
.location-header {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  padding: 20px 16px 32px;
  color: #fff;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.location-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.location-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.header-title {
  position: relative;
  z-index: 1;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: 1px;
}

.header-title p {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
}
</style>
