<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TitleBar from './layout/TitleBar.vue'
import CategoryList from './components/CategoryList.vue'
import TodoList from './components/TodoList.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useConfirm } from './composables/useConfirm'

const { state, handleConfirm, handleCancel } = useConfirm()

// Sidebar resizing logic
const MIN_SIDEBAR_WIDTH = 100 // 左侧最小宽度
const MIN_TODO_WIDTH = 300 // 右侧最小宽度
const DEFAULT_WIDTH = 180

const sidebarWidth = ref(DEFAULT_WIDTH)
const isResizing = ref(false)

// 计算左侧允许的最大宽度（动态计算，确保右侧至少有 MIN_TODO_WIDTH）
const getMaxSidebarWidth = () => {
  return window.innerWidth - MIN_TODO_WIDTH
}

// 应用约束条件，确保 sidebar 宽度在合理范围内
const applyConstraints = (width: number): number => {
  const maxWidth = getMaxSidebarWidth()

  // 统一的约束逻辑：确保左侧在 [MIN_SIDEBAR_WIDTH, maxWidth] 范围内
  if (width < MIN_SIDEBAR_WIDTH) return MIN_SIDEBAR_WIDTH
  if (width > maxWidth) return maxWidth

  return width
}

// 窗口大小改变时，调整 sidebar 宽度
const handleWindowResize = () => {
  sidebarWidth.value = applyConstraints(sidebarWidth.value)
}

onMounted(() => {
  const savedWidth = localStorage.getItem('sidebar-width')
  if (savedWidth) {
    const width = parseInt(savedWidth)
    if (!isNaN(width)) {
      sidebarWidth.value = applyConstraints(width)
    }
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  // 清理窗口 resize 监听器
  window.removeEventListener('resize', handleWindowResize)
})

const startResize = () => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none' // 防止拖动时选中文字
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  // 直接应用统一的约束逻辑
  sidebarWidth.value = applyConstraints(e.clientX)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  // Save preference
  localStorage.setItem('sidebar-width', sidebarWidth.value.toString())
}
</script>

<template>
  <div class="app-container font-sans">
    <TitleBar />
    <div class="app-content flex flex-1 overflow-hidden relative">
      <div :style="{ width: sidebarWidth + 'px' }" class="sidebar-wrapper">
        <CategoryList />
      </div>
      <div class="resizer" :style="{ left: sidebarWidth + 'px' }" @mousedown="startResize"></div>
      <TodoList />
    </div>
    <ConfirmDialog
      :visible="state.visible"
      :message="state.message"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped lang="scss">
@use './styles/variables' as *;

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-primary;
  color: $text-primary;
}

.sidebar-wrapper {
  height: 100%;
  flex-shrink: 0;
  // CategoryList inside will fill this width
}

/* 拖拽条样式 */
.resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px; /* 加宽感应区域 */
  cursor: col-resize;
  background: transparent;
  z-index: 99;
  transform: translateX(-50%); /* 居中于边界线 */
}
</style>
