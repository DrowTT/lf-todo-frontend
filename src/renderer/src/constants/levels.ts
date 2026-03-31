export const MAX_LEVEL = 10

export interface LevelTier {
  level: number
  name: string
  /** 主色 */
  color: string
  /** 发光色 */
  glowColor: string
  /** 渐变起点（用于浮层背景等） */
  gradientFrom: string
  /** 渐变终点 */
  gradientTo: string
  /** 境界描述文案 */
  description: string
  /** 升至此等级所需总 XP */
  totalXpRequired: number
  /** 等级段标识：决定 Badge 的视觉层次 */
  tier: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * 等级配色体系 —— Arctic Blue 设计系统融合版
 *
 * 设计原则：
 * - Lv.1-3（common）：冷灰蓝色系，素雅内敛，扁平简洁
 * - Lv.4-6（rare）：冷翡翠/宝石蓝色系，带微弱光泽
 * - Lv.7-8（epic）：深紫/靛蓝色系，有明显光晕
 * - Lv.9-10（legendary）：星辉金/熔岩铂金，金属质感 + 发光动画
 */
export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    name: '晨光初醒',
    color: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    gradientFrom: '#F1F5F9',
    gradientTo: '#CBD5E1',
    description: '第一缕晨光落在案前，适合把今天轻轻点亮。',
    totalXpRequired: 0,
    tier: 'common'
  },
  {
    level: 2,
    name: '山岚拂晓',
    color: '#78A7B8',
    glowColor: 'rgba(120, 167, 184, 0.28)',
    gradientFrom: '#EEF6FA',
    gradientTo: '#B1D1DE',
    description: '清岚穿过群山，行动开始有了更鲜明的方向。',
    totalXpRequired: 8,
    tier: 'common'
  },
  {
    level: 3,
    name: '林泉听风',
    color: '#64A89A',
    glowColor: 'rgba(100, 168, 154, 0.28)',
    gradientFrom: '#EDF8F5',
    gradientTo: '#A2D4C8',
    description: '风过林泉，节奏渐稳，专注感开始自然生长。',
    totalXpRequired: 18,
    tier: 'common'
  },
  {
    level: 4,
    name: '云舟望月',
    color: '#5B8EC9',
    glowColor: 'rgba(91, 142, 201, 0.32)',
    gradientFrom: '#EBF3FF',
    gradientTo: '#8FB8E8',
    description: '像乘舟穿云的人，开始在更高处看见自己的路线。',
    totalXpRequired: 32,
    tier: 'rare'
  },
  {
    level: 5,
    name: '星野流辉',
    color: '#6E7FD6',
    glowColor: 'rgba(110, 127, 214, 0.34)',
    gradientFrom: '#EDEEFF',
    gradientTo: '#9BA6F0',
    description: '星辉铺满原野，完成每一步都开始带来可见的回响。',
    totalXpRequired: 50,
    tier: 'rare'
  },
  {
    level: 6,
    name: '沧溟逐浪',
    color: '#4793BE',
    glowColor: 'rgba(71, 147, 190, 0.34)',
    gradientFrom: '#E8F5FC',
    gradientTo: '#7EC5E6',
    description: '穿过辽阔海面后，前进已经不再只是意志，而是惯性。',
    totalXpRequired: 72,
    tier: 'rare'
  },
  {
    level: 7,
    name: '霜天问岳',
    color: '#6461C4',
    glowColor: 'rgba(100, 97, 196, 0.38)',
    gradientFrom: '#EFEDFF',
    gradientTo: '#9490EC',
    description: '高天与远山同时出现，意味着你已敢向更难处攀行。',
    totalXpRequired: 98,
    tier: 'epic'
  },
  {
    level: 8,
    name: '天游万象',
    color: '#8B5FC7',
    glowColor: 'rgba(139, 95, 199, 0.42)',
    gradientFrom: '#F3ECFF',
    gradientTo: '#B591ED',
    description: '视野从一日延展到万象，持续投入开始改变整体气场。',
    totalXpRequired: 128,
    tier: 'epic'
  },
  {
    level: 9,
    name: '九霄揽月',
    color: '#C08B42',
    glowColor: 'rgba(192, 139, 66, 0.44)',
    gradientFrom: '#FDF6EC',
    gradientTo: '#DEB96E',
    description: '已能把明月揽入怀中，说明你离巅峰只差最后一程。',
    totalXpRequired: 162,
    tier: 'legendary'
  },
  {
    level: 10,
    name: '长河落日',
    color: '#B8860B',
    glowColor: 'rgba(184, 134, 11, 0.48)',
    gradientFrom: '#FFF8E7',
    gradientTo: '#D4A843',
    description: '大河尽头，落日满天，这是把坚持活成风景的等级。',
    totalXpRequired: 200,
    tier: 'legendary'
  }
]

export function getLevelTier(level: number): LevelTier {
  return LEVEL_TIERS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1]
}
