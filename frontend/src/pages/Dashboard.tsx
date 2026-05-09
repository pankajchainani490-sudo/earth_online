import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { usePlayerStore } from '../store/playerStore'
import { useThemeStore, THEMES, THEME_UNLOCK_LEVELS, ThemeName } from '../store/themeStore'
import { getExpThreshold } from '../utils/exp'

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

// 等级配置 - 低等级覆盖更多点位，高等级要求更高
const GRADE_CONFIG = [
  { grade: 'S', minScore: 350, color: '#ff0080', shadowColor: '#ff0080', glow: '0 0 30px #ff0080, 0 0 60px #ff0080, 0 0 90px #ff0080' },
  { grade: 'A+', minScore: 330, color: '#ffd700', shadowColor: '#ffd700', glow: '0 0 20px #ffd700, 0 0 40px #ffd700' },
  { grade: 'A', minScore: 300, color: '#ff6b00', shadowColor: '#ff6b00', glow: '0 0 20px #ff6b00, 0 0 40px #ff6b00' },
  { grade: 'B+', minScore: 250, color: '#00ff88', shadowColor: '#00ff88', glow: '0 0 15px #00ff88' },
  { grade: 'B', minScore: 215, color: '#00d4ff', shadowColor: '#00d4ff', glow: '0 0 10px #00d4ff' },
  { grade: 'C', minScore: 180, color: '#7b68ee', shadowColor: '#7b68ee', glow: '0 0 8px #7b68ee' },
  { grade: 'D', minScore: 120, color: '#9370db', shadowColor: '#9370db', glow: '0 0 6px #9370db' },
  { grade: 'E', minScore: 80, color: '#708090', shadowColor: '#708090', glow: '0 0 4px #708090' },
  { grade: 'F', minScore: 0, color: '#555555', shadowColor: '#555555', glow: '0 0 3px #555555' },
]

function getGradeInfo(totalScore: number) {
  return GRADE_CONFIG.find(g => totalScore >= g.minScore) || GRADE_CONFIG[GRADE_CONFIG.length - 1]
}

function calculateTotalScore(abilities: Record<string, number>) {
  return abilityKeys.reduce((sum, key) => sum + (abilities[key] || 0), 0)
}

