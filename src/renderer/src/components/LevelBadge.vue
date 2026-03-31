<script setup lang="ts">
import { computed } from 'vue'
import { getLevelTier } from '../constants/levels'

const props = defineProps<{
  level: number
  /** 紧凑模式：只显示等级数字，不显示名称 */
  compact?: boolean
}>()

const tier = computed(() => getLevelTier(props.level))
// Lv.10 独立为 mythic 视觉档，与 Lv.9 legendary 区分
const badgeTier = computed(() => {
  if (props.level === 10) return 'mythic'
  return tier.value.tier
})
const badgeStyle = computed(() => ({
  '--level-color': tier.value.color,
  '--level-glow': tier.value.glowColor,
  '--level-gradient-from': tier.value.gradientFrom,
  '--level-gradient-to': tier.value.gradientTo
}))
</script>

<template>
  <span
    class="level-badge"
    :class="[
      `level-badge--${badgeTier}`,
      { 'level-badge--compact': compact }
    ]"
    :style="badgeStyle"
  >
    <!-- legendary/mythic 等级的微光扫过效果 -->
    <span v-if="tier.tier === 'legendary'" class="level-badge__shimmer" :class="`level-badge__shimmer--${badgeTier}`" />
    Lv.{{ level }}
    <template v-if="!compact">{{ tier.name }}</template>
  </span>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0 $spacing-sm;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 999px;
  line-height: 20px;
  white-space: nowrap;
  transition: all $transition-fast;
  position: relative;
  overflow: hidden;

  // ─── common 等级（Lv.1-3）：素雅扁平 ───
  &--common {
    color: color-mix(in srgb, var(--level-color) 75%, #1e293b);
    background: color-mix(in srgb, var(--level-gradient-from) 60%, white);
    outline: 1px solid color-mix(in srgb, var(--level-color) 22%, white);
    outline-offset: -1px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.4);
  }

  // ─── rare 等级（Lv.4-6）：微弱光泽 ───
  &--rare {
    color: color-mix(in srgb, var(--level-color) 85%, #0f172a);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--level-gradient-from) 70%, white),
      color-mix(in srgb, var(--level-gradient-to) 35%, white)
    );
    outline: 1px solid color-mix(in srgb, var(--level-color) 28%, white);
    outline-offset: -1px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.5),
      0 1px 4px -1px var(--level-glow);
  }

  // ─── epic 等级（Lv.7-8）：明显光晕 ───
  &--epic {
    color: white;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--level-color) 78%, #1e1b4b),
      color-mix(in srgb, var(--level-color) 52%, #312e81)
    );
    outline: 1px solid color-mix(in srgb, var(--level-color) 50%, white 30%);
    outline-offset: -1px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.18),
      0 2px 8px -2px var(--level-glow);
    text-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  }

  // ─── legendary 等级（Lv.9）：浅金·金属质感 ───
  &--legendary {
    color: #3d2200;
    background: linear-gradient(
      135deg,
      #fdf0d5 0%,
      #f0d48a 25%,
      #d4a843 50%,
      #f0d48a 75%,
      #fdf0d5 100%
    );
    background-size: 200% 200%;
    animation: legendary-shift 4s ease infinite;
    outline: 1px solid #d4a843;
    outline-offset: -1px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.5),
      inset 0 -1px 0 rgb(180 140 40 / 0.3),
      0 2px 10px -2px rgba(184, 134, 11, 0.4);
    text-shadow: 0 1px 0 rgb(255 255 255 / 0.4);
    font-weight: 800;
  }

  // ─── mythic 等级（Lv.10）：黑金·终极尊享 ───
  &--mythic {
    color: #f0d48a;
    background: linear-gradient(
      135deg,
      #1a1510 0%,
      #2d2318 20%,
      #3d2f1e 40%,
      #2d2318 60%,
      #1a1510 80%,
      #2d2318 100%
    );
    background-size: 200% 200%;
    animation: legendary-shift 5s ease infinite;
    outline: 1px solid rgba(212, 168, 67, 0.5);
    outline-offset: -1px;
    box-shadow:
      inset 0 1px 0 rgb(240 212 138 / 0.15),
      inset 0 -1px 0 rgb(26 21 16 / 0.5),
      0 2px 12px -2px rgba(184, 134, 11, 0.45),
      0 0 20px -4px rgba(212, 168, 67, 0.25);
    text-shadow: 0 0 8px rgba(240, 212, 138, 0.5);
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  &__shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgb(255 255 255 / 0.45) 50%,
      transparent 100%
    );
    animation: shimmer-sweep 3s ease-in-out infinite;
    pointer-events: none;

    // 黑金版流光：金色光泽
    &--mythic {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgb(240 212 138 / 0.5) 45%,
        rgb(255 255 255 / 0.3) 50%,
        rgb(240 212 138 / 0.5) 55%,
        transparent 100%
      );
      animation: shimmer-sweep 2.5s ease-in-out infinite;
    }
  }

  &--compact {
    padding: 0 6px;
    font-size: 9px;
    line-height: 18px;
    gap: 2px;
  }
}

// ─── 动画 ───
@keyframes legendary-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shimmer-sweep {
  0% { left: -50%; opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { left: 150%; opacity: 0; }
}
</style>
