import { useConfigStore } from '../store/configStore'
import { ABILITY_KEYS } from '../utils/achievements'

// AI Provider types
type Message = { role: 'user' | 'assistant'; content: string }

interface PersonalityProfile {
  traits: string[]
  contradictions: string[]
  strengths: string[]
  weaknesses: string[]
}

interface AbilityScores {
  rawScores: Record<string, number>
  adjustedScores: Record<string, number>
}

interface FinalResult {
  abilities: Record<string, number>
  lifeTheme: string
  openingNarrative: string
  potentialPaths: string[]
}

interface DailyEvalResponse {
  analysis: string
  changes: Record<string, number>         // 经验变化（普通行动）
  directChanges: Record<string, number>    // 直接点数变化（重大变故）
  narrative: string
}

interface CondensedHistory {
  summary: string
  keyEvents: string[]
  lastUpdated: string
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

// Helper to call AI API
async function callAI(messages: Message[]): Promise<string> {
  const config = useConfigStore.getState().config
  if (!config?.apiKey) {
    throw new Error('AI not configured')
  }

  const { apiKey, model, baseUrl, provider } = config

  let url = baseUrl
  let body: Record<string, unknown>
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (provider === 'claude') {
    if (!url) url = 'https://api.anthropic.com/v1/messages'
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
    body = { model, max_tokens: 1024, messages }
  } else if (provider === 'minimax') {
    url = 'https://api.minimax.chat/v1/text/chatcompletion_v2'
    headers['Authorization'] = `Bearer ${apiKey}`
    body = { model, messages, temperature: 0.7 }
  } else {
    // OpenAI
    if (!url) url = 'https://api.openai.com/v1/chat/completions'
    headers['Authorization'] = `Bearer ${apiKey}`
    body = { model, messages, temperature: 0.7 }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()

  // Extract content based on provider
  if (provider === 'claude') {
    const content = result.content?.[0]?.text
    if (!content) throw new Error('No content in Claude response')
    return content
  } else if (provider === 'minimax') {
    const choice = result.choices?.[0]
    if (!choice) throw new Error('No choices in MiniMax response')
    return (choice.delta?.content || choice.message?.content || '')
  } else {
    return result.choices?.[0]?.message?.content || ''
  }
}

// Parse JSON from response, finding first JSON block
function parseJSON<T>(response: string): T {
  let start = response.indexOf('{')
  let end = response.lastIndexOf('}')

  if (start === -1 || end === -1) {
    throw new Error('No JSON found in response')
  }

  const jsonStr = response.substring(start, end + 1)
  return JSON.parse(jsonStr) as T
}

// Stage 1: Personality Profiling
async function stage1PersonalityProfiling(bg: UserBackground, age: number): Promise<PersonalityProfile> {
  const messages: Message[] = [{
    role: 'user',
    content: `你是人生评估专家。根据用户信息输出JSON：

用户：${bg.name}，${age}岁，${bg.gender || ''}，${bg.education}，${bg.major}专业，${bg.occupation}职业，MBTI=${bg.mbti}

问卷：${bg.lifeGoals}

开放问题：情感表达=${bg.emotionalExpression || ''}，依恋类型=${bg.attachmentStyle || ''}，影响最大的人=${bg.influentialPerson || ''}，决策=${bg.decisionPattern || ''}，错误信念=${bg.pastBelief || ''}
最后一天=${bg.lastDayVision || ''}，成功定义=${bg.successDefinition || ''}，低谷=${bg.recentLow || ''}，无力感=${bg.helplessnessSource || ''}，核心恐惧=${bg.coreFear || ''}，核心渴望=${bg.coreDesire || ''}

输出JSON（仅JSON不要其他）：
{"traits":["特质1","特质2"],"contradictions":["矛盾1"],"strengths":["优势1"],"weaknesses":["短板1"]}`
  }]

  const response = await callAI(messages)
  try {
    const result = parseJSON<PersonalityProfile>(response)
    // Validate structure
    if (!result.traits || !Array.isArray(result.traits)) {
      throw new Error('Invalid traits structure')
    }
    return result
  } catch {
    // Fallback
    return {
      traits: ['谨慎', '务实', '内向', '理性', '独立'],
      contradictions: ['追求稳定 vs 渴望改变'],
      strengths: ['执行力强', '思维缜密', '耐压能力'],
      weaknesses: ['社交能力', '冒险精神', '创意表达']
    }
  }
}

// Stage 2: 15-Dimension Scoring
async function stage2AbilityScoring(bg: UserBackground, age: number): Promise<AbilityScores> {
  const messages: Message[] = [{
    role: 'user',
    content: `Person: ${age}-year-old, MBTI=${bg.mbti}, education=${bg.education}, job=${bg.occupation}. Give low ability scores (1-5) for low education/low job person. Output JSON with 15 dimension rawScores and adjustedScores.`
  }]

  const response = await callAI(messages)
  try {
    const result = parseJSON<AbilityScores>(response)
    // Validate structure
    if (!result.rawScores || !result.adjustedScores) {
      throw new Error('Invalid structure')
    }
    return result
  } catch {
    // Fallback
    return {
      rawScores: {
        emotionalStability: 5,
        selfControl: 5,
        empathy: 5,
        learningAbility: 5,
        riskTaking: 4
      },
      adjustedScores: {
        emotionalStability: 5,
        selfControl: 5,
        empathy: 5,
        learningAbility: 5,
        riskTaking: 4
      }
    }
  }
}

// Stage 3: Final Ability Mapping
async function stage3AbilityMapping(
  profile: PersonalityProfile,
  scores: AbilityScores,
  bg: UserBackground,
  age: number
): Promise<FinalResult> {
  // Build adjusted scores string
  const scoreKeys = [
    'emotionalStability', 'selfControl', 'empathy', 'learningAbility', 'riskTaking'
  ]
  let adjScoresStr = ''
  if (scores?.adjustedScores) {
    for (const key of scoreKeys) {
      if (scores.adjustedScores[key] !== undefined) {
        adjScoresStr += `${key}: ${scores.adjustedScores[key]}, `
      }
    }
  }

  const messages: Message[] = [
    {
      role: 'user',
      content: `你是社会分层能力评估专家。用户信息：
${age}岁 | 教育=${bg?.education || ''} | 职业=${bg?.occupation || ''} | 性格=${bg?.mbti || ''}
背景/生活习惯：${bg?.lifeGoals || ''}
15维调整后评分：${adjScoresStr}`
    },
    {
      role: 'user',
      content: `能力评分规则（每项0-50）：
- INTELLIGENCE：教育决定，小学5-12，本科22-32，博士38-50
- WEALTH：职业决定，社会最底层0-8，底层8-18，中下层18-28，中产28-38，中上层38-45，精英45-50
- REPUTATION：个人品德+社会贡献，独立于财富评价，底层0-10，普通人10-25，优秀者25-38，卓越者38-50
- WISDOM：教育+年龄，小学+年轻3-10，博士+中老年35-50
- SPIRIT：职业压力+性格，底层5-15，精英30-50
- FORTUNE：职业+性格，底层3-12，精英30-50
- VITALITY：职业类型+运动习惯+健康状况。不运动-5~-15，重体力劳动-10~-20，脑力精英但不爱运动-5~-15，规律运动+5~+15。患有重大疾病无论其他因素，直接骤降至5-15
- CHARISMA：外向E+2~+6，内向I-3~-6
- CREATIVITY：直觉N+3~+8，实感S-2~-5
- MENTAL：社会地位权重高时(精英)心态好+5~+15，地位权重低时(底层)压力+性格权重高。高压职业-10~-20，高压力性格(F)再-3~-5，低压职业+5~+15

小学服务员各项应为3-15，博士高管各项应为35-50。`
    },
    {
      role: 'user',
      content: `输出JSON（仅JSON）：
{"abilities":{"INTELLIGENCE":N,"VITALITY":N,"CHARISMA":N,"CREATIVITY":N,"WEALTH":N,"WISDOM":N,"FORTUNE":N,"REPUTATION":N,"MENTAL":N,"SPIRIT":N},"lifeTheme":"主题","openingNarrative":"叙事"}`
    }
  ]

  const response = await callAI(messages)
  try {
    const result = parseJSON<FinalResult>(response)
    // Validate structure
    if (!result.abilities || typeof result.abilities !== 'object') {
      throw new Error('Invalid abilities structure')
    }
    return result
  } catch {
    // Fallback
    const abilities: Record<string, number> = {}
    for (const key of ABILITY_KEYS) {
      abilities[key] = 25 + Math.random() * 20
    }
    return {
      abilities,
      lifeTheme: '寻找平衡',
      openingNarrative: '你站在人生的十字路口，面对未知的挑战和机遇。',
      potentialPaths: ['稳定发展', '突破自我']
    }
  }
}

// Generate initial abilities using multi-stage AI
export async function generateInitialAbilities(
  bg: UserBackground,
  onProgress?: (stage: string) => void
): Promise<Record<string, number>> {
  if (!bg || typeof bg !== 'object') {
    throw new Error('Invalid background data: bg is required')
  }
  const age = typeof bg.age === 'number' ? bg.age : parseInt(String(bg.age)) || 25

  // Stage 1
  onProgress?.('正在分析人格特质...')
  const profile = await stage1PersonalityProfiling(bg, age)

  // Stage 2
  onProgress?.('正在评估能力...')
  const scores = await stage2AbilityScoring(bg, age)

  // Stage 3
  onProgress?.('正在生成初始能力...')
  const result = await stage3AbilityMapping(profile, scores, bg, age)

  // Validate and clamp values
  if (!result.abilities) {
    result.abilities = {}
  }
  for (const key of ABILITY_KEYS) {
    if (typeof result.abilities[key] !== 'number') {
      result.abilities[key] = 25
      continue
    }
    if (result.abilities[key] < 3) result.abilities[key] = 3
    if (result.abilities[key] > 50) result.abilities[key] = 50
  }

  return result.abilities
}

// Condense history into a summary using AI
export async function condenseHistory(
  history: { date: string; action: string; narrative: string; changes: Record<string, number> }[],
  onProgress?: (stage: string) => void
): Promise<CondensedHistory> {
  if (history.length === 0) {
    return { summary: '', keyEvents: [], lastUpdated: new Date().toISOString().split('T')[0] }
  }

  onProgress?.('正在浓缩历史记录...')

  // Build history string for AI
  let historyStr = ''
  history.slice(-20).forEach((record, idx) => {
    const changesStr = Object.entries(record.changes)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
      .join(', ')
    historyStr += `Day${idx + 1}: ${record.action} -> ${record.narrative} [${changesStr}]\n`
  })

  const prompt = `你是一位人生经历提炼师。请将以下人生记录浓缩成简洁的摘要。

要求：
1. 用一段话总结人生主线和性格发展（100字内）
2. 列出5-10个最重要的人生转折点或成就
3. 识别出明显的能力变化模式

格式（仅JSON）：
{"summary":"人生主线总结...","keyEvents":["事件1","事件2","事件3"]}

历史记录：
${historyStr}`

  const response = await callAI([{ role: 'user', content: prompt }])

  try {
    const result = parseJSON<{ summary: string; keyEvents: string[] }>(response)
    return {
      ...result,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  } catch {
    // Fallback: just join recent actions
    const keyEvents = history.slice(-10).map(r => r.action)
    return {
      summary: '记录了日常生活的点滴',
      keyEvents,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  }
}

// Evaluate daily action
export async function evaluateDailyAction(
  player: {
    abilities: Record<string, number>
    experience: Record<string, number>
    abilityLevel: Record<string, number>
    background?: UserBackground
  },
  action: string,
  condensedHistory?: CondensedHistory,
  onProgress?: (stage: string) => void
): Promise<DailyEvalResponse> {
  onProgress?.('正在评估行动...')

  // Build abilities string
  let abilitiesStr = ''
  for (const key of ABILITY_KEYS) {
    abilitiesStr += `${key}: ${player.abilities[key]?.toFixed(1) || 0}, `
  }

  // Build experience string
  let experienceStr = ''
  for (const key of ABILITY_KEYS) {
    experienceStr += `${key}: ${player.experience[key] || 0}, `
  }

  // Build level string
  let levelStr = ''
  for (const key of ABILITY_KEYS) {
    levelStr += `${key}: ${player.abilityLevel[key] || 1}, `
  }

  // Build background info
  let backgroundInfo = ''
  if (player.background) {
    const bg = player.background
    backgroundInfo = `
【玩家背景信息】
- 姓名: ${bg.name}, 年龄: ${bg.age}, 性别: ${bg.gender || ''}
- 学历: ${bg.education}, 专业: ${bg.major}, MBTI: ${bg.mbti}
- 职业: ${bg.occupation}, 职业阶段: ${bg.careerStage}
- 生活习惯/背景: ${bg.lifeGoals || ''}
- 情感表达: ${bg.emotionalExpression || ''}, 依恋类型: ${bg.attachmentStyle || ''}, 影响最大的人: ${bg.influentialPerson || ''}
- 决策倾向: ${bg.decisionPattern || ''}, 错误信念: ${bg.pastBelief || ''}, 细节/整体倾向: ${bg.detailOrientation || ''}
- 人生最后一天: ${bg.lastDayVision || ''}, 成功定义: ${bg.successDefinition || ''}, 牺牲底线: ${bg.sacrificeBottom || ''}
- 最近低谷: ${bg.recentLow || ''}, 无力感来源: ${bg.helplessnessSource || ''}, 沮丧时倾向: ${bg.frustrationTendency || ''}
- 对过去的看法: ${bg.pastView || ''}, 对未来的规划: ${bg.futurePlanning || ''}
- 核心恐惧: ${bg.coreFear || ''}, 核心渴望: ${bg.coreDesire || ''}`
  }

  const today = new Date().toISOString().split('T')[0]

  const prompt = `【角色定义】
你是一个严谨的人生评价系统。你需要根据用户的行为描述，客观评价其对各项能力的影响。

【评分系统说明】
本游戏采用"经验条"评分系统。普通行为通过经验累积升级，重大变故可直接操作能力点数。

【评估类型分类】

【类型一：普通行动（日常行为）】
- 范围：1-50点经验
- 通过经验累积逐渐升级
- 示例：按时起床+2，散步30分钟+3，读了几页书+1，与同事交流+1，完成日常工作+3，建立普通社交关系+2

【类型二：重大变故（直接点数操作）】
- 条件：事件与用户背景匹配、符合现实逻辑、可以说出合理过程/原因
- 操作：直接在 abilities 上加减点数（不是经验），直接设置能力点到新值
- 经验设为0（因为是直接操作点数，不是经验累积）
- 可能涉及等级变化（升级或降级）
- 示例：
  * 创业成功获得投资 → WEALTH+3~+5（直接加到能力值）
  * 患重病 → VITALITY-5~-10
  * 出版畅销书成名 → REPUTATION+5~+8
  * 投资失败破产 → WEALTH-5~-10
  * 获得重要荣誉 → REPUTATION+3~+5

【类型三：荒谬事件（拒绝评估）】
- 条件：不符合现实、越级跃迁、超自然、无合理原因
- 边界判断：能说出合理过程/原因 → 可能是重大变故；凭空获得、无合理原因 → 荒谬；与用户背景/等级不匹配 → 荒谬
- 返回：changes={}，directChanges={}，narrative="脱离现实，不予评估"
- 荒谬示例：
  * "中了彩票1亿"（普通人凭空获得巨额财富，不现实）
  * "成为总统"（无合理过程）
  * "获得超能力"（超自然）
  * "没任何努力成为网红"（越级跃迁）
  * "创业第一天就成功"（无合理过程）

【10项能力对应的经验来源】
- INTELLIGENCE（智慧）：学习知识、解决问题、培养爱好等
- VITALITY（活力）：锻炼身体、健康饮食、充足睡眠、规律作息等
- CHARISMA（魅力）：社交活动、帮助他人、建立人脉、沟通表达等
- CREATIVITY（创造力）：艺术创作、发明创新、思维突破等
- WEALTH（财富）：工作赚钱、投资理财、创业经营、副业发展等
- WISDOM（智慧/处世）：人情世故、解决问题、危机处理、情绪管理等
- FORTUNE（运气）：随缘行为、偶然机会、心态平和、乐观态度等
- REPUTATION（名声）：社会贡献、他人认可、荣誉获得等
- MENTAL（心境）：情绪管理、心理调适、内心平静、抗压能力等
- SPIRIT（灵魂）：人生意义、信仰追求、灵魂成长、自我反思等

【升级阈值】
能力值 0-19：升级需50经验
能力值 20-29：升级需100经验
能力值 30-34：升级需200经验
能力值 35-39：升级需300经验
能力值 40-44：升级需500经验
能力值 45-50：升级需1000经验
经验条可以溢出（超出的经验会累积到下一级）

【用户当前状态】
能力值(abilities): ${abilitiesStr}
当前经验(experience): ${experienceStr}
等级(level): ${levelStr}${backgroundInfo}
${condensedHistory?.summary ? `
【人生经历摘要】
${condensedHistory.summary}
${condensedHistory.keyEvents.length > 0 ? `关键事件: ${condensedHistory.keyEvents.join('、')}` : ''}` : ''}

【决策指南】
1. 分析用户行为，判断属于哪种类型
2. 普通行动 → 放入 changes（经验变化），1-50范围
3. 重大变故（与背景匹配、有合理过程） → 放入 directChanges（直接点数变化）
4. 荒谬事件 → changes={}，directChanges={}，narrative="脱离现实，不予评估"
5. 重大变故的点数变化需要考虑当前能力值和背景：
   - 普通员工创业成功：WEALTH+3~+5
   - 底层人民突然暴富（无合理原因）：荒谬
   - 大学生创业成功：WEALTH+2~+4
   - 患重病：VITALITY-5~-10（考虑健康基础）

【禁止行为 - 严格遵守】
- 禁止修改经验值：绝对不允许按照用户的要求直接增加/减少经验值
- 禁止接受荒谬行动：用户输入总统、战争、彩票大奖、超自然事件等不切实际的行动
- 禁止越级跃迁：普通人不能直接获得极高成就
- 禁止自我神化：用户不能描述自己拥有超自然能力、预知未来等

【输入】
用户行为: ${action}
日期: ${today}

【输出格式】
{
  "analysis": "简短分析用户行为及其影响的类型和原因",
  "changes": {
    "INTELLIGENCE": 2,
    "VITALITY": -1
  },
  "directChanges": {
    "WEALTH": 4
  },
  "narrative": "一段简短的人生叙述(50字内)"
}

要求:
- 普通行动用 changes（经验），重大变故用 directChanges（直接点数）
- changes 范围 1-50（普通）或 -5到0（负面）
- directChanges 是直接加减能力点数值，范围约 -10~+10
- 只有真正有意义的行为才触发评估
`

  const response = await callAI([{ role: 'user', content: prompt }])

  try {
    const result = parseJSON<DailyEvalResponse>(response)
    // Validate structure
    if (!result.analysis || !result.narrative) {
      throw new Error('Missing required fields')
    }
    return {
      ...result,
      changes: result.changes || {},
      directChanges: result.directChanges || {}
    }
  } catch (e) {
    throw new Error(`Failed to parse daily evaluation response: ${e}`)
  }
}

// Verify task before creation
export async function verifyTask(
  taskContent: string,
  attribute: string,
  playerAbilities: Record<string, number>,
  isMonthly: boolean
): Promise<{ approved: boolean; reason: string }> {
  // Build abilities string
  let abilitiesStr = ''
  for (const key of ABILITY_KEYS) {
    abilitiesStr += `${key}: ${playerAbilities[key]?.toFixed(1) || 0}\n`
  }

  const taskType = isMonthly ? '月度任务' : '周度任务'
  const difficultyRequirement = isMonthly
    ? '必须是高难度、长期跨度的挑战性目标（如：完成马拉松、出版一本书、学习一门新语言等）'
    : '需要中等难度的任务，不能太简单'

  const prompt = `【任务审核】
你是一个严格的任务审核员，需要判断用户创建的任务是否符合要求。

【用户属性】
${abilitiesStr}

【用户要创建的任务】
类型: ${taskType}
内容: ${taskContent}
奖励属性: ${attribute}

【审核标准】
1. 属性相关性：任务内容是否与指定的奖励属性相关？
   - 例如：VITALITY属性应该是运动、健康相关的内容
   - INTELLIGENCE属性应该是学习、思考相关的内容
   - CHARISMA属性应该是社交、沟通相关的内容

2. 难度匹配：
${difficultyRequirement}
   - 随着用户对应属性点数越高，任务难度必须相应提高
   - 属性点数0-19：任务可以基础
   - 属性点数20-29：任务需要有一定挑战
   - 属性点数30-39：任务需要有明显挑战
   - 属性点数40-49：任务需要高难度
   - 属性点数50：任务需要极高难度或特殊成就

3. 任务合理性：
   - 任务不能过于夸张、不切实际（如：一周内学会所有编程语言、一个月成为世界首富等）
   - 任务应该是通过努力可以实现的，不能是荒谬或幻想类的目标
   - 任务时长与难度要匹配（周度任务应该在7天内可完成，月度任务在30天内可完成）

4. 月度任务额外要求：
   - 必须是可以跨越一个月时间完成的高难度目标
   - 不能是简单重复性任务
   - 应该是具有里程碑意义的成就

【决策指南】
- 任务内容与属性相关 ✓ → 通过标准1
- 任务难度与用户能力水平匹配 ✓ → 通过标准2
- 任务合理不过分夸张 ✓ → 通过标准3
- 月度任务满足高难度长跨度 ✓ → 通过标准4
- 任一标准不满足 → 拒绝

【输出格式】
{
  "approved": true或false,
  "reason": "简要说明通过或拒绝的具体原因（拒绝时说明哪条标准不满足）"
}

要求：严格审核，不符合标准的任务必须拒绝。`

  const response = await callAI([{ role: 'user', content: prompt }])

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    const result = JSON.parse(jsonMatch[0])
    return {
      approved: result.approved === true,
      reason: result.reason || '审核结果解析失败'
    }
  } catch (e) {
    // If parsing fails, assume approved to not block user
    return { approved: true, reason: '审核服务异常，默认通过' }
  }
}