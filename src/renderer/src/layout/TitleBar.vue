<template>
  <div class="title-bar">
    <div class="title-bar__drag-area">
      <div class="title-bar__title">极简待办</div>
    </div>
    <div class="title-bar__controls">
      <button
        class="title-bar__btn title-bar__btn--pin"
        :class="{ 'is-active': isAlwaysOnTop }"
        @click="handleTogglePin"
        title="置顶"
      >
        📌
      </button>
      <button
        class="title-bar__btn title-bar__btn--minimize"
        @click="handleMinimize"
        title="最小化"
      >
        ➖
      </button>
      <button class="title-bar__btn title-bar__btn--close" @click="handleClose" title="关闭">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isAlwaysOnTop = ref(false)

// 检查是否在 Electron 环境中（window.api 由 preload 脚本注入）
const isElectron = typeof window !== 'undefined' && window.api !== undefined

const handleTogglePin = () => {
  if (isElectron) {
    window.api.window.toggleAlwaysOnTop()
  }
}

const handleMinimize = () => {
  if (isElectron) {
    window.api.window.minimize()
  }
}

const handleClose = () => {
  if (isElectron) {
    window.api.window.close()
  }
}

onMounted(() => {
  if (isElectron) {
    window.api.window.onAlwaysOnTopChanged((flag: boolean) => {
      isAlwaysOnTop.value = flag
    })
  }
})
</script>

<style scoped lang="scss">
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: #2b2b2b;
  color: #e0e0e0;
  user-select: none;
  border-bottom: 1px solid #1a1a1a;

  &__drag-area {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
    padding-left: 12px;
    -webkit-app-region: drag; // 允许拖拽窗口
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: #9e9e9e;
  }

  &__controls {
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag; // 防止按钮区域被拖拽
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 100%;
    background: transparent;
    border: none;
    color: #e0e0e0;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &--pin {
      &.is-active {
        background: rgba(76, 175, 80, 0.3);
        color: #4caf50;
      }

      &:hover {
        background: rgba(76, 175, 80, 0.2);
      }
    }

    &--minimize {
      font-size: 16px;
    }

    &--close {
      font-size: 16px;

      &:hover {
        background: #e81123;
        color: white;
      }
    }
  }
}
</style>
