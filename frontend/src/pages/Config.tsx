import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfigStore } from '../store/configStore'

export default function Config() {
  const navigate = useNavigate()
  const config = useConfigStore(s => s.config)
  const saveConfig = useConfigStore(s => s.saveConfig)
  const [localConfig, setLocalConfig] = useState({
    apiKey: '',
    model: 'MiniMax-M2.7',
    baseUrl: '',
    provider: 'minimax',
    showKey: false,
  })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (config) {
      setLocalConfig({
        apiKey: config.apiKey || '',
        model: config.model || 'MiniMax-M2.7',
        baseUrl: config.baseUrl || '',
        provider: config.provider || 'minimax',
        showKey: false,
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      saveConfig({
        apiKey: localConfig.apiKey,
        model: localConfig.model,
        baseUrl: localConfig.baseUrl,
        provider: localConfig.provider,
      })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="w-full max-w-md neon-border rounded-lg p-6 bg-space-black/80">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-orbitron text-2xl neon-gold">API 配置</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-space-black/80 border border-theme-primary/30 text-theme-primary rounded hover:bg-theme-primary/20 transition text-sm"
          >
            返回
          </button>
        </div>

        {status === 'success' && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 rounded p-3 mb-4">
            配置已保存
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded p-3 mb-4">
            保存失败
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">AI 提供商</label>
            <select
              value={localConfig.provider}
              onChange={e => setLocalConfig(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="minimax">MiniMax</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type={localConfig.showKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={e => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="flex-1 bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setLocalConfig(prev => ({ ...prev, showKey: !prev.showKey }))}
                className="px-3 py-2 bg-space-black border border-theme-primary/30 text-theme-primary rounded hover:bg-theme-primary/20 transition text-sm"
              >
                {localConfig.showKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">模型</label>
            <input
              type="text"
              value={localConfig.model}
              onChange={e => setLocalConfig(prev => ({ ...prev, model: e.target.value }))}
              placeholder="gpt-4"
              className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Base URL (可选)</label>
            <input
              type="text"
              value={localConfig.baseUrl}
              onChange={e => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://api.openai.com/v1"
              className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron py-3 rounded hover:bg-theme-primary/30 transition"
          >
            保存配置
          </button>
        </form>
      </div>
    </div>
  )
}