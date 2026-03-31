import { computed, ref } from 'vue'

export type ThemeId = 'arctic-blue' | 'obsidian-gold' | 'aurora-mint' | 'violet-velvet'

export interface ThemePreset {
  id: ThemeId
  name: string
  tagline: string
  mood: string
  surface: string
  accent: string
  glow: string
  preview: [string, string, string]
}

const STORAGE_KEY = 'lf-todo.theme'
const DEFAULT_THEME: ThemeId = 'arctic-blue'

export const themePresets: ThemePreset[] = [
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    tagline: '清冽科技感',
    mood: '冷静、通透、专注',
    surface: 'linear-gradient(135deg, #ffffff 0%, #e8edf5 100%)',
    accent: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.22)',
    preview: ['#f0f4fa', '#ffffff', '#2563eb']
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    tagline: '黑金奢感',
    mood: '沉稳、奢华、仪式感',
    surface: 'linear-gradient(145deg, #191614 0%, #0c0a09 100%)',
    accent: '#c7a45b',
    glow: 'rgba(199, 164, 91, 0.24)',
    preview: ['#090807', '#191614', '#c7a45b']
  },
  {
    id: 'aurora-mint',
    name: 'Aurora Mint',
    tagline: '轻氧玻璃感',
    mood: '轻盈、治愈、呼吸感',
    surface: 'linear-gradient(145deg, #ffffff 0%, #dff5ef 100%)',
    accent: '#0ea5a4',
    glow: 'rgba(14, 165, 164, 0.24)',
    preview: ['#eef8f5', '#ffffff', '#0ea5a4']
  },
  {
    id: 'violet-velvet',
    name: 'Violet Velvet',
    tagline: '丝绒夜色',
    mood: '戏剧、梦幻、精致',
    surface: 'linear-gradient(145deg, #241d44 0%, #141126 100%)',
    accent: '#a855f7',
    glow: 'rgba(236, 72, 153, 0.2)',
    preview: ['#141126', '#211c3b', '#ec4899']
  }
]

const currentTheme = ref<ThemeId>(DEFAULT_THEME)

function isThemeId(value: string | null): value is ThemeId {
  return themePresets.some((theme) => theme.id === value)
}

export function applyTheme(themeId: ThemeId): void {
  currentTheme.value = themeId
  document.documentElement.dataset.theme = themeId
  localStorage.setItem(STORAGE_KEY, themeId)
}

export function initializeTheme(): ThemeId {
  const storedTheme = localStorage.getItem(STORAGE_KEY)
  const nextTheme = isThemeId(storedTheme) ? storedTheme : DEFAULT_THEME
  applyTheme(nextTheme)
  return nextTheme
}

export function useTheme() {
  const activeTheme = computed(() => currentTheme.value)

  return {
    activeTheme,
    themePresets,
    setTheme: applyTheme
  }
}
