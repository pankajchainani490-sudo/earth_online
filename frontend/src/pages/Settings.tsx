import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../store/playerStore'
import { useConfigStore } from '../store/configStore'

export default function Settings() {
  const { player, resetPlayer } = usePlayerStore()
  const { config, saveConfig } = useConfigStore()
  const [showFullInfo, setShowFullInfo] = useState(false)
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [localApiKey, setLocalApiKey] = useState(config?.apiKey || '')
  const [localModel, setLocalModel] = useState(config?.model || 'MiniMax-M2.7')
  const [localProvider, setLocalProvider] = useState(config?.provider || 'minimax')
  const [localBaseUrl, setLocalBaseUrl] = useState(config?.baseUrl || '')
  const [localUseDefaultApi, setLocalUseDefaultApi] = useState(config?.useDefaultApi ?? true)
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (config) {
      setLocalApiKey(config.apiKey || '')
      setLocalModel(config.model || 'MiniMax-M2.7')
      setLocalProvider(config.provider || 'minimax')
      setLocalBaseUrl(config.baseUrl || '')
      setLocalUseDefaultApi(config.useDefaultApi ?? true)
    }
  }, [config])

  if (!player) return null

  const bg = player.background || {}

  const handleSaveApi = () => {
    try {
      saveConfig({
        apiKey: localApiKey,
        model: localModel,
        provider: localProvider,
        baseUrl: localBaseUrl,
        useDefaultApi: localUseDefaultApi,
      })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleReset = async () => {
    setShowResetConfirm(true)
  }

  const handleConfirmReset = async () => {
    await resetPlayer()
    window.location.href = '/setup'
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">设置</h1>
      </div>

      {/* Full Info Block - 直接展示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-theme-card neon-border rounded-lg p-6 mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-theme-primary font-orbitron">玩家完整信息</h2>
          <button
            onClick={() => setShowFullInfo(!showFullInfo)}
            className="text-gray-400 hover:text-white text-sm"
          >
            {showFullInfo ? '收起' : '展开'}
          </button>
        </div>

        <AnimatePresence>
          {showFullInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">姓名: <span className="text-white">{bg.name}</span></div>
                <div className="text-gray-400">年龄: <span className="text-white">{bg.age}</span></div>
                <div className="text-gray-400">性别: <span className="text-white">{bg.gender || '-'}</span></div>
                <div className="text-gray-400">学历: <span className="text-white">{bg.education}</span></div>
                <div className="text-gray-400">专业: <span className="text-white">{bg.major}</span></div>
                <div className="text-gray-400">MBTI: <span className="text-white">{bg.mbti}</span></div>
                <div className="text-gray-400">职业: <span className="text-white">{bg.occupation}</span></div>
                <div className="text-gray-400">职业阶段: <span className="text-white">{bg.careerStage}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* API Config Block - 可展开修改 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-theme-card neon-border rounded-lg p-6 mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-theme-primary font-orbitron">API 配置</h2>
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="text-gray-400 hover:text-white text-sm"
          >
            {showApiConfig ? '收起' : '修改'}
          </button>
        </div>

        {/* 显示当前配置 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">提供商:</span>
            <span className="text-white capitalize">{config?.provider || 'minimax'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">模型:</span>
            <span className="text-white">{config?.model || 'MiniMax-M2.7'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">API Key:</span>
            <span className="text-white">{config?.useDefaultApi ? '默认 API' : (config?.apiKey ? `****${config.apiKey.slice(-4)}` : '未设置')}</span>
          </div>
        </div>

        {/* 展开修改表单 */}
        <AnimatePresence>
          {showApiConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-theme-primary/20"
            >
              {status === 'success' && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 rounded p-2 mb-4 text-sm">
                  配置已保存
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded p-2 mb-4 text-sm">
                  保存失败
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">选择 API</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="localApiChoice"
                        checked={localUseDefaultApi}
                        onChange={() => setLocalUseDefaultApi(true)}
                        className="w-4 h-4 accent-theme-primary"
                      />
                      <span className="text-white">使用默认 API</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="localApiChoice"
                        checked={!localUseDefaultApi}
                        onChange={() => setLocalUseDefaultApi(false)}
                        className="w-4 h-4 accent-theme-primary"
                      />
                      <span className="text-white">自定义 API</span>
                    </label>
                  </div>
                  {localUseDefaultApi && (
                    <p className="text-yellow-400/70 text-xs mt-2">
                      默认 API，高峰期可能无响应，建议配置自己的 API
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">AI 提供商</label>
                  <select
                    value={localProvider}
                    onChange={e => setLocalProvider(e.target.value)}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="claude">Claude</option>
                    <option value="minimax">MiniMax</option>
                  </select>
                </div>

                {!localUseDefaultApi && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={localApiKey}
                        onChange={e => setLocalApiKey(e.target.value)}
                        className="flex-1 bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="px-3 py-2 bg-space-black border border-theme-primary/30 text-theme-primary rounded hover:bg-theme-primary/20 transition text-sm"
                      >
                        {showKey ? '隐藏' : '显示'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">模型</label>
                  <input
                    type="text"
                    value={localModel}
                    disabled
                    placeholder="MiniMax-M2.7"
                    className="w-full bg-gray-900 border border-theme-primary/30 rounded px-3 py-2 text-gray-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveApi}
                  className="w-full bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron py-2 rounded hover:bg-theme-primary/30 transition"
                >
                  保存配置
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-theme-card neon-border rounded-lg p-6 mb-4"
      >
        <h2 className="text-theme-primary font-orbitron mb-4">其他</h2>
        <div className="space-y-3">
          <button
            onClick={() => setShowPrivacy(true)}
            className="w-full py-2 text-left bg-space-black/80 border border-theme-primary/30 text-gray-300 rounded px-4 hover:bg-theme-primary/10 hover:text-theme-primary transition"
          >
            隐私说明
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2 text-left bg-space-black/80 border border-red-500/30 text-gray-300 rounded px-4 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            重新开始
          </button>
        </div>
      </motion.div>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPrivacy(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="neon-border rounded-lg p-6 max-w-md w-full"
              style={{ backgroundColor: 'var(--theme-bg)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-theme-primary font-orbitron text-lg">隐私说明</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="text-gray-300 text-sm space-y-3">
                <p>• 所有游戏数据仅存储在您的本地设备中</p>
                <p>• 不会上传至任何服务器</p>
                <p>• 不会与任何第三方共享</p>
                <p>• 清除应用数据将导致游戏进度丢失</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="neon-border rounded-lg p-6 max-w-md w-full"
              style={{ backgroundColor: 'var(--theme-bg)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-red-400 font-orbitron text-lg">确认重新开始</h2>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-300 text-sm mb-6">确定要重新开始吗？所有数据将被清除。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-space-black border border-theme-primary/30 text-gray-300 rounded hover:bg-theme-primary/10 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
