export interface Achievement {
  id: string
  name: string
  english: string
  desc: string
  ability: string
  threshold: number
  unlocked: boolean
  unlocked_at?: string
}

// All achievements organized by ability and threshold
export function GetAllAchievements(): Achievement[] {
  return [
    // INTELLIGENCE
    { id: "INT_001", name: "智慧的火花", english: "Spark of Wisdom", desc: "智慧达到 35", ability: "INTELLIGENCE", threshold: 35, unlocked: false },
    { id: "INT_002", name: "博学者", english: "Scholar", desc: "智慧达到 40", ability: "INTELLIGENCE", threshold: 40, unlocked: false },
    { id: "INT_003", name: "百科全书", english: "Living Encyclopedia", desc: "智慧达到 45", ability: "INTELLIGENCE", threshold: 45, unlocked: false },
    // VITALITY
    { id: "VIT_001", name: "健康的脉搏", english: "Pulse of Vitality", desc: "活力达到 35", ability: "VITALITY", threshold: 35, unlocked: false },
    { id: "VIT_002", name: "活力四射", english: "Energetic Soul", desc: "活力达到 40", ability: "VITALITY", threshold: 40, unlocked: false },
    { id: "VIT_003", name: "不死之身", english: "Immortal Vessel", desc: "活力达到 45", ability: "VITALITY", threshold: 45, unlocked: false },
    // CHARISMA
    { id: "CHA_001", name: "社交达人", english: "Social Butterfly", desc: "魅力达到 35", ability: "CHARISMA", threshold: 35, unlocked: false },
    { id: "CHA_002", name: "人脉王", english: "Network King", desc: "魅力达到 40", ability: "CHARISMA", threshold: 40, unlocked: false },
    { id: "CHA_003", name: "灵魂领袖", english: "Soul Leader", desc: "魅力达到 45", ability: "CHARISMA", threshold: 45, unlocked: false },
    // CREATIVITY
    { id: "CRE_001", name: "创意的火花", english: "Creative Spark", desc: "创造力达到 35", ability: "CREATIVITY", threshold: 35, unlocked: false },
    { id: "CRE_002", name: "创新者", english: "Innovator", desc: "创造力达到 40", ability: "CREATIVITY", threshold: 40, unlocked: false },
    { id: "CRE_003", name: "改变世界", english: "World Changer", desc: "创造力达到 45", ability: "CREATIVITY", threshold: 45, unlocked: false },
    // WEALTH
    { id: "WEA_001", name: "小康", english: "Moderate Living", desc: "财富达到 35", ability: "WEALTH", threshold: 35, unlocked: false },
    { id: "WEA_002", name: "富裕", english: "Affluent", desc: "财富达到 40", ability: "WEALTH", threshold: 40, unlocked: false },
    { id: "WEA_003", name: "亿万富翁", english: "Billionaire", desc: "财富达到 45", ability: "WEALTH", threshold: 45, unlocked: false },
    // WISDOM
    { id: "WIS_001", name: "处世高手", english: "Social Master", desc: "智慧达到 35", ability: "WISDOM", threshold: 35, unlocked: false },
    { id: "WIS_002", name: "人生导师", english: "Life Mentor", desc: "智慧达到 40", ability: "WISDOM", threshold: 40, unlocked: false },
    { id: "WIS_003", name: "圣贤", english: "Sage", desc: "智慧达到 45", ability: "WISDOM", threshold: 45, unlocked: false },
    // FORTUNE
    { id: "FORT_001", name: "幸运儿", english: "Lucky One", desc: "运气达到 35", ability: "FORTUNE", threshold: 35, unlocked: false },
    { id: "FORT_002", name: "命运的宠儿", english: "Fate's Favorite", desc: "运气达到 40", ability: "FORTUNE", threshold: 40, unlocked: false },
    { id: "FORT_003", name: "超越命运", english: "Beyond Destiny", desc: "运气达到 45", ability: "FORTUNE", threshold: 45, unlocked: false },
    // REPUTATION
    { id: "REP_001", name: "崭露头角", english: "Rising Star", desc: "名声达到 35", ability: "REPUTATION", threshold: 35, unlocked: false },
    { id: "REP_002", name: "社会名流", english: "Public Figure", desc: "名声达到 40", ability: "REPUTATION", threshold: 40, unlocked: false },
    { id: "REP_003", name: "传奇人物", english: "Legend", desc: "名声达到 45", ability: "REPUTATION", threshold: 45, unlocked: false },
    // MENTAL
    { id: "MEN_001", name: "心如止水", english: "Calm Mind", desc: "心境达到 35", ability: "MENTAL", threshold: 35, unlocked: false },
    { id: "MEN_002", name: "内在平静", english: "Inner Peace", desc: "心境达到 40", ability: "MENTAL", threshold: 40, unlocked: false },
    { id: "MEN_003", name: "开悟者", english: "Enlightened", desc: "心境达到 45", ability: "MENTAL", threshold: 45, unlocked: false },
    // SPIRIT
    { id: "SPI_001", name: "寻找意义", english: "Seeker of Meaning", desc: "灵魂达到 35", ability: "SPIRIT", threshold: 35, unlocked: false },
    { id: "SPI_002", name: "精神领袖", english: "Spiritual Leader", desc: "灵魂达到 40", ability: "SPIRIT", threshold: 40, unlocked: false },
    { id: "SPI_003", name: "半神", english: "Demigod", desc: "灵魂达到 45", ability: "SPIRIT", threshold: 45, unlocked: false },
  ]
}

// Check for newly unlocked achievements based on current abilities
export function checkAchievements(
  abilities: Record<string, number>,
  achievements: Achievement[]
): { updatedAchievements: Achievement[]; newlyUnlocked: string[] } {
  const updatedAchievements = [...achievements]
  const newlyUnlocked: string[] = []

  for (let i = 0; i < updatedAchievements.length; i++) {
    const achievement = updatedAchievements[i]
    // 迁移：如果已解锁但没有 unlocked_at，补充当前日期
    if (achievement.unlocked) {
      if (!achievement.unlocked_at) {
        updatedAchievements[i] = {
          ...achievement,
          unlocked_at: new Date().toISOString().split('T')[0]
        }
      }
      continue
    }

    const abilityValue = abilities[achievement.ability]
    if (abilityValue !== undefined && abilityValue >= achievement.threshold) {
      updatedAchievements[i] = {
        ...achievement,
        unlocked: true,
        unlocked_at: new Date().toISOString().split('T')[0]
      }
      newlyUnlocked.push(achievement.id)
    }
  }

  return { updatedAchievements, newlyUnlocked }
}

export const ABILITY_KEYS = [
  "INTELLIGENCE", "VITALITY", "CHARISMA", "CREATIVITY",
  "WEALTH", "WISDOM", "FORTUNE", "REPUTATION", "MENTAL", "SPIRIT"
]

export const ABILITY_NAMES: Record<string, string> = {
  "INTELLIGENCE": "智慧",
  "VITALITY": "活力",
  "CHARISMA": "魅力",
  "CREATIVITY": "创造力",
  "WEALTH": "财富",
  "WISDOM": "智慧(处世)",
  "FORTUNE": "运气",
  "REPUTATION": "名声",
  "MENTAL": "心境",
  "SPIRIT": "灵魂"
}