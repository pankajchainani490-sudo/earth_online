import { create } from 'zustand'
import { generateInitialAbilities, evaluateDailyAction, condenseHistory, verifyTask } from '../services/aiService'
import { applyExperienceChanges } from '../utils/exp'
import { getExpThreshold } from '../utils/exp'
import { GetAllAchievements, checkAchievements, ABILITY_KEYS, ABILITY_NAMES, Achievement } from '../utils/achievements'

interface CondensedHistory {
  summary: string
  keyEvents: string[]
  lastUpdated: string
}

interface DailyQuest {
  id: string
  content: string
  attribute: string
  expReward: number
  pointReward: number
  completed: boolean
  date: string // YYYY-MM-DD
}

interface WeeklyTask {
  id: string
  content: string
  attribute: string
  expReward: number
  completed: boolean
  createdAt: string
}

interface MonthlyTask {
  id: string
  content: string
  attribute: string
  pointReward: number
  completed: boolean
  createdAt: string
}

interface Player {
  name: string
  age: number
  createdAt: string
  abilities: Record<string, number>
  experience: Record<string, number>
  abilityLevel: Record<string, number>
  achievements: ReturnType<typeof GetAllAchievements>
  history: DailyRecord[]
  condensedHistory: CondensedHistory
  background?: UserBackground
  lastLuckWheelDate?: string
  // Daily water tracking
  waterDrinks: string[] // ISO timestamps of drinks
  lastDrinkTime?: string
  // Weekly tasks
  weeklyTasks: WeeklyTask[]
  weeklyTasksDueDate?: string
  // Monthly tasks
  monthlyTasks: MonthlyTask[]
  monthlyTasksDueDate?: string
  // Extra monthly task chances earned from achievements
  extraMonthlyTaskChances: number
  // Daily quest
  dailyQuest?: DailyQuest
  dailyQuestResult?: string
}

interface DailyRecord {
  date: string
  action: string
  changes: Record<string, number>
  directChanges: Record<string, number>
  narrative: string
  achievements?: string[]
}

interface UserBackground {
  name: string
  age: string | number
  gender?: string
  education: string
  major: string
  mbti: string
  occupation: string
  careerStage: string
  incomeLevel: number
  physicalHealth: number
  mentalHealth: number
  lifeStyle: string
  extrovert: number
  rational: number
  openness: number
  conscientiousness: number
  familyBackground: number
  parentalSupport: number
  specialSkills: string[]
  specialResources: string[]
  lifeGoals: string
  emotionalExpression?: string
  attachmentStyle?: string
  influentialPerson?: string
  decisionPattern?: string
  pastBelief?: string
  detailOrientation?: string
  lastDayVision?: string
  successDefinition?: string
  sacrificeBottom?: string
  recentLow?: string
  helplessnessSource?: string
  frustrationTendency?: string
  pastView?: string
  futurePlanning?: string
  coreFear?: string
  coreDesire?: string
}

interface DailyResult {
  changes: Record<string, number>
  directChanges: Record<string, number>
  narrative: string
  achievements: string[]
  abilities: Record<string, number>
  experience: Record<string, number>
  abilityLevel: Record<string, number>
  expNeeded: Record<string, number>
}

interface PlayerState {
  player: Player | null
  isLoading: boolean
  loadingMessage: string
  error: string | null

  fetchStatus: () => Promise<void>
  initPlayer: (background: UserBackground) => Promise<void>
  submitDailyAction: (action: string) => Promise<DailyResult | null>
  fetchHistory: () => Promise<DailyRecord[]>
  resetPlayer: () => Promise<void>
  drawLuckWheel: () => Promise<{ value: number; label: string } | null>
  claimAchievementReward: () => Promise<{ success: boolean; message: string; extraChances: number }>

  // Task actions
  drinkWater: () => Promise<{ success: boolean; message: string }>
  canDrinkWater: () => boolean
  addWeeklyTask: (content: string, attribute: string, expReward: number) => Promise<{ success: boolean; message: string; task?: WeeklyTask }>
  completeWeeklyTask: (taskId: string) => Promise<{ success: boolean; message: string }>
  addMonthlyTask: (content: string, attribute: string, pointReward: number) => Promise<{ success: boolean; message: string; task?: MonthlyTask }>
  completeMonthlyTask: (taskId: string) => Promise<{ success: boolean; message: string }>
  reviewTaskWithAI: (content: string, attribute: string, difficulty: string, reward: string, period: 'weekly' | 'monthly') => Promise<{ valid: boolean; reason: string }>
}

