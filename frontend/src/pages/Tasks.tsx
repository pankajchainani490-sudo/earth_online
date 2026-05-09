import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../store/playerStore'
import { useThemeStore, THEMES } from '../store/themeStore'
import { ABILITY_NAMES } from '../utils/achievements'

const ABILITY_KEYS = ['INTELLIGENCE', 'VITALITY', 'CHARISMA', 'CREATIVITY', 'WEALTH', 'WISDOM', 'FORTUNE', 'REPUTATION', 'MENTAL', 'SPIRIT']

const WHEEL_SEGMENTS = [
  { value: -50, label: '-50', color: '#ff4444' },
  { value: -25, label: '-25', color: '#ff8844' },
  { value: -10, label: '-10', color: '#ffaa44' },
  { value: 0, label: '谢谢参与', color: '#888888' },
  { value: 10, label: '+10', color: '#44ff88' },
  { value: 25, label: '+25', color: '#44aaff' },
  { value: 50, label: '+50', color: '#ffd700' },
]

function LuckWheel({ onSpin }: { onSpin: () => Promise<{ value: number; label: string } | null> }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<{ value: number; label: string } | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSpin = async () => {
    if (spinning) return
    setSpinning(true)
    setShowResult(false)
    setResult(null)

    const spinResult = await onSpin()
    if (!spinResult) {
      setSpinning(false)
      return
    }

    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.value === spinResult.value)
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.4)
    const targetAngle = 360 - segmentIndex * segmentAngle - segmentAngle / 2 + randomOffset
    const totalRotation = rotation + 1440 + targetAngle
    setRotation(totalRotation)

    setTimeout(() => {
      setSpinning(false)
      setResult(spinResult)
      setShowResult(true)
    }, 4000)
  }

  const size = 240
  const center = size / 2
  const outerRadius = size / 2 - 4
  const innerRadius = outerRadius * 0.35
  const segmentAngle = 360 / WHEEL_SEGMENTS.length

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const start = (startAngle - 90) * Math.PI / 180
    const end = (endAngle - 90) * Math.PI / 180
    const x1 = center + r * Math.cos(start)
    const y1 = center + r * Math.sin(start)
    const x2 = center + r * Math.cos(end)
    const y2 = center + r * Math.sin(end)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return { x1, y1, x2, y2, largeArc }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1)',
            background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 left-1/2 w-6 h-10 -translate-x-1/2 -translate-y-2 z-20"
          style={{
            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
            background: 'linear-gradient(to bottom, #ffd700, #ff8c00)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          }}
        />
        <motion.svg
          width={size}
          height={size}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#0a0a15" />
            </radialGradient>
            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#ffd700" />
            </linearGradient>
          </defs>

          {WHEEL_SEGMENTS.map((seg, i) => {
            const startAngle = i * segmentAngle
            const endAngle = (i + 1) * segmentAngle
            const { x1, y1, x2, y2, largeArc } = describeArc(startAngle, endAngle, outerRadius)

            const midAngle = (startAngle + endAngle) / 2 - 90
            const labelRadius = outerRadius * 0.52
            const labelX = center + labelRadius * Math.cos(midAngle * Math.PI / 180)
            const labelY = center + labelRadius * Math.sin(midAngle * Math.PI / 180)

            const normalizedMid = ((midAngle % 360) + 360) % 360
            const textAnchor = normalizedMid > 90 && normalizedMid < 270 ? 'end' : 'start'

            const isThanks = seg.value === 0

            return (
              <g key={i}>
                <path
                  d={`M ${center} ${center} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={seg.color}
                  stroke="url(#goldBorder)"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize={isThanks ? "9" : "14"}
                  fontFamily="Orbitron, sans-serif"
                  fontWeight="bold"
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {isThanks ? (
                    <>
                      <tspan x={labelX} dy="-0.5em">谢</tspan>
                      <tspan x={labelX} dy="1em">谢</tspan>
                      <tspan x={labelX} dy="1em">参</tspan>
                      <tspan x={labelX} dy="1em">与</tspan>
                    </>
                  ) : seg.label}
                </text>
              </g>
            )
          })}

          <circle cx={center} cy={center} r={innerRadius} fill="url(#wheelGradient)" stroke="url(#goldBorder)" strokeWidth="3" />
          <text x={center} y={center} fill="#ffd700" fontSize="11" fontFamily="Orbitron" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            运气
          </text>
        </motion.svg>

        <div
          className="absolute rounded-full pointer-events-none animate-pulse"
          style={{
            width: size - 8,
            height: size - 8,
            top: 4,
            left: 4,
            border: '2px solid rgba(255, 215, 0, 0.3)',
            boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.1)',
          }}
        />
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 text-space-black font-orbitron font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg shadow-yellow-500/30"
      >
        {spinning ? '抽奖中...' : '转动转盘'}
      </button>

      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-4 px-6 py-3 rounded-lg font-orbitron text-lg ${
            result.value > 0 ? 'bg-green-500/30 text-green-300 border border-green-500/50' :
            result.value < 0 ? 'bg-red-500/30 text-red-300 border border-red-500/50' :
            'bg-gray-500/30 text-gray-300 border border-gray-500/50'
          }`}
          style={{ boxShadow: result.value !== 0 ? `0 0 20px ${result.value > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` : undefined }}
        >
          {result.value > 0 ? `🎉 +${result.value}` : result.value < 0 ? `😢 ${result.value}` : '下次好运'} 运气经验
        </motion.div>
      )}
    </div>
  )
}

// Countdown Timer Component
function CountdownTimer({ dueDate, onExpire }: { dueDate: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const end = new Date(dueDate)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('已到期')
        onExpire()
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}小时 ${minutes}分 ${seconds}秒`)
      } else {
        setTimeLeft(`${minutes}分 ${seconds}秒`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [dueDate, onExpire])

  return <span className="text-theme-secondary text-sm">{timeLeft}</span>
}

export default function Tasks() {
  const { player, drawLuckWheel, drinkWater, canDrinkWater, addWeeklyTask, completeWeeklyTask, deleteWeeklyTask, addMonthlyTask, completeMonthlyTask, deleteMonthlyTask, getDailyQuest, completeDailyQuest, cleanupExpiredTasks } = usePlayerStore()
  const currentTheme = useThemeStore(s => s.currentTheme)
  const theme = THEMES[currentTheme]
  const primaryColor = theme.primary
  const secondaryColor = theme.secondary
  const [expandedSection, setExpandedSection] = useState<'daily' | 'weekly' | 'monthly' | null>(null)

  // Daily water state
  const [waterMessage, setWaterMessage] = useState('')

  // Weekly task state
  const [showAddWeekly, setShowAddWeekly] = useState(false)
  const [weeklyContent, setWeeklyContent] = useState('')
  const [weeklyAttribute, setWeeklyAttribute] = useState('INTELLIGENCE')
  const [weeklyError, setWeeklyError] = useState('')
  const [weeklySuccessMsg, setWeeklySuccessMsg] = useState('')
  const [weeklySubmitting, setWeeklySubmitting] = useState(false)

  // Monthly task state
  const [showAddMonthly, setShowAddMonthly] = useState(false)
  const [monthlyContent, setMonthlyContent] = useState('')
  const [monthlyAttribute, setMonthlyAttribute] = useState('INTELLIGENCE')
  const [monthlyError, setMonthlyError] = useState('')
  const [monthlySuccessMsg, setMonthlySuccessMsg] = useState('')
  const [monthlySubmitting, setMonthlySubmitting] = useState(false)

  // Water cooldown countdown
  const [waterCooldown, setWaterCooldown] = useState('')
  // Luck wheel reset countdown
  const [luckWheelReset, setLuckWheelReset] = useState('')
  // Daily quest message
  const [questMessage, setQuestMessage] = useState('')
  // Daily quest reset countdown
  const [questReset, setQuestReset] = useState('')

  // Get daily quest on mount and cleanup expired tasks
  useEffect(() => {
    getDailyQuest()
    cleanupExpiredTasks()
  }, [])

  if (!player) return null

  const today = new Date().toISOString().split('T')[0]
  const hasSpunToday = player.lastLuckWheelDate === today

  // Calculate today's water drinks
  const todayWaterDrinks = player.waterDrinks?.filter(d => d.startsWith(today)) || []
  const waterCount = todayWaterDrinks.length
  const canDrink = canDrinkWater()

  // Daily quest
  const dailyQuest = player.dailyQuest?.date === today ? player.dailyQuest : null

  // Handle quest completion
  const handleCompleteQuest = async () => {
    const result = await completeDailyQuest()
    setQuestMessage(result.message)
  }

  // Weekly tasks
  const activeWeeklyTasks = (player.weeklyTasks || []).filter(t => !t.completed)
  const completedWeeklyTasks = (player.weeklyTasks || []).filter(t => t.completed)

  // Monthly tasks
  const activeMonthlyTasks = (player.monthlyTasks || []).filter(t => !t.completed)
  const completedMonthlyTasks = (player.monthlyTasks || []).filter(t => t.completed)

  const handleDrink = async () => {
    const result = await drinkWater()
    setWaterMessage(result.message)
    setTimeout(() => setWaterMessage(''), 2000)
  }

  useEffect(() => {
    const updateCooldowns = () => {
      // Water cooldown
      if (!canDrink && waterCount < 6 && player.lastDrinkTime) {
        const lastDrink = new Date(player.lastDrinkTime)
        const nextDrink = new Date(lastDrink.getTime() + 60 * 60 * 1000)
        const now = new Date()
        const diff = nextDrink.getTime() - now.getTime()
        if (diff > 0) {
          const mins = Math.floor(diff / (1000 * 60))
          const secs = Math.floor((diff % (1000 * 60)) / 1000)
          setWaterCooldown(`${mins}分${secs}秒`)
        } else {
          setWaterCooldown('')
        }
      } else {
        setWaterCooldown('')
      }

      // Luck wheel reset (midnight)
      if (hasSpunToday) {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const diff = tomorrow.getTime() - now.getTime()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const secs = Math.floor((diff % (1000 * 60)) / 1000)
          setLuckWheelReset(`${hours}小时${mins}分${secs}秒`)
        }
      } else {
        setLuckWheelReset('')
      }

      // Quest reset (midnight) - show countdown if quest exists
      if (dailyQuest) {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const diff = tomorrow.getTime() - now.getTime()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const secs = Math.floor((diff % (1000 * 60)) / 1000)
          setQuestReset(`${hours}小时${mins}分${secs}秒`)
        }
      } else {
        setQuestReset('')
      }
    }

    updateCooldowns()
    const interval = setInterval(updateCooldowns, 1000)
    return () => clearInterval(interval)
  }, [canDrink, waterCount, player.lastDrinkTime, hasSpunToday, dailyQuest])

  const handleAddWeeklyTask = async () => {
    if (!weeklyContent.trim()) {
      setWeeklyError('请输入任务内容')
      return
    }
    setWeeklySubmitting(true)
    const result = await addWeeklyTask(weeklyContent, weeklyAttribute, 25)
    setWeeklySubmitting(false)
    if (result.success) {
      setShowAddWeekly(false)
      setWeeklyContent('')
      setWeeklyError('')
      setWeeklySuccessMsg('周度任务添加成功！')
      setTimeout(() => setWeeklySuccessMsg(''), 3000)
    } else {
      setWeeklyError(result.message)
    }
  }

  const handleAddMonthlyTask = async () => {
    if (!monthlyContent.trim()) {
      setMonthlyError('请输入任务内容')
      return
    }
    setMonthlySubmitting(true)
    const result = await addMonthlyTask(monthlyContent, monthlyAttribute, 1)
    setMonthlySubmitting(false)
    if (result.success) {
      setShowAddMonthly(false)
      setMonthlyContent('')
      setMonthlyError('')
      setMonthlySuccessMsg('月度任务添加成功！')
      setTimeout(() => setMonthlySuccessMsg(''), 3000)
    } else {
      setMonthlyError(result.message)
    }
  }

  // Helper functions for countdown
  const getEndOfWeek = () => {
    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    endOfWeek.setHours(23, 59, 59, 999)
    return endOfWeek.toISOString()
  }

  const getEndOfMonth = () => {
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return endOfMonth.toISOString()
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">任务</h1>
      </div>

      <div className="space-y-4">
        {/* 每日任务 */}
        <div className="bg-theme-card neon-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
            className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition"
          >
            <h2 className="font-orbitron" style={{ color: primaryColor }}>每日任务</h2>
            <span className="text-gray-400">{expandedSection === 'daily' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'daily' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 space-y-6"
            >
              {/* 每日运气转盘 */}
              <div className="flex flex-col items-center">
                <h3 className="text-theme-primary font-orbitron mb-3">每日运气转盘</h3>
                <LuckWheel onSpin={drawLuckWheel} />
                {hasSpunToday ? (
                  <p className="text-gray-500 text-sm mt-2">
                    今日已抽奖 {luckWheelReset && <span className="text-theme-secondary">({luckWheelReset})</span>}
                  </p>
                ) : null}
              </div>

              {/* 分割线 */}
              <div className="border-t border-theme-primary/20"></div>

              {/* 每日饮水 */}
              <div className="text-center">
                <h3 className="text-theme-primary font-orbitron mb-3">每日饮水</h3>
                <p className="text-gray-400 text-sm mb-4">每隔1小时可饮水一次，完成6次饮水获得活力经验+10</p>

                {/* 6个长条形进度条 */}
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`w-8 h-20 rounded-lg transition-all ${
                        i < waterCount
                          ? 'bg-theme-secondary'
                          : 'bg-theme-primary-dark'
                      }`}
                      style={
                        i < waterCount
                          ? {
                              boxShadow: `0 0 25px rgba(var(--theme-secondary-rgb), 0.8), 0 0 50px rgba(var(--theme-secondary-rgb), 0.4)`,
                            }
                          : {
                              boxShadow: `0 0 15px rgba(var(--theme-primary-rgb), 0.4), 0 0 30px rgba(var(--theme-primary-rgb), 0.3)`,
                            }
                      }
                    />
                  ))}
                </div>

                {/* 饮水按钮 */}
                <button
                  onClick={handleDrink}
                  disabled={!canDrink}
                  className={`px-8 py-3 font-orbitron rounded-lg transition-all ${
                    canDrink
                      ? 'bg-theme-primary/20 border border-theme-primary text-theme-primary hover:bg-theme-primary/30'
                      : 'bg-gray-800 border border-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                  style={canDrink ? { boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)' } : undefined}
                >
                  💧 饮水
                </button>

                {waterMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-green-400"
                  >
                    {waterMessage}
                  </motion.p>
                )}

                {!canDrink && waterCount < 6 && (
                  <p className="mt-2 text-gray-500 text-sm">
                    请等待1小时后再饮水 {waterCooldown && <span className="text-theme-secondary">({waterCooldown})</span>}
                  </p>
                )}

                {waterCount >= 6 && (
                  <p className="mt-2 text-theme-secondary">今日饮水任务已完成！活力经验 +10</p>
                )}
              </div>

              {/* 分割线 */}
              <div className="border-t border-theme-primary/20"></div>

              {/* 每日悬赏 */}
              <div className="text-center">
                <h3 className="text-theme-primary font-orbitron mb-3">每日悬赏</h3>
                {dailyQuest && !dailyQuest.completed ? (
                  <>
                    <p className="text-white text-sm mb-4">{dailyQuest.content}</p>
                    <button
                      onClick={handleCompleteQuest}
                      className="px-6 py-2 bg-theme-secondary/20 border border-theme-secondary text-theme-secondary rounded hover:bg-theme-secondary/30 transition"
                    >
                      完成悬赏
                    </button>
                    {questMessage && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-green-400 text-sm"
                      >
                        {questMessage}
                      </motion.p>
                    )}
                    {questReset && (
                      <p className="text-gray-500 text-xs mt-2">重置 {questReset}</p>
                    )}
                  </>
                ) : dailyQuest && dailyQuest.completed ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">今日悬赏已完成</p>
                    <p className="text-gray-500 text-xs line-through">{dailyQuest.content}</p>
                    {player.dailyQuestResult && (
                      <p className="text-green-400 text-sm mt-2">{player.dailyQuestResult}</p>
                    )}
                    {questReset && (
                      <p className="text-gray-500 text-xs mt-2">重置 {questReset}</p>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </div>

        {/* 周度任务 */}
        <div className="bg-theme-card neon-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'weekly' ? null : 'weekly')}
            className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-theme-primary font-orbitron">周度任务</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-secondary text-sm">本周任务剩余时间：</span>
              <CountdownTimer
                dueDate={player.weeklyTasksDueDate || getEndOfWeek()}
                onExpire={cleanupExpiredTasks}
              />
              <span className="text-gray-400">{expandedSection === 'weekly' ? '▲' : '▼'}</span>
            </div>
          </button>
          {expandedSection === 'weekly' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              {/* 添加任务按钮 */}
              {completedWeeklyTasks.length < 5 && !showAddWeekly && (
                <button
                  onClick={() => setShowAddWeekly(true)}
                  className="w-full py-3 mb-4 bg-theme-primary/10 border border-dashed border-theme-primary/50 text-theme-primary rounded-lg hover:bg-theme-primary/20 transition"
                >
                  + 添加周度任务
                </button>
              )}

              {/* 添加任务表单 */}
              {showAddWeekly && (
                <div className="bg-space-black/80 rounded-lg p-4 mb-4 border border-theme-primary/30">
                  <h3 className="text-theme-primary font-orbitron mb-3">添加周度任务</h3>
                  <p className="text-gray-500 text-xs mb-3">奖励：25 经验值（自动发放）</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">任务内容</label>
                      <textarea
                        value={weeklyContent}
                        onChange={e => setWeeklyContent(e.target.value)}
                        placeholder="描述你的周度任务..."
                        className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">奖励属性</label>
                      <select
                        value={weeklyAttribute}
                        onChange={e => setWeeklyAttribute(e.target.value)}
                        className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                      >
                        {ABILITY_KEYS.filter(key => key !== 'FORTUNE').map(key => (
                          <option key={key} value={key}>{ABILITY_NAMES[key]}</option>
                        ))}
                      </select>
                    </div>
                    {weeklyError && <p className="text-red-400 text-sm">{weeklyError}</p>}
                    {weeklySuccessMsg && <p className="text-green-400 text-sm">{weeklySuccessMsg}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddWeeklyTask}
                        disabled={weeklySubmitting}
                        className="flex-1 py-2 bg-theme-primary/20 border border-theme-primary text-theme-primary rounded hover:bg-theme-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {weeklySubmitting ? '审核中...' : '确认添加'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddWeekly(false)
                          setWeeklyError('')
                          setWeeklySuccessMsg('')
                        }}
                        className="flex-1 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 任务列表 */}
              {activeWeeklyTasks.length === 0 && !showAddWeekly ? (
                <p className="text-gray-500 text-center py-4">暂无进行中的周度任务</p>
              ) : (
                <div className="space-y-3">
                  {activeWeeklyTasks.map(task => (
                    <div key={task.id} className="bg-space-black/80 rounded-lg p-4 border border-theme-primary/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white">{task.content}</p>
                          <p className="text-sm text-gray-400">
                            {ABILITY_NAMES[task.attribute]} +{task.expReward}经验
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteWeeklyTask(task.id)}
                            className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition text-sm"
                          >
                            删除
                          </button>
                          <button
                            onClick={() => completeWeeklyTask(task.id)}
                            className="px-4 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition text-sm"
                          >
                            完成
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 已完成任务 */}
              {completedWeeklyTasks.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">已完成 ({completedWeeklyTasks.length}/5)</p>
                  <div className="space-y-2">
                    {completedWeeklyTasks.map(task => (
                      <div key={task.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 opacity-60">
                        <p className="text-gray-400 line-through">{task.content}</p>
                        <p className="text-xs text-gray-500">
                          {ABILITY_NAMES[task.attribute]} +{task.expReward}经验 ✓
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* 月度任务 */}
        <div className="bg-theme-card neon-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'monthly' ? null : 'monthly')}
            className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-theme-primary font-orbitron">月度任务</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-theme-secondary text-sm">本月任务剩余时间：</span>
              <CountdownTimer
                dueDate={player.monthlyTasksDueDate || getEndOfMonth()}
                onExpire={cleanupExpiredTasks}
              />
              <span className="text-gray-400">{expandedSection === 'monthly' ? '▲' : '▼'}</span>
            </div>
          </button>
          {expandedSection === 'monthly' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              {/* 提示 */}
              <p className="text-sm mb-4 text-center" style={{ color: 'rgba(var(--theme-secondary-rgb), 0.7)' }}>
                月度任务难度较高，完成后奖励1点指定属性点数
              </p>

              {/* 添加任务按钮 */}
              {completedMonthlyTasks.length < 1 && !showAddMonthly && (
                <button
                  onClick={() => setShowAddMonthly(true)}
                  className="w-full py-3 mb-4 bg-theme-primary/10 border border-dashed border-theme-primary/50 text-theme-primary rounded-lg hover:bg-theme-primary/20 transition"
                >
                  + 添加月度任务
                </button>
              )}

              {/* 添加任务表单 */}
              {showAddMonthly && (
                <div className="bg-space-black/80 rounded-lg p-4 mb-4 border border-theme-primary/30">
                  <h3 className="text-theme-primary font-orbitron mb-3">添加月度任务</h3>
                  <p className="text-xs mb-3" style={{ color: 'rgba(var(--theme-secondary-rgb), 0.7)' }}>奖励：1 点属性点数（自动发放）</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">任务内容（高难度）</label>
                      <textarea
                        value={monthlyContent}
                        onChange={e => setMonthlyContent(e.target.value)}
                        placeholder="描述一个有挑战性的月度目标..."
                        className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">奖励属性</label>
                      <select
                        value={monthlyAttribute}
                        onChange={e => setMonthlyAttribute(e.target.value)}
                        className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                      >
                        {ABILITY_KEYS.filter(key => key !== 'FORTUNE').map(key => (
                          <option key={key} value={key}>{ABILITY_NAMES[key]}</option>
                        ))}
                      </select>
                    </div>
                    {monthlyError && <p className="text-red-400 text-sm">{monthlyError}</p>}
                    {monthlySuccessMsg && <p className="text-green-400 text-sm">{monthlySuccessMsg}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddMonthlyTask}
                        disabled={monthlySubmitting}
                        className="flex-1 py-2 bg-theme-primary/20 border border-theme-primary text-theme-primary rounded hover:bg-theme-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {monthlySubmitting ? '审核中...' : '确认添加'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMonthly(false)
                          setMonthlyError('')
                          setMonthlySuccessMsg('')
                        }}
                        className="flex-1 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 任务列表 */}
              {activeMonthlyTasks.length === 0 && !showAddMonthly ? (
                <p className="text-gray-500 text-center py-4">暂无进行中的月度任务</p>
              ) : (
                <div className="space-y-3">
                  {activeMonthlyTasks.map(task => (
                    <div key={task.id} className="bg-space-black/80 rounded-lg p-4 border border-theme-secondary/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white">{task.content}</p>
                          <p className="text-sm text-theme-secondary">
                            {ABILITY_NAMES[task.attribute]} +{task.pointReward}点数
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteMonthlyTask(task.id)}
                            className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition text-sm"
                          >
                            删除
                          </button>
                          <button
                            onClick={() => completeMonthlyTask(task.id)}
                            className="px-4 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition text-sm"
                          >
                            完成
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 已完成任务 */}
              {completedMonthlyTasks.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">已完成 ({completedMonthlyTasks.length}/1)</p>
                  <div className="space-y-2">
                    {completedMonthlyTasks.map(task => (
                      <div key={task.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 opacity-60">
                        <p className="text-gray-400 line-through">{task.content}</p>
                        <p className="text-xs text-gray-500">
                          {ABILITY_NAMES[task.attribute]} +{task.pointReward}点数 ✓
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
