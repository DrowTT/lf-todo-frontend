<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { store } from '../store'
import { useConfirm } from '../composables/useConfirm'
import { useContextMenu } from '../composables/useContextMenu'
import { useAuthStore } from '../store/auth'
import { ensureFeatureAccess } from '../composables/useFeatureGate'
import { MAX_FREE_CATEGORIES } from '../constants/proFeatures'
import CheckinButton from './CheckinButton.vue'
import { Plus, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()

const rootRef = ref<HTMLElement | null>(null)
const isCompact = ref(false)
const isNarrow = ref(false)
let resizeObserver: ResizeObserver | null = null

const emit = defineEmits<{
  'open-settings': []
  'show-pro-upgrade': []
}>()

const { confirm } = useConfirm()
const {
  menu: contextMenu,
  open: openContextMenu,
  close: closeContextMenu
} = useContextMenu<number>()

function updateLayoutMode(width: number): void {
  isCompact.value = width <= 156
  isNarrow.value = width <= 128
}

onMounted(() => {
  void store.fetchCategories()

  if (!rootRef.value) return

  updateLayoutMode(rootRef.value.clientWidth)
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    updateLayoutMode(entry.contentRect.width)
  })
  resizeObserver.observe(rootRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const newCategoryName = ref('')
const isAdding = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 重命名状态
const editingCategoryId = ref<number | null>(null)
const editingName = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) {
    isAdding.value = false
    return
  }
  await store.addCategory(newCategoryName.value.trim())
  newCategoryName.value = ''
  isAdding.value = false
}

const startAdding = async () => {
  if (!ensureFeatureAccess('extraCategories', { categoryCount: store.categories.length }, { prompt: true })) {
    return
  }
  isAdding.value = true
  await nextTick()
  inputRef.value?.focus()
}

const handleDeleteCategory = async () => {
  if (contextMenu.value.data === null) return
  const confirmed = await confirm('确认删除该分类及其所有待办吗?')
  if (confirmed) {
    await store.deleteCategory(contextMenu.value.data)
  }
  closeContextMenu()
}

const handleRenameClick = async () => {
  if (contextMenu.value.data === null) return
  const category = store.categories.find((c) => c.id === contextMenu.value.data)
  if (category) {
    editingCategoryId.value = category.id
    editingName.value = category.name
    closeContextMenu()
    await nextTick()
    editInputRef.value?.focus()
  }
}

const handleRenameConfirm = async () => {
  if (editingCategoryId.value !== null && editingName.value.trim()) {
    await store.updateCategory(editingCategoryId.value, editingName.value.trim())
  }
  cancelRename()
}

const cancelRename = () => {
  editingCategoryId.value = null
  editingName.value = ''
}
</script>

