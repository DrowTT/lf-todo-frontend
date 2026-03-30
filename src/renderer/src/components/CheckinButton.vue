<script setup lang="ts">
/**
 * 签到按钮组件 — 每日签到、经验值进度展示
 * 包含签到动效、经验值弹出提示、进度条
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getLevelInfo, checkin, type LevelInfo, type XpGainResult } from '../api/level'
import LevelBadge from './LevelBadge.vue'
import { CalendarCheck, Check, Sparkles } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    narrow?: boolean
  }>(),
  {
    compact: false,
    narrow: false
  }
)

const emit = defineEmits<{
  /** 签到或等级信息更新时触发，父组件可根据此刷新 */
  'level-updated': [info: LevelInfo]
}>()

// ─── 状态 ───
const levelInfo = ref<LevelInfo | null>(null)
const isLoading = ref(false)
const isCheckinLoading = ref(false)
const showXpToast = ref(false)
const xpGained = ref(0)
const checkinSuccess = ref(false)

// ─── 计算属性 ───
const checkinDone = computed(() => levelInfo.value?.daily.checkinDone ?? false)
const progressPercent = computed(() => {
  if (!levelInfo.value || levelInfo.value.xpNeeded <= 0) return 0
  return Math.min(100, Math.round((levelInfo.value.xpProgress / levelInfo.value.xpNeeded) * 100))
})

// ─── 加载等级信息 ───
async function fetchLevel(): Promise<void> {
  isLoading.value = true
  try {
    const res = await getLevelInfo()
    levelInfo.value = res.data
    emit('level-updated', res.data)
  } catch (e) {
    console.error('[CheckinButton] 获取等级信息失败:', e)
  } finally {
    isLoading.value = false
  }
}

// ─── 签到 ───
async function handleCheckin(): Promise<void> {
  if (checkinDone.value || isCheckinLoading.value) return

  isCheckinLoading.value = true
  try {
    const res = await checkin()
    checkinSuccess.value = true

    // 显示经验值弹出提示
    showXpGain(res.data.xpGain)

    // 刷新等级信息
    await fetchLevel()
  } catch (e: any) {
    console.error('[CheckinButton] 签到失败:', e)
  } finally {
    isCheckinLoading.value = false
  }
}

function showXpGain(xpGain: number): void {
  if (xpGain <= 0) return

  xpGained.value = xpGain
  showXpToast.value = true
  setTimeout(() => {
    showXpToast.value = false
  }, 2000)
}

async function handleTaskComplete(event: Event): Promise<void> {
  const customEvent = event as CustomEvent<XpGainResult>
  const payload = customEvent.detail
  if (!payload) return

  showXpGain(payload.xpGain)
  await fetchLevel()
}

onMounted(() => {
  void fetchLevel()
  window.addEventListener('level:task-complete', handleTaskComplete as EventListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('level:task-complete', handleTaskComplete as EventListener)
})

// 暴露刷新方法，供父组件调用
defineExpose({ fetchLevel })
</script>

<template>
  <div
    class="checkin-section"
    :class="{
      'checkin-section--compact': props.compact,
      'checkin-section--narrow': props.narrow
    }"
  >
    <!-- 等级信息展示 -->
    <div v-if="levelInfo" class="level-info">
      <div class="level-info__header">
        <LevelBadge :level="levelInfo.currentLevel" :compact="props.compact" />
        <span class="level-info__xp">{{ levelInfo.totalXp }} XP</span>
      </div>

      <!-- 经验值进度条 -->
      <div class="level-info__progress">
        <div class="progress-bar">
          <div
            class="progress-bar__fill"
            :style="{ width: progressPercent + '%', backgroundColor: levelInfo.levelColor }"
          />
        </div>
        <span class="progress-bar__text">
          {{ levelInfo.xpProgress }} / {{ levelInfo.xpNeeded }}
        </span>
      </div>

      <!-- 今日数据 -->
      <div class="level-info__daily">
        <span class="daily-stat">
          今日 {{ levelInfo.daily.totalXpToday }} XP
        </span>
        <span class="daily-stat daily-stat--sub">
          任务 {{ levelInfo.daily.taskXpCount }}/3
        </span>
      </div>
    </div>

    <!-- 签到按钮 -->
    <button
      class="checkin-btn"
      :class="{
        'checkin-btn--done': checkinDone,
        'checkin-btn--loading': isCheckinLoading,
        'checkin-btn--success': checkinSuccess && checkinDone
      }"
      :disabled="checkinDone || isCheckinLoading"
      @click="handleCheckin"
    >
      <template v-if="isCheckinLoading">
        <span class="checkin-btn__spinner" />
        签到中...
      </template>
      <template v-else-if="checkinDone">
        <Check :size="14" :stroke-width="2.5" />
        已签到
      </template>
      <template v-else>
        <CalendarCheck :size="14" />
        每日签到 +5 XP
      </template>
    </button>

    <!-- 经验值获得提示 -->
    <Transition name="xp-toast">
      <div v-if="showXpToast" class="xp-toast">
        <Sparkles :size="12" />
        +{{ xpGained }} XP
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.checkin-section {
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-subtle;
  position: relative;
  min-width: 0;
}