const PLAYER_STORAGE_KEY = 'player_data'

// Save player to localStorage
function savePlayer(player: Player): void {
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player))
}

// Load player from localStorage
function loadPlayer(): Player | null {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY)
    if (saved) {
      const player = JSON.parse(saved)
      // Migrate old data: add condensedHistory if missing
      if (!player.condensedHistory) {
        player.condensedHistory = { summary: '', keyEvents: [], lastUpdated: '' }
      }
      // Migrate old data: add lastLuckWheelDate if missing
      if (player.lastLuckWheelDate === undefined) {
        player.lastLuckWheelDate = ''
      }
      // Migrate old data: add water tracking if missing
      if (!player.waterDrinks) {
        player.waterDrinks = []
      }
      // Migrate old data: add weekly tasks if missing
      if (!player.weeklyTasks) {
        player.weeklyTasks = []
      }
      // Migrate old data: add monthly tasks if missing
      if (!player.monthlyTasks) {
        player.monthlyTasks = []
      }
      // Migrate old data: recalculate extraMonthlyTaskChances based on unlocked achievements
      const unlockedCount = (player.achievements || []).filter((a: Achievement) => a.unlocked).length
      const rewardsEarned = Math.floor(unlockedCount / 10)
      if (player.extraMonthlyTaskChances !== rewardsEarned) {
        player.extraMonthlyTaskChances = rewardsEarned
      }
      // Migrate old data: add unlocked_at for achievements that are unlocked but missing it
      if (player.achievements) {
        const today = new Date().toISOString().split('T')[0]
        let needsSave = false
        player.achievements = player.achievements.map((ach: Achievement) => {
          if (ach.unlocked && !ach.unlocked_at) {
            needsSave = true
            return { ...ach, unlocked_at: today }
          }
          return ach
        })
        // Save immediately if migration was needed
        if (needsSave) {
          localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player))
        }
      }
      return player
    }
  } catch {
    // Ignore
  }
  return null
}

// Delete player from localStorage
function deletePlayer(): void {
  localStorage.removeItem(PLAYER_STORAGE_KEY)
}

