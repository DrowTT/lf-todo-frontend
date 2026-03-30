<script setup lang="ts">
/**
 * DeviceKickedDialog — 设备被踢出提示弹窗
 * 当前设备被新设备挤出时显示
 */
import { useAuthStore } from '../store/auth'
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const authStore = useAuthStore()

async function handleConfirm(): Promise<void> {
  await authStore.forceLogout()
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="kicked-fade">
      <div v-if="visible" class="kicked-overlay" />
    </Transition>

    <!-- 弹窗 -->
    <Transition name="kicked-pop">
      <div v-if="visible" class="kicked-wrapper">
        <div class="kicked-dialog">
          <div class="kicked-icon">
            <AlertTriangle :size="32" />
          </div>
          <h3 class="kicked-title">账号已在其他设备登录</h3>
          <p class="kicked-desc">
            你的账号已在另一台设备上登录，当前设备已被自动下线。 如非本人操作，请及时修改密码。
          </p>
          <button class="kicked-btn" @click="handleConfirm">返回登录</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.kicked-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9998;
}

.kicked-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.kicked-dialog {
  width: 360px;
  padding: $spacing-2xl;
  background: $bg-elevated;
  border-radius: $radius-lg;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.kicked-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($warning-color, 0.1);
  color: $warning-color;
  border-radius: 50%;
}

.kicked-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm;
}

.kicked-desc {
  font-size: $font-md;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0 0 $spacing-xl;
}

.kicked-btn {
  width: 100%;
  height: 40px;
  background: $accent-color;
  color: white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-md;
  font-weight: 500;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $accent-hover;
  }
}

// ─── 进出场动画 ───
.kicked-fade-enter-active {
  transition: opacity 0.3s ease;
}
.kicked-fade-leave-active {
  transition: opacity 0.2s ease;
}
.kicked-fade-enter-from,
.kicked-fade-leave-to {
  opacity: 0;
}

.kicked-pop-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.kicked-pop-leave-active {
  transition: all 0.2s ease;
}
.kicked-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}
.kicked-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
