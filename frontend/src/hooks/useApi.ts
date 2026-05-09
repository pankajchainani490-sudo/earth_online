const API_BASE = '/api'

export interface AIConfig {
  apiKey: string
  model: string
  baseUrl: string
  provider: string
}

export async function saveConfig(config: AIConfig): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) {
      localStorage.setItem('apiKey', config.apiKey)
      localStorage.setItem('apiModel', config.model)
      localStorage.setItem('apiBaseUrl', config.baseUrl)
      localStorage.setItem('apiProvider', config.provider)
    }
    return res.ok
  } catch {
    return false
  }
}

export async function getConfig(): Promise<{ model: string; baseUrl: string; provider: string; hasKey: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/config`)
    const data = await res.json()
    // Restore API key from localStorage if backend doesn't have it
    const savedKey = localStorage.getItem('apiKey')
    return {
      ...data,
      hasKey: data.hasKey || !!savedKey,
    }
  } catch {
    return { model: '', baseUrl: '', provider: '', hasKey: !!localStorage.getItem('apiKey') }
  }
}