// Calculate exp needed for each ability level (legacy, kept for compatibility)
function calculateExpNeeded(level: number): number {
  return 100 * Math.pow(level + 1, 1.5)
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  isLoading: false,
  loadingMessage: '',
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const player = loadPlayer()
      if (player) {
        // Re-check achievements on every page load
        const { updatedAchievements } = checkAchievements(player.abilities, player.achievements)
        const unlockedCount = updatedAchievements.filter(a => a.unlocked).length
        const rewardsEarned = Math.floor(unlockedCount / 10)

        // Always update extraMonthlyTaskChances based on current unlocked count
        if (player.extraMonthlyTaskChances !== rewardsEarned) {
          player.extraMonthlyTaskChances = rewardsEarned
        }
        player.achievements = updatedAchievements
        savePlayer(player)
      }
      set({ player, isLoading: false })
    } catch {
      set({ player: null, isLoading: false })
    }
  },

  initPlayer: async (background: UserBackground) => {
    set({ isLoading: true, loadingMessage: '', error: null })
    try {
      const age = typeof background.age === 'number' ? background.age : parseInt(String(background.age)) || 25

      const abilities = await generateInitialAbilities(background, (stage) => {
        set({ loadingMessage: stage })
      })

      // Initialize experience and level maps
      const experience: Record<string, number> = {}
      const abilityLevel: Record<string, number> = {}
      for (const key of ABILITY_KEYS) {
        experience[key] = 0
        abilityLevel[key] = 1
      }

      const player: Player = {
        name: background.name,
        age,
        createdAt: new Date().toISOString().split('T')[0],
        abilities,
        experience,
        abilityLevel,
        achievements: GetAllAchievements(),
        history: [],
        condensedHistory: { summary: '', keyEvents: [], lastUpdated: '' },
        background,
        extraMonthlyTaskChances: 0,
      }

      savePlayer(player)
      set({ player, isLoading: false, loadingMessage: '' })
    } catch (err) {
      set({ error: `AI error: ${err}`, isLoading: false, loadingMessage: '' })
    }
  },

  submitDailyAction: async (action: string) => {
    const currentPlayer = get().player
    if (!currentPlayer) {
      set({ error: 'No player found' })
      return null
    }

    // 检查今日是否已提交行动
    const today = new Date().toISOString().split('T')[0]
    const lastAction = currentPlayer.history[currentPlayer.history.length - 1]
    if (lastAction && lastAction.date === today) {
      set({ error: '今日已提交行动' })
      return null
    }

    set({ isLoading: true, error: null })
    try {
      const newHistory = [
        ...currentPlayer.history,
        {
          date: new Date().toISOString().split('T')[0],
          action,
          changes: {} as Record<string, number>,
          narrative: '',
          achievements: [] as string[],
        },
      ]

      const result = await evaluateDailyAction(
        {
          abilities: currentPlayer.abilities,
          experience: currentPlayer.experience,
          abilityLevel: currentPlayer.abilityLevel,
          background: currentPlayer.background,
        },
        action,
        currentPlayer.condensedHistory,
        (stage) => set({ loadingMessage: stage })
      )

      // Apply experience changes
      const { updatedAbilities, updatedExperience, updatedLevel, changes } = applyExperienceChanges(
        currentPlayer.abilities,
        currentPlayer.experience,
        currentPlayer.abilityLevel,
        result.changes
      )

      // Apply direct changes (重大变故 - 直接操作能力点数)
      let finalAbilities = { ...updatedAbilities }
      let finalLevel = { ...updatedLevel }
      if (result.directChanges && Object.keys(result.directChanges).length > 0) {
        for (const [key, delta] of Object.entries(result.directChanges)) {
          if (ABILITY_KEYS.includes(key)) {
            const currentVal = finalAbilities[key] || 0
            const newVal = Math.max(0, Math.min(50, currentVal + delta))
            finalAbilities[key] = newVal
            // 重新计算等级：点数变化后，等级可能需要调整
            // 如果点数减少导致降级，调整等级
            if (delta < 0) {
              const expThreshold = getExpThreshold(newVal)
              // 简单处理：直接根据新点数重算等级
              // 1级=0-9, 2级=10-19, 3级=20-29, 4级=30-34, 5级=35-39, 6级=40-44, 7级=45-50
              let newLevel = 1
              if (newVal >= 45) newLevel = 7
              else if (newVal >= 40) newLevel = 6
              else if (newVal >= 35) newLevel = 5
              else if (newVal >= 30) newLevel = 4
              else if (newVal >= 20) newLevel = 3
              else if (newVal >= 10) newLevel = 2
              finalLevel[key] = newLevel
            }
          }
        }
      }

      // Check achievements
      const { updatedAchievements, newlyUnlocked } = checkAchievements(finalAbilities, currentPlayer.achievements)

      // Build exp needed map
      const expNeeded: Record<string, number> = {}
      for (const key of ABILITY_KEYS) {
        expNeeded[key] = getExpThreshold(finalAbilities[key] || 0)
      }

      // Update history with actual result data
      const finalHistory = newHistory.map((record, idx) =>
        idx === newHistory.length - 1
          ? { ...record, changes: result.changes, directChanges: result.directChanges || {}, narrative: result.narrative, achievements: newlyUnlocked }
          : record
      )

      // Update condensed history (every 5 actions)
      let condensedHistory = currentPlayer.condensedHistory
      if (finalHistory.length % 5 === 0) {
        condensedHistory = await condenseHistory(finalHistory, (stage) => set({ loadingMessage: stage }))
      }

      // Update player
      const updatedPlayer: Player = {
        ...currentPlayer,
        abilities: finalAbilities,
        experience: updatedExperience,
        abilityLevel: finalLevel,
        achievements: updatedAchievements,
        history: finalHistory,
        condensedHistory,
      }

      savePlayer(updatedPlayer)
      set({ player: updatedPlayer, isLoading: false, loadingMessage: '' })

      return {
        changes: result.changes,
        directChanges: result.directChanges || {},
        narrative: result.narrative,
        achievements: newlyUnlocked,
        abilities: finalAbilities,
        experience: updatedExperience,
        abilityLevel: finalLevel,
        expNeeded,
      }
    } catch (err) {
      set({ error: `AI error: ${err}`, isLoading: false })
      return null
    }
  },

  fetchHistory: async () => {
    const player = get().player
    return player?.history || []
  },

  resetPlayer: async () => {
    deletePlayer()
    set({ player: null, error: null })
  },

  drawLuckWheel: async () => {
    const currentPlayer = get().player
    if (!currentPlayer) {
      set({ error: 'No player found' })
      return null
    }

    const today = new Date().toISOString().split('T')[0]
    if (currentPlayer.lastLuckWheelDate === today) {
      set({ error: '今日已抽奖' })
      return null
    }

    const WHEEL_SEGMENTS = [
      { value: -50, label: '-50', color: '#ff4444' },
      { value: -25, label: '-25', color: '#ff8844' },
      { value: -10, label: '-10', color: '#ffaa44' },
      { value: 0, label: '谢谢参与', color: '#888888' },
      { value: 10, label: '+10', color: '#44ff88' },
      { value: 25, label: '+25', color: '#44aaff' },
      { value: 50, label: '+50', color: '#ffd700' },
    ]

    // 随机选择结果
    const result = WHEEL_SEGMENTS[Math.floor(Math.random() * WHEEL_SEGMENTS.length)]

    // 更新玩家运气经验值
    const fortuneKey = 'FORTUNE'
    const currentFortuneExp = currentPlayer.experience[fortuneKey] || 0
    const currentFortuneAbility = currentPlayer.abilities[fortuneKey] || 0
    const currentFortuneLevel = currentPlayer.abilityLevel[fortuneKey] || 1

    // 计算新经验值
    let newExp = currentFortuneExp + result.value
    let newAbility = currentFortuneAbility
    let newLevel = currentFortuneLevel

    // 如果经验值为负，触发降级逻辑
    if (newExp < 0) {
      newAbility -= 1
      newLevel = Math.max(1, newLevel - 1)
      // 计算上一能力范围的最大经验值
      let maxPrevExp
      if (newAbility < 20) maxPrevExp = 49
      else if (newAbility < 30) maxPrevExp = 99
      else if (newAbility < 35) maxPrevExp = 199
      else if (newAbility < 40) maxPrevExp = 299
      else if (newAbility < 45) maxPrevExp = 499
      else maxPrevExp = 999

      newExp = maxPrevExp + newExp
      if (newExp < 0) newExp = 0
    }

    const updatedPlayer: Player = {
      ...currentPlayer,
      abilities: {
        ...currentPlayer.abilities,
        [fortuneKey]: newAbility,
      },
      experience: {
        ...currentPlayer.experience,
        [fortuneKey]: newExp,
      },
      abilityLevel: {
        ...currentPlayer.abilityLevel,
        [fortuneKey]: newLevel,
      },
      achievements: currentPlayer.achievements,
      lastLuckWheelDate: today,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { value: result.value, label: result.label }
  },

  claimAchievementReward: async () => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据', extraChances: 0 }

    const unlockedCount = player.achievements.filter(a => a.unlocked).length
    const rewardsEarned = Math.floor(unlockedCount / 10)

    if (rewardsEarned <= player.extraMonthlyTaskChances) {
      return { success: false, message: '还差更多成就才能领取奖励', extraChances: player.extraMonthlyTaskChances }
    }

    const updatedPlayer: Player = {
      ...player,
      extraMonthlyTaskChances: player.extraMonthlyTaskChances + 1,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: '领取成功！获得1次创建每月任务的机会', extraChances: updatedPlayer.extraMonthlyTaskChances }
  },

  getDailyQuest: () => {
    const player = get().player
    if (!player) return null

    const today = new Date().toISOString().split('T')[0]

    // Check if quest exists and is from today
    if (player.dailyQuest && player.dailyQuest.date === today) {
      return player.dailyQuest
    }

    // Generate new quest
    const questTemplates = [
      { content: '以父之名：让另一个人叫你爸爸', attribute: 'REPUTATION', expReward: 0, pointReward: -1 },
      { content: '礼貌的问候：向另一个人分享音乐 F**k You - CeeLo Green', attribute: 'SPIRIT', expReward: 20, pointReward: 0 },
      { content: '女神的眷顾：站在一颗树下等待鸟*的降落', attribute: 'MENTAL', expReward: 20, pointReward: 0 },
      { content: '拙劣的马奎：欺骗另一个人', attribute: 'WISDOM', expReward: 0, pointReward: -5 },
      { content: '善意的谎言：竞选美国总统', attribute: 'CREATIVITY', expReward: 1, pointReward: 0 },
      { content: '简单的任务：刷视频 1 小时', attribute: 'INTELLIGENCE', expReward: -20, pointReward: 0 },
      { content: '爱干净的宝宝：进行一次沐浴', attribute: 'CHARISMA', expReward: 10, pointReward: 0 },
    ]

    const template = questTemplates[Math.floor(Math.random() * questTemplates.length)]
    const newQuest: DailyQuest = {
      id: `daily_${Date.now()}`,
      ...template,
      completed: false,
      date: today,
    }

    const updatedPlayer: Player = {
      ...player,
      dailyQuest: newQuest,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return newQuest
  },

  completeDailyQuest: () => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const today = new Date().toISOString().split('T')[0]
    const quest = player.dailyQuest

    if (!quest || quest.date !== today) {
      return { success: false, message: '今日悬赏不存在' }
    }

    if (quest.completed) {
      return { success: false, message: '悬赏已完成' }
    }

    // Apply rewards/penalties
    let updatedPlayer = { ...player }
    let actualExpChange = 0
    let actualPointChange = 0
    let levelChange = 0

    if (quest.expReward !== 0) {
      const oldExp = player.experience[quest.attribute] || 0
      const oldLevel = player.abilityLevel[quest.attribute] || 1

      const result = applyExperienceChanges(
        player.abilities,
        player.experience,
        player.abilityLevel,
        { [quest.attribute]: quest.expReward }
      )

      actualExpChange = result.changes[quest.attribute]
      levelChange = result.updatedLevel[quest.attribute] - oldLevel

      updatedPlayer = {
        ...updatedPlayer,
        abilities: result.updatedAbilities,
        experience: result.updatedExperience,
        abilityLevel: result.updatedLevel,
      }
    }

    if (quest.pointReward !== 0) {
      const currentAbility = updatedPlayer.abilities[quest.attribute] || 0
      const newAbility = Math.max(0, Math.min(50, currentAbility + quest.pointReward))
      actualPointChange = quest.pointReward
      updatedPlayer = {
        ...updatedPlayer,
        abilities: {
          ...updatedPlayer.abilities,
          [quest.attribute]: newAbility,
        },
      }
    }

    // Mark quest as completed
    // Build result message based on actual changes
    const attrName = ABILITY_NAMES[quest.attribute] || quest.attribute
    let resultMsg = `悬赏完成！${quest.content}\n`

    if (actualPointChange !== 0) {
      resultMsg += `${attrName} ${actualPointChange > 0 ? '+' : ''}${actualPointChange}点`
    } else if (actualExpChange !== 0) {
      resultMsg += `${attrName}经验 ${actualExpChange > 0 ? '+' : ''}${actualExpChange}`
      if (levelChange !== 0) {
        resultMsg += ` (${levelChange > 0 ? '升级' : '降级'})`
      }
    }

    updatedPlayer = {
      ...updatedPlayer,
      dailyQuest: { ...quest, completed: true },
      dailyQuestResult: resultMsg,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: resultMsg }
  },

  canDrinkWater: () => {
    const player = get().player
    if (!player) return false

    // Reset if new day
    const today = new Date().toISOString().split('T')[0]
    if (player.waterDrinks.length > 0) {
      const lastDrink = player.waterDrinks[player.waterDrinks.length - 1]
      if (!lastDrink.startsWith(today)) {
        return true // New day, reset
      }
    }

    // Check if less than 6 drinks today
    if (!player.waterDrinks) return true
    const todayDrinks = player.waterDrinks.filter(d => d.startsWith(today))
    if (todayDrinks.length >= 6) return false

    // Check 1 hour cooldown
    if (player.lastDrinkTime) {
      const lastDrinkDate = new Date(player.lastDrinkTime)
      const now = new Date()
      const diffMs = now.getTime() - lastDrinkDate.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < 1) return false
    }

    return true
  },

  drinkWater: async () => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    // Get today's drinks
    let todayDrinks = player.waterDrinks ? player.waterDrinks.filter(d => d.startsWith(today)) : []

    // Check if already 6 drinks
    if (todayDrinks.length >= 6) {
      return { success: false, message: '今日饮水已达上限' }
    }

    // Check 1 hour cooldown
    if (player.lastDrinkTime) {
      const lastDrinkDate = new Date(player.lastDrinkTime)
      const nowDate = new Date()
      const diffMs = nowDate.getTime() - lastDrinkDate.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < 1) {
        return { success: false, message: '饮水冷却中，请稍后再试' }
      }
    }

    // Add drink
    const newDrinks = [...(player.waterDrinks || []), now]
    const isCompleted = todayDrinks.length + 1 >= 6

    let updatedPlayer: Player = {
      ...player,
      waterDrinks: newDrinks,
      lastDrinkTime: now,
    }

    // If completed all 6, give VITALITY +10 exp
    if (isCompleted) {
      const vitalityKey = 'VITALITY'
      const currentExp = player.experience[vitalityKey] || 0
      const { updatedAbilities, updatedExperience, updatedLevel } = applyExperienceChanges(
        player.abilities,
        player.experience,
        player.abilityLevel,
        { [vitalityKey]: 10 }
      )
      updatedPlayer = {
        ...updatedPlayer,
        abilities: updatedAbilities,
        experience: updatedExperience,
        abilityLevel: updatedLevel,
      }
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return {
      success: true,
      message: isCompleted ? '完成饮水任务！活力经验 +10' : `饮水成功 (${todayDrinks.length + 1}/6)`
    }
  },

  reviewTaskWithAI: async (content: string, attribute: string, difficulty: string, reward: string, period: 'weekly' | 'monthly') => {
    const player = get().player
    if (!player) return { valid: false, reason: '无玩家数据' }

    // Simple AI review - in production this would call the AI service
    // For now, we'll do basic validation
    const bg = player.background
    if (!bg) return { valid: false, reason: '无玩家背景数据' }

    const userLevel = player.abilityLevel[attribute] || 1
    const userAbility = player.abilities[attribute] || 0

    // Basic validation
    if (!content || content.trim().length < 5) {
      return { valid: false, reason: '任务内容太短' }
    }
    if (!attribute || !ABILITY_KEYS.includes(attribute)) {
      return { valid: false, reason: '无效的属性' }
    }

    const expReward = parseInt(reward) || (period === 'weekly' ? 25 : 50)
    const pointReward = period === 'monthly' ? parseInt(reward) || 1 : 0

    // For monthly tasks, validate high difficulty
    if (period === 'monthly') {
      // Monthly tasks should be challenging for the user's level
      if (expReward > 0 || pointReward < 1) {
        return { valid: false, reason: '月度任务奖励必须是1点属性点数' }
      }
    }

    return { valid: true, reason: '任务合理' }
  },

  addWeeklyTask: async (content: string, attribute: string, expReward: number) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    // Check if weekly tasks expired and need reset
    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    endOfWeek.setHours(23, 59, 59, 999)
    const dueDateStr = endOfWeek.toISOString()

    let weeklyTasks = player.weeklyTasks || []
    let weeklyTasksDueDate = player.weeklyTasksDueDate

    // Check if need to reset weekly tasks
    if (!weeklyTasksDueDate || new Date(weeklyTasksDueDate) < now) {
      weeklyTasks = []
      weeklyTasksDueDate = dueDateStr
    }

    // Count all tasks (completed + uncompleted) - max 5
    const totalTasks = weeklyTasks.length
    if (totalTasks >= 5) {
      return { success: false, message: '周度任务已达上限(5个)' }
    }

    // AI verification
    const verification = await verifyTask(content, attribute, player.abilities, false)
    if (!verification.approved) {
      return { success: false, message: `任务审核未通过：${verification.reason}` }
    }

    // Create new task with fixed 25 exp reward
    const newTask: WeeklyTask = {
      id: `weekly_${Date.now()}`,
      content,
      attribute,
      expReward: 25, // Fixed reward
      completed: false,
      createdAt: now.toISOString(),
    }

    const updatedPlayer: Player = {
      ...player,
      weeklyTasks: [...weeklyTasks, newTask],
      weeklyTasksDueDate,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: '周度任务添加成功', task: newTask }
  },

  cleanupExpiredTasks: () => {
    const player = get().player
    if (!player) return

    const now = new Date()
    let changed = false
    let updatedPlayer = { ...player }

    // Check weekly tasks
    if (player.weeklyTasksDueDate && new Date(player.weeklyTasksDueDate) < now) {
      updatedPlayer.weeklyTasks = []
      updatedPlayer.weeklyTasksDueDate = undefined
      changed = true
    }

    // Check monthly tasks
    if (player.monthlyTasksDueDate && new Date(player.monthlyTasksDueDate) < now) {
      updatedPlayer.monthlyTasks = []
      updatedPlayer.monthlyTasksDueDate = undefined
      changed = true
    }

    if (changed) {
      savePlayer(updatedPlayer)
      set({ player: updatedPlayer })
    }
  },

  completeWeeklyTask: async (taskId: string) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const task = player.weeklyTasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.completed) return { success: false, message: '任务已完成' }

    // Apply experience reward
    const { updatedAbilities, updatedExperience, updatedLevel } = applyExperienceChanges(
      player.abilities,
      player.experience,
      player.abilityLevel,
      { [task.attribute]: task.expReward }
    )

    const updatedTasks = player.weeklyTasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    )

    const updatedPlayer: Player = {
      ...player,
      abilities: updatedAbilities,
      experience: updatedExperience,
      abilityLevel: updatedLevel,
      weeklyTasks: updatedTasks,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: `任务完成！${task.attribute}经验 +${task.expReward}` }
  },

  deleteWeeklyTask: (taskId: string) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const task = player.weeklyTasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.completed) return { success: false, message: '已完成的任务无法删除' }

    const updatedTasks = player.weeklyTasks.filter(t => t.id !== taskId)

    const updatedPlayer: Player = {
      ...player,
      weeklyTasks: updatedTasks,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: '任务已删除' }
  },

  deleteMonthlyTask: (taskId: string) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const task = player.monthlyTasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.completed) return { success: false, message: '已完成的任务无法删除' }

    const updatedTasks = player.monthlyTasks.filter(t => t.id !== taskId)

    const updatedPlayer: Player = {
      ...player,
      monthlyTasks: updatedTasks,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: '任务已删除' }
  },

  addMonthlyTask: async (content: string, attribute: string, pointReward: number) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    // Check if monthly tasks expired and need reset
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    const dueDateStr = endOfMonth.toISOString()

    let monthlyTasks = player.monthlyTasks || []
    let monthlyTasksDueDate = player.monthlyTasksDueDate

    // Check if need to reset monthly tasks
    if (!monthlyTasksDueDate || new Date(monthlyTasksDueDate) < now) {
      monthlyTasks = []
      monthlyTasksDueDate = dueDateStr
    }

    // Count all tasks (completed + uncompleted) - max 1 + extra chances
    const totalTasks = monthlyTasks.length
    const maxTasks = 1 + player.extraMonthlyTaskChances
    if (totalTasks >= maxTasks) {
      return { success: false, message: `本月任务已达上限(${maxTasks}个)` }
    }

    // AI verification for monthly task
    const verification = await verifyTask(content, attribute, player.abilities, true)
    if (!verification.approved) {
      return { success: false, message: `任务审核未通过：${verification.reason}` }
    }

    // Create new task with fixed 1 point reward
    const newTask: MonthlyTask = {
      id: `monthly_${Date.now()}`,
      content,
      attribute,
      pointReward: 1, // Fixed reward
      completed: false,
      createdAt: now.toISOString(),
    }

    const updatedPlayer: Player = {
      ...player,
      monthlyTasks: [...monthlyTasks, newTask],
      monthlyTasksDueDate,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: '月度任务添加成功', task: newTask }
  },

  completeMonthlyTask: async (taskId: string) => {
    const player = get().player
    if (!player) return { success: false, message: '无玩家数据' }

    const task = player.monthlyTasks.find(t => t.id === taskId)
    if (!task) return { success: false, message: '任务不存在' }
    if (task.completed) return { success: false, message: '任务已完成' }

    // Apply point reward directly to ability
    const currentAbility = player.abilities[task.attribute] || 0
    const newAbility = Math.min(50, currentAbility + task.pointReward)

    const updatedTasks = player.monthlyTasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    )

    const updatedPlayer: Player = {
      ...player,
      abilities: {
        ...player.abilities,
        [task.attribute]: newAbility,
      },
      monthlyTasks: updatedTasks,
    }

    savePlayer(updatedPlayer)
    set({ player: updatedPlayer })

    return { success: true, message: `任务完成！${task.attribute} +${task.pointReward}` }
  },
}))