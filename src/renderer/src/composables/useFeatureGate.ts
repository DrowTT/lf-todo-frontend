import { useAuthStore } from '../store/auth'
import { PRO_FEATURES } from '../constants/proFeatures'
import type { FeatureContext, PremiumFeature } from '../constants/proFeatures'

interface GuardOptions {
  prompt?: boolean
}

function dispatchUpgradePrompt(feature: PremiumFeature) {
  if (typeof window === 'undefined') return

  const meta = PRO_FEATURES[feature]

  window.dispatchEvent(
    new CustomEvent('pro:upgrade-required', {
      detail: {
        feature,
        title: meta.title,
        shortLabel: meta.shortLabel,
        message: meta.upgradeMessage,
        description: meta.upgradeDescription
      }
    })
  )
}

export function canAccessFeature(feature: PremiumFeature, context: FeatureContext = {}): boolean {
  const authStore = useAuthStore()
  return PRO_FEATURES[feature].isAccessible(authStore.isPro, context)
}

export function ensureFeatureAccess(
  feature: PremiumFeature,
  context: FeatureContext = {},
  options: GuardOptions = {}
): boolean {
  const allowed = canAccessFeature(feature, context)

  if (!allowed && options.prompt) {
    dispatchUpgradePrompt(feature)
  }

  return allowed
}
