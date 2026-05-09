import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { ABILITY_NAMES } from '../utils/achievements'

const abilityKeys = ['INTELLIGENCE', 'VITALITY', 'CHARISMA', 'CREATIVITY', 'WEALTH', 'WISDOM', 'FORTUNE', 'REPUTATION', 'MENTAL', 'SPIRIT']

export default function AllHistory() {
  const { player } = usePlayerStore()
  const navigate = useNavigate()

  if (!player) return null

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">全部历史</h1>
        <button
          onClick={() => navigate('/action')}
          className="px-4 py-2 bg-space-black/80 border border-theme-primary/30 text-theme-primary rounded hover:bg-theme-primary/20 transition text-sm"
        >
          返回
        </button>
      </div>

      <div className="space-y-4">
        {player.history.length === 0 ? (
          <p className="text-gray-500">暂无历史记录</p>
        ) : (
          player.history.slice().reverse().map((record, idx) => (
            <div key={idx} className="bg-theme-card neon-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-theme-primary text-sm">第 {player.history.length - idx} 天</p>
                <p className="text-gray-500 text-sm">{record.date}</p>
              </div>
              <p className="text-gray-300 mb-2">{record.action}</p>
              <p className="text-gray-400 text-sm mb-3">{record.narrative}</p>

              {/* Changes display - 经验变化 */}
              {(record.changes && Object.keys(record.changes).length > 0) && (
                <>
                  <div className="text-xs text-gray-500 mb-1">经验变化</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {abilityKeys.map(key => {
                      const change = record.changes?.[key] || 0
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

              {/* Direct changes - 点数变化（重大变故） */}
              {(record.directChanges && Object.keys(record.directChanges).length > 0) && (
                <>
                  <div className="text-xs text-gray-500 mb-1">点数变化</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {abilityKeys.map(key => {
                      const change = record.directChanges?.[key] || 0
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

              {record.achievements && record.achievements.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {record.achievements.map((achievement, i) => (
                    <span key={i} className="px-2 py-1 bg-theme-secondary/20 border border-theme-secondary text-theme-secondary rounded text-xs">
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
