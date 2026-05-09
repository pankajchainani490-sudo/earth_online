import { usePlayerStore } from '../store/playerStore'
import { useThemeStore, THEMES } from '../store/themeStore'

export default function Achievements() {
  const { player } = usePlayerStore()
  const currentTheme = useThemeStore(s => s.currentTheme)
  const theme = THEMES[currentTheme]
  const primaryColor = theme.primary
  const secondaryColor = theme.secondary

  if (!player) return null

  const unlockedCount = player.achievements.filter(a => a.unlocked).length
  const rewardsEarned = Math.floor(unlockedCount / 10)

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">成就</h1>
        <span className="text-gray-400 text-sm">{unlockedCount}/30 成就</span>
      </div>

      <div className="mb-4 text-center text-gray-500 text-sm">
        每完成10个成就可领取1次每月任务创建机会（已解锁 {player.extraMonthlyTaskChances} 次）
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {player.achievements.map(achievement => {
          const { unlocked, threshold } = achievement
          const isATheme = currentTheme === 'A'
          const getAchievementStyle = (th: number, unl: boolean) => {
            if (!unl) return 'border-gray-700 bg-gray-800/30'
            if (isATheme) return 'border-white/50 bg-white/10'
            if (th === 35) return 'border bg-theme-primary/20'
            if (th === 40) return 'border-purple-500 bg-purple-500/20'
            return 'border bg-theme-secondary/20'
          }
          const getTextColor = (th: number, unl: boolean) => {
            if (!unl) return 'text-gray-500'
            if (isATheme) return 'text-white'
            if (th === 35) return 'text-theme-primary'
            if (th === 40) return 'text-purple-400'
            return 'text-theme-secondary'
          }
          return (
            <div
              key={achievement.id}
              className={`p-3 rounded border ${getAchievementStyle(threshold, unlocked)}`}
              style={unlocked ? {
                boxShadow: `0 0 10px ${isATheme ? 'rgba(255,255,255,0.3)' : threshold === 35 ? primaryColor : threshold === 40 ? '#9333ea' : secondaryColor}50`
              } : {}}
            >
              <div className="flex items-center gap-1">
                <span className="font-orbitron text-sm">{achievement.unlocked ? '★' : '○'}</span>
                <span className={`text-sm font-medium ${getTextColor(threshold, unlocked)}`}>
                  {achievement.name}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{achievement.desc}</p>
              {achievement.unlocked && achievement.unlocked_at && (
                <p className="text-xs text-gray-500 mt-1">达成: {achievement.unlocked_at}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}