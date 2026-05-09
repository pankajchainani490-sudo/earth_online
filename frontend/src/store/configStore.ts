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

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,

  loadConfig: () => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (saved) {
        set({ config: JSON.parse(saved) })
      }
    } catch {
      // Ignore parse errors
    }
  },

  saveConfig: (config: AIConfig) => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
    set({ config })
  },

  hasKey: () => {
    const { config } = get()
    return !!(config?.apiKey)
  },
}))