// Ω CLASS 等级组件
function OmegaGrade({ totalScore, currentGradeInfo }: { totalScore: number; currentGradeInfo: typeof GRADE_CONFIG[0] }) {
  const currentTheme = useThemeStore(s => s.currentTheme)
  const setTheme = useThemeStore(s => s.setTheme)
  const theme = THEMES[currentTheme]
  const primaryColor = theme.primary
  const secondaryColor = theme.secondary
  const [showDetails, setShowDetails] = useState(false)
  const maxGrade = GRADE_CONFIG.length - 1
  const gradeIndex = GRADE_CONFIG.findIndex(g => g.grade === currentGradeInfo.grade)
  const progressPercent = (gradeIndex / maxGrade) * 100

  const gradeDescriptions: Record<string, string> = {
    S: '超越极限的神级存在',
    'A+': '卓越非凡，千里挑一',
    A: '优秀出众',
    'B+': '良好优秀',
    B: '中上水平',
    C: '普通等级',
    D: '较低等级',
    E: '基础等级',
    F: '最低等级',
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative flex flex-col items-center justify-center cursor-pointer"
        style={{ width: 140, height: 140 }}
        onClick={() => setShowDetails(true)}
      >
        {/* 装饰性圆环 */}
        <div className="absolute rounded-full border border-white/10" style={{ width: 140, height: 140 }} />
        <div className="absolute rounded-full border border-white/5" style={{ width: 120, height: 120, top: 10, left: 10 }} />

        {/* 进度环 */}
        <svg className="absolute" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="#1a1a2e" strokeWidth="5" />
          <motion.circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={currentGradeInfo.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="377"
            initial={{ strokeDashoffset: 377 }}
            animate={{ strokeDashoffset: 377 - (377 * progressPercent / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${currentGradeInfo.color})` }}
          />
        </svg>

        {/* 中心内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* 等级字母 */}
          <motion.span
            style={{
              fontSize: currentGradeInfo.grade === 'S' ? '42px' : currentGradeInfo.grade.includes('+') ? '38px' : '36px',
              color: currentGradeInfo.color,
              textShadow: currentGradeInfo.glow,
              lineHeight: 1,
            }}
            animate={{
              scale: [1, 1.03, 1],
              filter: [
                `drop-shadow(${currentGradeInfo.shadowColor} 0 0 6px)`,
                `drop-shadow(${currentGradeInfo.shadowColor} 0 0 15px)`,
                `drop-shadow(${currentGradeInfo.shadowColor} 0 0 6px)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {currentGradeInfo.grade}
          </motion.span>

          {/* 底部标签 */}
          <div className="flex flex-col items-center mt-1">
            <span className="font-orbitron text-[9px] tracking-wider" style={{ color: currentGradeInfo.color, textShadow: `0 0 8px ${currentGradeInfo.color}` }}>
              Ω CLASS
            </span>
            <span className="text-[10px] text-gray-500">
              {totalScore}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 等级详情弹窗 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="neon-border rounded-lg p-6 max-w-md w-full"
              style={{ backgroundColor: 'var(--theme-bg)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-theme-primary font-orbitron text-lg">Ω CLASS 评级细则</h3>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>

              <div className="space-y-2">
                {GRADE_CONFIG.map((grade, idx) => {
                  const isCurrent = grade.grade === currentGradeInfo.grade
                  const nextGrade = GRADE_CONFIG[idx - 1]
                  // Find corresponding theme for this grade (reversed order: B at top, S at bottom)
                  const gradeToTheme: Record<string, ThemeName> = {
                    'S': 'B',     // 俱往矣 at bottom
                    'A+': 'B+',   // 朝歌耳畔时时渐
                    'A': 'A+',    // 红彩早春怡
                    'B+': 'A',    // 斧人行月
                    'B': 'S',     // 温沃和时长 at top
                  }
                  const themeId = gradeToTheme[grade.grade] || 'default'
                  const theme = THEMES[themeId]

                  // Unlock logic: based on player's Ω CLASS grade
                  // GRADE_CONFIG indices: 0=S, 1=A+, 2=A, 3=B+, 4=B, 5=C, 6=D, 7=E, 8=F
                  // Lower index = higher grade. If player is at A+ (gradeIndex=1), they unlock all themes with requiredIndex >= 1 (A+, A, B+, B)
                  const gradeToUnlockIndex: Record<string, number> = {
                    'S': 0,    // index 0 - highest grade
                    'A+': 1,   // index 1
                    'A': 2,    // index 2
                    'B+': 3,   // index 3
                    'B': 4,    // index 4 - lowest grade among theme holders
                  }
                  const requiredIndex = gradeToUnlockIndex[grade.grade] ?? 99
                  const isUnlocked = gradeIndex <= requiredIndex

                  return (
                    <div
                      key={grade.grade}
                      className={`p-3 rounded border ${isCurrent ? 'border-theme-primary bg-theme-primary/10' : 'border-gray-800 bg-gray-900/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-orbitron font-bold text-lg"
                          style={{ color: grade.color, textShadow: grade.glow }}
                        >
                          {grade.grade}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-gray-300">{gradeDescriptions[grade.grade]}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {idx === 0 ? `${grade.minScore}+` : `${grade.minScore} - ${nextGrade ? nextGrade.minScore - 1 : grade.minScore}`} 点
                          </div>
                        </div>
                        {isCurrent && <span className="text-theme-primary text-sm">当前</span>}
                        {themeId !== 'default' && (
                          <button
                            disabled={!isUnlocked}
                            onClick={() => {
                              if (!isUnlocked) return
                              // Click same theme again to switch back to default
                              if (currentTheme === themeId) {
                                setTheme('default')
                              } else {
                                setTheme(themeId)
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border-2 ${
                              isUnlocked ? '' : 'text-gray-600 cursor-not-allowed'
                            } ${currentTheme === themeId ? 'ring-2 ring-white/50' : ''}`}
                            style={isUnlocked ? {
                              color: currentTheme === themeId ? theme.secondary : '#333',
                              backgroundColor: currentTheme === themeId ? theme.primary : '#ccc',
                              borderColor: currentTheme === themeId ? theme.primary : '#666',
                            } : {
                              color: '#666',
                              backgroundColor: '#333',
                              borderColor: '#555',
                            }}
                            title={isUnlocked ? theme.name : `需要达到 ${grade.grade} 级`}
                          >
                            {theme.name}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                总评分 = 10项能力值之和 (满分500)
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ExperienceBar({ ability, exp, abilityValue, primaryColor, secondaryColor }: {
  ability: string
  exp: number
  abilityValue: number
  primaryColor: string
  secondaryColor: string
}) {
  const expNeeded = getExpThreshold(abilityValue)
  const percentage = Math.min((exp / expNeeded) * 100, 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{abilityNames[ability]}</span>
        <span className="text-gray-400">{Math.round(abilityValue)}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500" style={{
          width: `${percentage}%`,
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
        }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{exp.toFixed(0)} / {expNeeded} 经验</div>
    </div>
  )
}

export default function Dashboard() {
  const { player } = usePlayerStore()
  const currentTheme = useThemeStore(s => s.currentTheme)
  const theme = THEMES[currentTheme]
  const primaryColor = theme.primary
  const secondaryColor = theme.secondary

  if (!player) return null

  const chartData = abilityKeys.map(key => ({
    ability: abilityNames[key],
    value: player.abilities[key] || 0,
    fullMark: 50,
  }))

  const totalScore = calculateTotalScore(player.abilities)
  const gradeInfo = getGradeInfo(totalScore)

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">能力值</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">游戏天数: {player.history.length + 1}</span>
          <span className="font-orbitron" style={{ color: secondaryColor, textShadow: `0 0 10px ${secondaryColor}` }}>Ω {gradeInfo.grade}</span>
        </div>
      </div>

      {/* Content Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-theme-card neon-border rounded-lg p-6"
      >
        {/* Omega Grade + Radar Chart Row */}
        <div className="flex flex-col items-center mb-6">
          <OmegaGrade totalScore={totalScore} currentGradeInfo={gradeInfo} />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={chartData}>
            <PolarGrid stroke={primaryColor} strokeOpacity={0.3} />
            <PolarAngleAxis dataKey="ability" stroke={primaryColor} tick={{ fill: primaryColor, fontSize: 12 }} />
            <PolarRadiusAxis stroke={primaryColor} strokeOpacity={0.3} domain={[0, 50]} tick={{ fill: primaryColor }} />
            <Radar
              name={player.name}
              dataKey="value"
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Ability Values */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm mb-6">
          {abilityKeys.map(key => (
            <div key={key} className="flex justify-between text-gray-400">
              <span>{abilityNames[key]}:</span>
              <span style={{ color: primaryColor }}>{Math.round(player.abilities[key] || 0)}</span>
            </div>
          ))}
        </div>

        {/* Experience Bars */}
        <h3 className="text-gray-400 text-sm mb-3">经验值</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abilityKeys.map(key => (
            <ExperienceBar
              key={key}
              ability={key}
              exp={player.experience?.[key] || 0}
              abilityValue={player.abilities[key] || 0}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}