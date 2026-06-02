import { create } from 'zustand'

export interface AIConfig {
  apiKey: string
  model: string
  baseUrl: string
  provider: string // "openai", "claude", "minimax"
  useDefaultApi: boolean
}

interface ConfigState {
  config: AIConfig | null
  loadConfig: () => void
  saveConfig: (config: AIConfig) => void
  hasKey: () => boolean
}

const CONFIG_STORAGE_KEY = 'ai_config'

export const DEFAULT_MINIMAX_CONFIG: AIConfig = {
  apiKey: 'sk-cp-39GJD0JfxtzSsZw2X6rOIkd7SOWndipemTrxJFVqqevgca_3lwQZYf5L9VhDuQPy1ofupkZmFBThVJNy-VLyeJT-Jmd2cWBsiKeCdTkBeickBXiRL7HfMUQ',
  model: 'MiniMax-M2.7',
  baseUrl: 'https://api.minimaxi.com/v1',
  provider: 'minimax',
  useDefaultApi: true,
}

function normalizeConfig(config: AIConfig): AIConfig {
  return config.useDefaultApi ? { ...DEFAULT_MINIMAX_CONFIG } : config
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,

  loadConfig: () => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (saved) {
        const config = normalizeConfig(JSON.parse(saved))
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
        set({ config })
      }
    } catch {
      // Ignore parse errors
    }
  },

  saveConfig: (config: AIConfig) => {
    const normalizedConfig = normalizeConfig(config)
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(normalizedConfig))
    set({ config: normalizedConfig })
  },

  hasKey: () => {
    const { config } = get()
    return !!(config?.apiKey)
  },
}))