<template>
  <div
    ref="rootRef"
    class="category-list"
    :class="{
      'category-list--compact': isCompact,
      'category-list--narrow': isNarrow
    }"
  >
    <!-- 等级信息 + 签到 -->
    <CheckinButton :compact="isCompact" :narrow="isNarrow" />

    <div class="category-list__content">
      <div class="category-list__header">
        <span class="category-list__header-label">分类</span>
      </div>

      <ul>
        <li
          v-for="cat in store.categories"
          :key="cat.id"
          class="category-item"
          :class="{
            'category-item--active': store.currentCategoryId === cat.id,
            'category-item--editing': editingCategoryId === cat.id
          }"
          @click="editingCategoryId !== cat.id && store.selectCategory(cat.id)"
          @contextmenu="openContextMenu($event, cat.id)"
        >
          <input
            v-if="editingCategoryId === cat.id"
            ref="editInputRef"
            v-model="editingName"
            class="category-item__edit-input"
            maxlength="6"
            @keyup.enter="handleRenameConfirm"
            @keyup.escape="cancelRename"
            @blur="handleRenameConfirm"
            @click.stop
          />
          <template v-else>
            <span class="category-item__name">{{ cat.name }}</span>
            <span v-if="store.pendingCounts[cat.id]" class="category-item__badge">
              {{ store.pendingCounts[cat.id] }}
            </span>
          </template>
        </li>
      </ul>

      <div v-if="isAdding" class="category-list__input-wrapper">
        <input
          ref="inputRef"
          v-model="newCategoryName"
          class="category-list__input"
          placeholder="输入名称..."
          maxlength="6"
          autofocus
          @keyup.enter="handleAddCategory"
          @blur="handleAddCategory"
        />
      </div>
    </div>

    <div class="category-list__footer">
      <button v-if="!isAdding" class="category-list__add-btn" @click="startAdding">
          <Plus class="category-list__add-icon" :size="12" />
          <span class="category-list__btn-label">新建分类</span>
        <span
          v-if="!authStore.isPro && store.categories.length >= MAX_FREE_CATEGORIES"
          class="category-list__pro-hint"
        >PRO</span>
      </button>
      <div class="category-list__footer-divider"></div>
        <button class="category-list__settings-btn" @click="emit('open-settings')">
          <Settings :size="14" />
          <span class="category-list__btn-label">设置</span>
        </button>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <button class="context-menu__item" @click="handleRenameClick">重命名</button>
      <div class="context-menu__divider"></div>
      <button class="context-menu__item context-menu__item--danger" @click="handleDeleteCategory">
        删除分类
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.category-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: $bg-sidebar;
  border-right: 1px solid $border-subtle;

  &__header {
    padding: $spacing-md $spacing-lg $spacing-sm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1;
    background: linear-gradient(180deg, rgb(var(--bg-sidebar-rgb) / 0.98) 0%, rgb(var(--bg-sidebar-rgb) / 0.92) 100%);
    backdrop-filter: blur(10px);
  }

  &__header-label {
    font-size: $font-xs;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 $spacing-sm;
  }

  &__footer {
    padding: $spacing-sm $spacing-md;
    border-top: 1px solid $border-subtle;
    min-width: 0;
  }

  &__footer-divider {
    height: 1px;
    background: $border-subtle;
    margin: $spacing-xs 0;
  }

  &__settings-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
    min-width: 0;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    font-size: $font-sm;
    color: $text-muted;
    cursor: pointer;
    transition: all $transition-normal;

    &:hover {
      color: $accent-color;
      background: $accent-soft;
    }
  }

  &__add-btn {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px dashed $border-light;
    border-radius: $radius-md;
    font-size: $font-sm;
    color: $text-muted;
    cursor: pointer;
    transition: all $transition-normal;

    &:hover {
      color: $accent-color;
      border-color: $accent-color;
      background: $accent-soft;
    }
  }

  &__add-icon {
    width: 12px;
    height: 12px;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__btn-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pro-hint {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0 6px;
    background: $pro-gradient;
    color: white;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    border-radius: 3px;
    line-height: 16px;
  }

  &__input-wrapper {
    padding: $spacing-xs $spacing-md;
  }

  &__input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background: $bg-input;
    color: $text-primary;
    font-size: $font-sm;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-light;
    border-radius: $radius-md;
    outline: none;
    transition: all $transition-fast;

    &:focus {
      border-color: $accent-color;
      box-shadow: 0 0 0 3px $accent-soft;
    }

    &::placeholder {
      color: $text-muted;
    }
  }

  &--compact {
    .category-list__header {
      padding: $spacing-sm $spacing-md $spacing-xs;
    }

    .category-list__footer {
      padding-inline: $spacing-sm;
    }

    .category-list__add-btn,
    .category-list__settings-btn {
      justify-content: center;
      padding-inline: $spacing-sm;
      gap: $spacing-xs;
    }

    .category-list__pro-hint {
      margin-left: $spacing-xs;
    }

    .category-list__add-icon {
      margin-right: 0;
    }
  }

  &--narrow {
    .category-list__header {
      padding: $spacing-sm $spacing-sm $spacing-xs;
    }

    .category-list__header-label,
    .category-list__btn-label {
      display: none;
    }

    .category-list__add-btn,
    .category-list__settings-btn {
      height: 36px;
      padding-inline: $spacing-xs;
    }

    .category-list__pro-hint {
      margin-left: $spacing-xs;
      padding: 0 4px;
      font-size: 8px;
      letter-spacing: 0.5px;
    }

    .category-list__input-wrapper {
      padding-inline: $spacing-sm;
    }
  }
}

.category-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  margin: 0 $spacing-sm;

  & + & {
    margin-top: 2px;
  }
  min-width: 0;
  font-size: $font-sm;
  color: $text-secondary;
  cursor: pointer;
  border-radius: $radius-md;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  position: relative;

  &:hover {
    background: $accent-soft;
    color: $text-primary;
  }

  &--active {
    background: $accent-soft;
    color: $text-primary;

    // 左侧 accent 指示条
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      background: $accent-color;
      border-radius: 0 2px 2px 0;
    }
  }

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex-shrink: 0;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    margin-left: $spacing-sm;
    font-size: $font-xs;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    color: $accent-color;
    background: $accent-soft;
    border-radius: 10px;
  }

  &--editing {
    padding: $spacing-xs $spacing-md;
    margin: 0;
  }

  // inline 重命名输入框 — 与新建分类输入框样式一致
  &__edit-input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background: $bg-input;
    color: $text-primary;
    font-size: $font-sm;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-light;
    border-radius: $radius-md;
    outline: none;
    font-family: inherit;
    transition: all $transition-fast;

    &:focus {
      border-color: $accent-color;
      box-shadow: 0 0 0 3px $accent-soft;
    }
  }
}

.category-list--compact {
  .category-item {
    padding-inline: $spacing-md;
    margin-inline: $spacing-xs;
  }

  .category-item__badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    margin-left: $spacing-xs;
    line-height: 18px;
  }
}

.category-list--narrow {
  .category-item {
    padding-inline: $spacing-sm;
    gap: 6px;
  }

  .category-list__content,
  .category-list__footer {
    min-width: 0;
  }

  .category-item__name {
    font-size: $font-xs;
  }

  .category-item__badge {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    margin-left: 4px;
    font-size: 10px;
    line-height: 16px;
  }

  .category-item--editing {
    padding-inline: $spacing-xs;
  }

  .category-item__edit-input {
    padding-inline: $spacing-sm;
  }
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  padding: $spacing-xs;
  min-width: 140px;

  &__item {
    display: block;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    border-radius: $radius-sm;
    text-align: left;
    font-size: $font-sm;
    color: $text-primary;
    cursor: pointer;
    transition: background-color $transition-fast;

    &:hover {
        background: rgb(var(--text-primary-rgb) / 0.04);
    }

    &--danger {
      color: $danger-color;

      &:hover {
        background: rgb(var(--danger-color-rgb) / 0.1);
      }
    }
  }

  &__divider {
    height: 1px;
    background: $border-subtle;
    margin: $spacing-xs 0;
  }
}
</style>
