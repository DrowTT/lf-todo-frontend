export type PremiumFeature = 'subtasks' | 'extraCategories'

export interface FeatureContext {
  categoryCount?: number
}

export interface ProFeatureDefinition {
  title: string
  shortLabel: string
  upgradeMessage: string
  upgradeDescription: string
  isAccessible: (isPro: boolean, context?: FeatureContext) => boolean
}

export const MAX_FREE_CATEGORIES = 2

export const PRO_FEATURES: Record<PremiumFeature, ProFeatureDefinition> = {
  subtasks: {
    title: '子待办功能',
    shortLabel: '子待办',
    upgradeMessage: '升级 Pro 后即可使用子待办与相关快捷键',
    upgradeDescription: '包含展开/收起、子待办输入、子任务编辑与快捷操作。',
    isAccessible: (isPro) => isPro
  },
  extraCategories: {
    title: '无限分类数量',
    shortLabel: '无限分类',
    upgradeMessage: `免费版最多创建 ${MAX_FREE_CATEGORIES} 个分类，升级 Pro 后可无限创建。`,
    upgradeDescription: '适合需要按项目、生活、工作细分管理任务的用户。',
    isAccessible: (isPro, context = {}) => isPro || (context.categoryCount ?? 0) < MAX_FREE_CATEGORIES
  }
}