// ─── 等级信息 ───
.level-info {
  margin-bottom: $spacing-sm;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-xs;
    gap: $spacing-xs;
    min-width: 0;
  }

  &__xp {
    font-size: $font-xs;
    color: $text-muted;
    font-weight: 500;
    white-space: nowrap;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
    min-width: 0;
  }

  &__daily {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-md;
  }
}

// ─── 进度条 ───
.progress-bar {
  flex: 1;
  min-width: 0;
  height: 6px;
  background: var(--progress-bg);
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 2px;
    // 发光效果增强视觉存在感
    box-shadow: 0 0 6px currentColor;
    opacity: 0.9;
  }

  &__text {
    font-size: 10px;
    color: $text-muted;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

// ─── 每日数据 ───
.daily-stat {
  font-size: $font-xs;
  color: $text-secondary;
  font-weight: 500;

  &--sub {
    color: $text-muted;
  }
}

// ─── 签到按钮 ───
.checkin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  width: 100%;
  min-width: 0;
  height: 32px;
  border: 1px dashed $accent-color;
  border-radius: $radius-md;
  background: transparent;
  color: $accent-color;
  font-size: $font-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: $accent-soft;
    border-style: solid;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  // 已签到状态
  &--done {
    border-color: $success-color;
    color: $success-color;
    border-style: solid;
    cursor: default;
    opacity: 0.7;
  }

  // 签到成功动效 —— 波纹扩散
  &--success {
    animation: checkin-pulse 0.5s ease;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgba($success-color, 0.12);
      animation: checkin-ripple 0.8s ease-out forwards;
    }
  }

  // 加载中
  &--loading {
    cursor: wait;
    opacity: 0.7;
  }


  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba($accent-color, 0.2);
    border-top-color: $accent-color;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

.checkin-section--compact {
  padding-inline: $spacing-md;

  .level-info__progress {
    gap: $spacing-xs;
  }

  .level-info__daily {
    gap: $spacing-xs $spacing-sm;
  }

  .daily-stat {
    font-size: 11px;
  }

  .checkin-btn {
    font-size: $font-xs;
  }
}

.checkin-section--narrow {
  padding-inline: $spacing-sm;

  .level-info__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .level-info__xp {
    font-size: 11px;
  }

  .level-info__progress {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-bar__text {
    font-size: 9px;
  }

  .daily-stat {
    font-size: 10px;
  }

  .checkin-btn {
    height: 30px;
    padding-inline: $spacing-xs;
    font-size: 11px;
  }

  .xp-toast {
    right: $spacing-sm;
    padding-inline: $spacing-sm;
    font-size: $font-xs;
  }
}

// ─── 经验值弹出提示 ───
.xp-toast {
  position: absolute;
  top: -8px;
  right: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-md;
  background: $pro-gradient;
  color: white;
  font-size: $font-sm;
  font-weight: 700;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  pointer-events: none;
  z-index: 10;
}

// ─── 动画 ───
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes checkin-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

@keyframes checkin-ripple {
  from { transform: scale(0.8); opacity: 1; }
  to { transform: scale(1.5); opacity: 0; }
}

// 经验值提示进出动画
.xp-toast-enter-active {
  animation: xp-float-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-toast-leave-active {
  animation: xp-float-out 0.3s ease forwards;
}

@keyframes xp-float-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes xp-float-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-12px) scale(0.9);
  }
}
</style>
