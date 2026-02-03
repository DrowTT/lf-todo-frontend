<script setup lang="ts">
import TitleBar from './layout/TitleBar.vue'
import CategoryList from './components/CategoryList.vue'
import TodoList from './components/TodoList.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useConfirm } from './composables/useConfirm'

const { state, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <div class="app-container font-sans">
    <TitleBar />
    <div class="app-content flex flex-1 overflow-hidden">
      <CategoryList />
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
</style>
