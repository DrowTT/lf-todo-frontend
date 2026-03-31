<script setup lang="ts">
import { useAuthStore } from '../store/auth'
import { Sparkles } from 'lucide-vue-next'
import LevelBadge from './LevelBadge.vue'

const authStore = useAuthStore()

const emit = defineEmits<{
  upgrade: []
  logout: []
}>()
</script>

<template>
  <div class="user-profile">
    <!-- 用户基本信息 -->
    <div class="profile-main">
      <div class="profile-avatar">
        {{ authStore.nickname.charAt(0).toUpperCase() }}
      </div>
      <div class="profile-info">
        <div class="profile-name-row">
          <span class="profile-nickname">{{ authStore.nickname }}</span>
          <!-- Pro 标识 -->
          <span v-if="authStore.isPro" class="pro-tag">PRO</span>
          <LevelBadge
            v-if="authStore.user?.level"
            :level="authStore.user.level.currentLevel"
          />
        </div>
        <span class="profile-email">{{ authStore.email }}</span>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="profile-actions">
      <button
        v-if="!authStore.isPro"
        class="action-btn action-btn--upgrade"
        @click="emit('upgrade')"
      >
        <Sparkles :size="12" /> 23 元解锁 Pro
      </button>
      <button class="action-btn action-btn--logout" @click="emit('logout')">
        退出登录
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.user-profile {
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-xl;
  font-weight: 700;
  flex-shrink: 0;
  // 头像外围等级色环
  box-shadow: 0 0 0 2px $bg-sidebar, 0 0 0 4px var(--level-color, #{$accent-color});
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.profile-nickname {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pro-tag {
  display: inline-block;
  padding: 0 6px;
  background: $pro-gradient;
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 3px;
  line-height: 18px;
}

.profile-email {
  font-size: $font-sm;
  color: $text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ─── 操作按钮 ───
.profile-actions {
  display: flex;
  gap: $spacing-sm;
}

.action-btn {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: $radius-md;
  font-size: $font-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;

  &--upgrade {
    background: $pro-gradient;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;

    &:hover {
      box-shadow: 0 2px 8px rgb(var(--warning-color-rgb) / 0.3);
    }
  }

  &--logout {
    background: rgb(var(--text-primary-rgb) / 0.04);
    color: $text-secondary;
    border: 1px solid $border-color;

    &:hover {
      background: rgb(var(--text-primary-rgb) / 0.08);
      color: $danger-color;
      border-color: rgb(var(--danger-color-rgb) / 0.3);
    }
  }
}
</style>
