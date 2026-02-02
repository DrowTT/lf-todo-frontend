<script setup lang="ts">
import TitleBar from './layout/TitleBar.vue'
</script>

<template>
  <div class="app-container">
    <TitleBar />
    <div class="app-content">
      <div class="welcome">
        <h1>极简待办</h1>
        <p>自定义标题栏已集成，数据库功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1e1e1e;
  color: #e0e0e0;
}

.app-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome {
  text-align: center;
}

.welcome h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
}

.welcome p {
  font-size: 16px;
  color: #9e9e9e;
}
</style>
