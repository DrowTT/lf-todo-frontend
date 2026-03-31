<script setup lang="ts">
/**
 * 签到 + 等级摘要组件 — 紧凑侧栏视图
 * 鼠标悬停展开详情浮层，点击签到
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getLevelInfo, checkin, type LevelInfo, type XpGainResult } from '../api/level'
import { getLevelTier } from '../constants/levels'
import LevelBadge from './LevelBadge.vue'
import { CalendarCheck, Check, Sparkles, ChevronRight, TrendingUp } from 'lucide-vue-next'

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
const showDetail = ref(false)

// ─── 计算属性 ───
const checkinDone = computed(() => levelInfo.value?.daily.checkinDone ?? false)
const progressPercent = computed(() => {
  if (!levelInfo.value || levelInfo.value.xpNeeded <= 0) return 0
  return Math.min(100, Math.round((levelInfo.value.xpProgress / levelInfo.value.xpNeeded) * 100))
})
const currentTier = computed(() => levelInfo.value?.levelMeta)
const currentTierType = computed(() => {
  if (!levelInfo.value) return 'common'
  // Lv.10 独立为 mythic，与 Lv.9 legendary 视觉分离
  if (levelInfo.value.currentLevel === 10) return 'mythic'
  return getLevelTier(levelInfo.value.currentLevel).tier
})
const nextTier = computed(() => {
  if (!levelInfo.value || levelInfo.value.isMaxLevel) return null
  const nextLevel = levelInfo.value.currentLevel + 1
  return nextLevel <= 10 ? getLevelTier(nextLevel) : null
})
const xpToNext = computed(() => {
  if (!levelInfo.value) return 0
  return Math.max(levelInfo.value.xpNeeded - levelInfo.value.xpProgress, 0)
})

// 等级色 CSS 变量
const levelVars = computed(() => ({
  '--level-color': currentTier.value?.color ?? '#8EA4C8',
  '--level-glow': currentTier.value?.glowColor ?? 'rgba(142, 164, 200, 0.34)',
  '--level-gradient-from': currentTier.value?.gradientFrom ?? '#E6EEF9',
  '--level-gradient-to': currentTier.value?.gradientTo ?? '#B7C8E6'
}))

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
    showXpGain(res.data.xpGain)
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
  setTimeout(() => { showXpToast.value = false }, 2000)
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

defineExpose({ fetchLevel })
</script>

<template>
  <div
    class="level-strip"
    :class="[
      `level-strip--${currentTierType}`,
      {
        'level-strip--compact': props.compact,
        'level-strip--narrow': props.narrow
      }
    ]"
    :style="levelVars"
    @mouseenter="showDetail = true"
    @mouseleave="showDetail = false"
  >
    <!-- 等级色指示条 -->
    <div class="level-strip__accent" />

    <template v-if="levelInfo">
      <!-- 第一行：等级 + XP -->
      <div class="level-strip__row level-strip__row--primary">
        <LevelBadge :level="levelInfo.currentLevel" compact />
        <span class="level-strip__name">{{ currentTier?.name }}</span>
        <span class="level-strip__xp">{{ levelInfo.totalXp }} XP</span>
      </div>

      <!-- 微型进度条 -->
      <div class="level-strip__progress">
        <div class="level-strip__progress-rail" />
        <div
          class="level-strip__progress-fill"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <!-- 第二行：签到状态 + 今日XP -->
      <div class="level-strip__row level-strip__row--secondary">
        <!-- 签到 -->
        <button
          v-if="!checkinDone"
          class="level-strip__checkin"
          :class="{ 'level-strip__checkin--loading': isCheckinLoading }"
          :disabled="isCheckinLoading"
          @click.stop="handleCheckin"
        >
          <template v-if="isCheckinLoading">
            <span class="level-strip__spinner" />
            签到中
          </template>
          <template v-else>
            <CalendarCheck :size="12" />
            签到 +5
          </template>
        </button>
        <span v-else class="level-strip__checked">
          <Check :size="11" :stroke-width="2.8" />
          已签到
        </span>

        <span class="level-strip__daily">
          <TrendingUp :size="11" />
          今日 {{ levelInfo.daily.totalXpToday }}
        </span>
      </div>
    </template>

    <!-- 骨架屏 -->
    <template v-else>
      <div class="level-strip__skeleton">
        <div class="level-strip__skeleton-line" style="width: 60%" />
        <div class="level-strip__skeleton-bar" />
        <div class="level-strip__skeleton-line" style="width: 45%" />
      </div>
    </template>

    <!-- 经验值获得提示 -->
    <Transition name="xp-toast">
      <div v-if="showXpToast" class="xp-toast">
        <Sparkles :size="11" />
        +{{ xpGained }} XP
      </div>
    </Transition>

    <!-- hover 详情浮层 -->
    <Transition name="detail-panel">
      <div v-if="showDetail && levelInfo" class="level-detail" @mouseenter="showDetail = true">
        <div class="level-detail__header">
          <LevelBadge :level="levelInfo.currentLevel" />
          <span class="level-detail__total">{{ levelInfo.totalXp }} XP</span>
        </div>

        <p class="level-detail__desc">{{ currentTier?.description }}</p>

        <!-- 进度信息 -->
        <div class="level-detail__progress-section">
          <div class="level-detail__progress-header">
            <span>{{ levelInfo.isMaxLevel ? '已达满级' : '升级进度' }}</span>
            <span v-if="!levelInfo.isMaxLevel">{{ levelInfo.xpProgress }} / {{ levelInfo.xpNeeded }}</span>
            <span v-else class="level-detail__max-tag">MAX</span>
          </div>
          <div class="level-detail__progress">
            <div class="level-detail__progress-rail" />
            <div
              class="level-detail__progress-fill"
              :style="{ width: (levelInfo.isMaxLevel ? 100 : progressPercent) + '%' }"
            />
          </div>
          <div v-if="!levelInfo.isMaxLevel && nextTier" class="level-detail__next">
            <ChevronRight :size="11" />
            下一境 · <strong>{{ nextTier.name }}</strong> — 还差 {{ xpToNext }} XP
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="level-detail__stats">
          <div class="level-detail__stat">
            <span class="level-detail__stat-value">{{ levelInfo.daily.totalXpToday }}</span>
            <span class="level-detail__stat-label">今日 XP</span>
          </div>
          <div class="level-detail__stat-divider" />
          <div class="level-detail__stat">
            <span class="level-detail__stat-value">
              {{ levelInfo.daily.taskXpCount }}/{{ levelInfo.daily.taskXpLimit }}
            </span>
            <span class="level-detail__stat-label">任务经验</span>
          </div>
          <div class="level-detail__stat-divider" />
          <div class="level-detail__stat">
            <span class="level-detail__stat-value">{{ checkinDone ? '✓' : '—' }}</span>
            <span class="level-detail__stat-label">签到</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

// ─── 等级摘要条 ───
.level-strip {
  position: relative;
  padding: $spacing-sm $spacing-md $spacing-sm ($spacing-md + 6px);
  border-bottom: 1px solid $border-subtle;
  cursor: default;
  min-width: 0;
  transition: background $transition-fast;

  &:hover {
    background: rgb(var(--text-primary-rgb) / 0.02);
  }

  // 左侧等级色指示条
  &__accent {
    position: absolute;
    left: 0;
    top: $spacing-sm;
    bottom: $spacing-sm;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--level-color);
    opacity: 0.7;
    transition: opacity $transition-fast;
  }

  &:hover &__accent {
    opacity: 1;
  }

  // ─── epic 等级指示条：带微光晕 ───
  &--epic &__accent {
    width: 3px;
    opacity: 0.85;
    box-shadow: 0 0 6px 1px var(--level-glow);
  }

  // ─── legendary 等级指示条（Lv.9）：金色呼吸发光 ───
  &--legendary &__accent {
    width: 3px;
    opacity: 1;
    background: linear-gradient(180deg, #d4a843, #f0d48a, #d4a843);
    box-shadow: 0 0 8px 2px rgba(184, 134, 11, 0.4);
    animation: legendary-accent-pulse 2.5s ease-in-out infinite;
  }

  // ─── mythic 等级指示条（Lv.10）：暗金色 + 更强发光 ───
  &--mythic &__accent {
    width: 3px;
    opacity: 1;
    background: linear-gradient(180deg, #2d2318, #d4a843, #2d2318);
    box-shadow: 0 0 10px 3px rgba(212, 168, 67, 0.5);
    animation: legendary-accent-pulse 2s ease-in-out infinite;
  }

  // legendary 等级进度条金色
  &--legendary &__progress-fill {
    background: linear-gradient(90deg, #c08b42, #f0d48a, #d4a843);
    opacity: 1;
    box-shadow: 0 0 8px -2px rgba(184, 134, 11, 0.5);
  }

  // mythic 等级进度条——暗金渐变
  &--mythic &__progress-fill {
    background: linear-gradient(90deg, #3d2f1e, #d4a843, #f0d48a, #d4a843, #3d2f1e);
    background-size: 200% 100%;
    animation: legendary-shift 3s ease infinite;
    opacity: 1;
    box-shadow: 0 0 10px -2px rgba(212, 168, 67, 0.6);
  }

  // epic 等级进度条带光晕
  &--epic &__progress-fill {
    opacity: 0.85;
    box-shadow: 0 0 6px -1px var(--level-glow);
  }

  // ─── 行布局 ───
  &__row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    min-width: 0;

    &--primary {
      margin-bottom: 4px;
    }

    &--secondary {
      margin-top: 4px;
    }
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: $font-xs;
    font-weight: 600;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__xp {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 700;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
  }

  // ─── 微型进度条 ───
  &__progress {
    position: relative;
    height: 3px;
    border-radius: 2px;
  }

  &__progress-rail {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgb(var(--text-primary-rgb) / 0.06);
  }

  &__progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    min-width: 2px;
    background: var(--level-color);
    opacity: 0.65;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // ─── 签到行内按钮 ───
  &__checkin {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0;
    border: none;
    background: transparent;
    color: $accent-color;
    font-size: 10px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover:not(:disabled) {
      color: $accent-hover;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    &--loading {
      cursor: wait;
      opacity: 0.6;
    }
  }

  &__checked {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 500;
    color: $success-color;
    opacity: 0.7;
  }

  &__daily {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__spinner {
    width: 10px;
    height: 10px;
    border: 1.5px solid rgb(var(--accent-color-rgb) / 0.2);
    border-top-color: $accent-color;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  // ─── 骨架屏 ───
  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 0;
  }

  &__skeleton-line {
    height: 10px;
    border-radius: 5px;
    background: rgb(var(--text-primary-rgb) / 0.06);
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  &__skeleton-bar {
    height: 3px;
    border-radius: 2px;
    background: rgb(var(--text-primary-rgb) / 0.06);
    animation: skeleton-pulse 1.5s ease-in-out 0.2s infinite;
  }
}

// ─── 响应式：compact 模式 ───
.level-strip--compact {
  padding-left: $spacing-sm + 6px;
  padding-right: $spacing-sm;

  .level-strip__name {
    display: none;
  }
}

// ─── 响应式：narrow 模式 ───
.level-strip--narrow {
  padding: $spacing-xs $spacing-sm $spacing-xs ($spacing-sm + 6px);

  .level-strip__name {
    display: none;
  }

  .level-strip__xp {
    font-size: 9px;
  }

  .level-strip__checkin,
  .level-strip__checked,
  .level-strip__daily {
    font-size: 9px;
  }
}

// ─── hover 详情浮层 ───
.level-detail {
  position: absolute;
  left: calc(100% + 6px);
  top: 0;
  z-index: 100;
  width: 260px;
  padding: $spacing-md;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  pointer-events: auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__total {
    font-size: $font-xs;
    font-weight: 700;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
  }

  &__desc {
    margin: 0 0 $spacing-md;
    font-size: $font-xs;
    line-height: 1.7;
    color: $text-secondary;
  }

  // 进度区
  &__progress-section {
    margin-bottom: $spacing-md;
    padding: $spacing-sm;
    border-radius: $radius-md;
    background: rgb(var(--text-primary-rgb) / 0.03);
  }

  &__progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 10px;
    font-weight: 600;
    color: $text-secondary;
  }

  &__max-tag {
    padding: 0 6px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: white;
    background: var(--level-color);
    border-radius: 3px;
    line-height: 16px;
  }

  &__progress {
    position: relative;
    height: 6px;
    border-radius: 3px;
    margin-bottom: 6px;
  }

  &__progress-rail {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgb(var(--text-primary-rgb) / 0.06);
  }

  &__progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: inherit;
    min-width: 2px;
    background: linear-gradient(90deg, var(--level-color), color-mix(in srgb, var(--level-color) 62%, white));
    box-shadow: 0 0 10px -3px var(--level-glow);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__next {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: $text-muted;

    strong {
      color: $text-secondary;
    }
  }

  // 今日统计
  &__stats {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding-top: $spacing-sm;
    border-top: 1px solid $border-subtle;
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__stat-value {
    font-size: $font-sm;
    font-weight: 700;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }

  &__stat-label {
    font-size: 9px;
    color: $text-muted;
    white-space: nowrap;
  }

  &__stat-divider {
    width: 1px;
    height: 24px;
    background: $border-subtle;
    flex-shrink: 0;
  }
}

// ─── 经验值弹出提示（改为组件内部底部弹出，避免被 titlebar 遮挡） ───
.xp-toast {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px $spacing-sm;
  background: var(--level-color);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: $radius-sm;
  box-shadow: 0 2px 8px var(--level-glow);
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

// ─── 动画 ───
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

// 经验值提示进出
.xp-toast-enter-active {
  animation: xp-float-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-toast-leave-active {
  animation: xp-float-out 0.3s ease forwards;
}

@keyframes xp-float-in {
  from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.85); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

@keyframes xp-float-out {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.9); }
}

// 详情面板进出
.detail-panel-enter-active {
  animation: detail-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.detail-panel-leave-active {
  animation: detail-out 0.15s ease forwards;
}

@keyframes detail-in {
  from { opacity: 0; transform: translateX(-6px) scale(0.96); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes detail-out {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(-6px) scale(0.96); }
}

// legendary 指示条呼吸发光
@keyframes legendary-accent-pulse {
  0%, 100% { box-shadow: 0 0 6px 1px rgba(184, 134, 11, 0.3); }
  50% { box-shadow: 0 0 12px 3px rgba(212, 168, 67, 0.55); }
}
</style>
