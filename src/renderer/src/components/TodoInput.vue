<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../store'

const content = ref('')

const handleSubmit = async () => {
  if (!content.value.trim()) return
  if (!store.currentCategoryId) {
    alert('请先选择一个分类')
    return
  }
  await store.addTask(content.value.trim())
  content.value = ''
}
</script>

<template>
  <div class="todo-input">
    <div class="todo-input__label">待办</div>
    <input
      v-model="content"
      type="text"
      class="todo-input__field"
      placeholder="输入待办内容..."
      @keyup.enter="handleSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.todo-input {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: $bg-tertiary;
  border-bottom: 1px solid $border-color;

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
    white-space: nowrap;
  }

  &__field {
    flex: 1;
    background: $bg-input;
    color: $text-primary;
    font-size: $font-sm;
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $border-color;
    border-radius: $radius-sm;
    outline: none;
    transition: border-color $transition-fast;

    &:focus {
      border-color: $accent-color;
    }

    &::placeholder {
      color: $text-muted;
    }
  }
}
</style>
