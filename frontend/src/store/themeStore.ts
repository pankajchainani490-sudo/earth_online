import { create } from 'zustand'

export type ThemeName = 'default' | 'S' | 'A+' | 'A' | 'B+' | 'B'

export interface Theme {
  id: ThemeName
  name: string
  primary: string  // replaces blue
  secondary: string  // replaces yellow
  bg: string  // background color
}

// Theme definitions matching user requirements
export const THEMES: Record<ThemeName, Theme> = {
  default: {
    id: 'default',
    name: '默认',
    primary: '#00d4ff', // quantum-blue
    secondary: '#fbbf24', // star-gold
    bg: '#0a0e17', // space black
  },
  'S': {
    id: 'S',
    name: '温沃和时长',
    primary: '#ff6b35', // orange-red (橙红)
    secondary: '#cc0000', // dark red
    bg: '#4a1515', // 亮红色背景
  },
  'A+': {
    id: 'A+',
    name: '红彩早春怡',
    primary: '#808080', // gray (灰绿主)
    secondary: '#6b8e23', // olive-green (灰绿辅)
    bg: '#0a1a0a', // 绿色背景
  },
  'A': {
    id: 'A',
    name: '斧人行月',
    primary: '#444444', // 深灰（边框、按钮等可见）
    secondary: '#ffffff', // 白色（文字）
    bg: '#0a0a0a', // 黑色背景
  },
  'B+': {
    id: 'B+',
    name: '朝歌耳畔时时渐',
    primary: '#daa520', // gold (金粉主)
    secondary: '#ff69b4', // hot-pink (金粉辅)
    bg: '#2a2010', // 亮金色背景
  },
  'B': {
    id: 'B',
    name: '俱往矣',
    primary: '#cc4444', // 浅红色（边框、按钮等可见）
    secondary: '#ff6666', // 亮红色（文字）
    bg: '#1a0505', // 暗红色背景
  },
}

// Required ability level for each theme (player level >= this to unlock)
export const THEME_UNLOCK_LEVELS: Record<ThemeName, number> = {
  default: 0,
  'S': 50,
  'A+': 45,
  'A': 40,
  'B+': 35,
  'B': 30,
}

interface ThemeState {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  loadTheme: () => void
}

// Load theme from localStorage
function loadStoredTheme(): ThemeName {
  try {
    const saved = localStorage.getItem('player_theme')
    if (saved && saved in THEMES) {
      return saved as ThemeName
    }
  } catch {
    // Ignore
  }
  return 'default'
}

// Save theme to localStorage
function saveTheme(theme: ThemeName): void {
  localStorage.setItem('player_theme', theme)
}

// Helper to convert hex to RGB string
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '10, 14, 23' // default space black RGB
}

// Apply theme variables to document
function applyTheme(themeName: ThemeName): void {
  const root = document.documentElement
  const themeDef = THEMES[themeName]
  root.style.setProperty('--theme-primary', themeDef.primary)
  root.style.setProperty('--theme-secondary', themeDef.secondary)
  root.style.setProperty('--theme-bg', themeDef.bg)
  root.style.setProperty('--theme-primary-rgb', hexToRgb(themeDef.primary))
  root.style.setProperty('--theme-secondary-rgb', hexToRgb(themeDef.secondary))
  root.style.setProperty('--theme-bg-rgb', hexToRgb(themeDef.bg))
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'default',

  setTheme: (theme: ThemeName) => {
    saveTheme(theme)
    applyTheme(theme)
    set({ currentTheme: theme })
  },

  loadTheme: () => {
    const theme = loadStoredTheme()
    applyTheme(theme)
    set({ currentTheme: theme })
  },
}))

// Get CSS variable string for current theme
export function getThemeVariables(themeName: ThemeName): string {
  const theme = THEMES[themeName]
  return `--theme-primary: ${theme.primary}; --theme-secondary: ${theme.secondary}; --theme-bg: ${theme.bg};`
}
