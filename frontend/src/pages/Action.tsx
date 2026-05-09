import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { ABILITY_NAMES } from '../utils/achievements'

const abilityKeys = ['INTELLIGENCE', 'VITALITY', 'CHARISMA', 'CREATIVITY', 'WEALTH', 'WISDOM', 'FORTUNE', 'REPUTATION', 'MENTAL', 'SPIRIT']
const abilityNames: Record<string, string> = {
  INTELLIGENCE: '智慧',
  VITALITY: '活力',
  CHARISMA: '魅力',
  CREATIVITY: '创造力',
  WEALTH: '财富',
  WISDOM: '智慧(处世)',
  FORTUNE: '运气',
  REPUTATION: '名声',
  MENTAL: '心境',
  SPIRIT: '灵魂',
}

export default function Action() {
  const { player, submitDailyAction, isLoading } = usePlayerStore()
  const navigate = useNavigate()
  const [action, setAction] = useState('')
  const [lastResult, setLastResult] = useState<{ narrative: string; achievements: string[], changes: Record<string, number>, directChanges: Record<string, number> } | null>(null)

  if (!player) return null

  const mostRecentRecord = player.history.length > 0 ? player.history[player.history.length - 1] : null

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action.trim()) return
    const result = await submitDailyAction(action)
    if (result) {
      setLastResult({ narrative: result.narrative, achievements: result.achievements, changes: result.changes, directChanges: result.directChanges })
      setAction('')
    }
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">行动</h1>
      </div>

      {/* Daily Action Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-theme-card neon-border rounded-lg p-6 mb-6"
      >
        <h2 className="text-theme-primary font-orbitron mb-4">每日行动</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder="描述你今天的行动..."
            className="flex-1 bg-space-black border border-theme-primary/30 rounded px-4 py-2 text-white focus:border-theme-primary outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || player.history.length > 0 && player.history[player.history.length - 1].date === today}
            className="px-6 py-2 bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron rounded hover:bg-theme-primary/30 transition disabled:opacity-50"
          >
            {isLoading ? '思考中...' : '提交'}
          </button>
        </form>
      </motion.div>

      {/* Result Display */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card neon-border rounded-lg p-6 mb-6"
        >
          <h2 className="text-theme-primary font-orbitron mb-4">结果</h2>
          <p className="text-gray-300 mb-4">{lastResult.narrative}</p>

          {/* 经验变化（普通行动） */}
          {Object.keys(lastResult.changes).length > 0 && (
            <>
              <div className="text-xs text-gray-500 mb-2">经验值</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {abilityKeys.map(key => {
                  const change = lastResult.changes?.[key] || 0
                  if (change === 0) return null
                  return (
                    <div key={key} className={`text-sm px-2 py-1 rounded ${change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {abilityNames[key]}: {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* 直接点数变化（重大变故） */}
          {Object.keys(lastResult.directChanges).length > 0 && (
            <>
              <div className="text-xs text-gray-500 mb-2">点数变化</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {abilityKeys.map(key => {
                  const change = lastResult.directChanges?.[key] || 0
                  if (change === 0) return null
                  return (
                    <div key={key} className={`text-sm px-2 py-1 rounded ${change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {abilityNames[key]}: {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {lastResult.achievements.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {lastResult.achievements.map((achievement, idx) => (
                <span key={idx} className="px-3 py-1 bg-theme-secondary/20 border border-theme-secondary text-theme-secondary rounded-full text-sm">
                  🏆 {achievement}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-theme-card neon-border rounded-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-theme-primary font-orbitron">历史记录</h2>
          {player.history.length > 0 && (
            <button
              onClick={() => navigate('/all-history')}
              className="text-sm text-theme-secondary hover:text-white transition"
            >
              查看全部 ({player.history.length})
            </button>
          )}
        </div>

        {player.history.length === 0 ? (
          <p className="text-gray-500">暂无历史记录</p>
        ) : mostRecentRecord && (
          <div className="border border-gray-800 rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <p className="text-theme-primary text-sm">第 {player.history.length} 天</p>
              <p className="text-gray-500 text-sm">{mostRecentRecord.date}</p>
            </div>
            <p className="text-gray-300 mb-2">{mostRecentRecord.action}</p>
            <p className="text-gray-400 text-sm mb-3">{mostRecentRecord.narrative}</p>

            {/* Changes display */}
            {(mostRecentRecord.changes && Object.keys(mostRecentRecord.changes).length > 0) && (
              <>
                <div className="text-xs text-gray-500 mb-1">经验值</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {abilityKeys.map(key => {
                    const change = mostRecentRecord.changes?.[key] || 0
                    if (change === 0) return null
                    return (
                      <div key={key} className={`text-xs px-2 py-1 rounded ${change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {ABILITY_NAMES[key]}: {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Direct changes */}
            {(mostRecentRecord.directChanges && Object.keys(mostRecentRecord.directChanges).length > 0) && (
              <>
                <div className="text-xs text-gray-500 mb-1">点数变化</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {abilityKeys.map(key => {
                    const change = mostRecentRecord.directChanges?.[key] || 0
                    if (change === 0) return null
                    return (
                      <div key={key} className={`text-xs px-2 py-1 rounded ${change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {ABILITY_NAMES[key]}: {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {mostRecentRecord.achievements && mostRecentRecord.achievements.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {mostRecentRecord.achievements.map((achievement, i) => (
                  <span key={i} className="px-2 py-1 bg-theme-secondary/20 border border-theme-secondary text-theme-secondary rounded text-xs">
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
