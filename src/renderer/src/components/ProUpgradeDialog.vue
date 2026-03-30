<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { FolderOpen, ListChecks, Keyboard, Palette } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const contentRef = ref<HTMLElement | null>(null)

const proPrice = '23'

function handleClose(): void {
  emit('close')
}

function handlePurchase(): void {
  // V2 仅为 UI 骨架，暂不对接真实支付
  window.dispatchEvent(new CustomEvent('pro:status-changed'))
  alert('功能开发中，敬请期待！')
}

// 弹窗出现时自动聚焦
watch(
  () => props.visible,
  (val) => {
    if (val) nextTick(() => contentRef.value?.focus())
  }
)
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="visible" class="pro-overlay" @click="handleClose" />
    </Transition>

    <!-- 弹窗 -->
    <Transition name="slide">
      <div
        v-if="visible"
        class="pro-wrapper"
        @click.self="handleClose"
        @keydown.escape="handleClose"
      >
        <div ref="contentRef" class="pro-content" tabindex="-1" @click.stop>
          <!-- 头部 -->
          <div class="pro-header">
            <span class="pro-badge">PRO</span>
            <h2 class="pro-title">升级 Pro 永久版</h2>
            <p class="pro-desc">一次买断，永久解锁全部高级功能</p>
          </div>

          <!-- 权益列表 -->
          <ul class="pro-features">
            <li><FolderOpen :size="16" class="feature-icon" />无限分类数量</li>
            <li><ListChecks :size="16" class="feature-icon" />子待办（子任务）功能</li>
            <li><Keyboard :size="16" class="feature-icon" />子任务快捷键设置</li>
            <li><Palette :size="16" class="feature-icon" />更多主题（即将推出）</li>
          </ul>

          <div class="plan-card plan-card--single">
            <span class="plan-best">当前定价</span>
            <span class="plan-period">永久买断</span>
            <span class="plan-price">¥{{ proPrice }}<small>/一次</small></span>
            <span class="plan-save">后续功能持续包含在内</span>
          </div>

          <!-- 操作按钮 -->
          <div class="pro-actions">
            <button class="pro-btn pro-btn--primary" @click="handlePurchase">
              23 元永久解锁
            </button>
            <button class="pro-btn pro-btn--secondary" @click="handleClose">
              以后再说
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.pro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9998;
}

.pro-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.pro-content {
  width: 400px;
  background: $bg-elevated;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.06);
  padding: $spacing-2xl;
  outline: none;
  position: relative;
  overflow: hidden;

  // 顶部品牌光晕装饰
  &::before {
    content: '';
    position: absolute;
    top: -60%;
    left: -20%;
    width: 140%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      rgba($pro-color-start, 0.06) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
}

// ─── 头部 ───
.pro-header {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.pro-badge {
  display: inline-block;
  padding: 2px $spacing-md;
  background: $pro-gradient;
  color: white;
  font-size: $font-xs;
  font-weight: 700;
  letter-spacing: 2px;
  border-radius: $radius-sm;
  margin-bottom: $spacing-sm;
}

.pro-title {
  font-size: $font-xl;
  font-weight: 700;
  color: $text-primary;
  margin: $spacing-sm 0 $spacing-xs;
}

.pro-desc {
  font-size: $font-sm;
  color: $text-secondary;
  margin: 0;
}

// ─── 权益列表 ───
.pro-features {
  list-style: none;
  padding: 0;
  margin: 0 0 $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  li {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-md;
    color: $text-primary;
    padding: $spacing-xs 0;
  }

  .feature-icon {
    color: $accent-color;
    flex-shrink: 0;
  }
}

// ─── 买断方案展示 ───
.plan-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-lg $spacing-md;
  border: 2px solid $border-color;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.5);
  transition: all $transition-normal;
  position: relative;
  margin-bottom: $spacing-xl;

  &--single {
    border-color: $accent-color;
    background: $accent-soft;
  }
}

.plan-best {
  position: absolute;
  top: 0;
  right: -4px;
  transform: translateY(-50%);
  padding: 1px $spacing-sm;
  background: $pro-gradient;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: $radius-sm;
}

.plan-period {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: 500;
}

.plan-price {
  font-size: $font-2xl;
  font-weight: 700;
  color: $text-primary;

  small {
    font-size: $font-sm;
    font-weight: 400;
    color: $text-muted;
  }
}

.plan-save {
  font-size: $font-xs;
  color: $success-color;
  font-weight: 500;
}

// ─── 操作按钮 ───
.pro-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.pro-btn {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: $radius-md;
  font-size: $font-lg;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-normal;

  &--primary {
    background: linear-gradient(135deg, $accent-color, #6366f1);
    color: white;

    &:hover {
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: transparent;
    color: $text-muted;
    border: 1px solid $border-color;

    &:hover {
      color: $text-secondary;
      border-color: $border-light;
      background: rgba(0, 0, 0, 0.02);
    }
  }
}

// ─── 动画 ───
.fade-enter-active {
  transition: background-color $transition-slow;
}

.fade-leave-active {
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.fade-enter-from {
  background-color: transparent;
}

.fade-leave-to {
  background-color: transparent;
  opacity: 0;
}

.slide-enter-active {
  transition: transform $transition-spring;
}

.slide-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.slide-enter-from {
  transform: translateY(12px) scale(0.97);
}

.slide-leave-to {
  transform: translateY(8px) scale(0.97);
  opacity: 0;
}
</style>
