import { useState, useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { useConfigStore } from '../store/configStore'
import { motion, AnimatePresence } from 'framer-motion'

const educationOptions = ['小学', '初中', '高中', '专科', '本科', '硕士', '博士']
const careerStageOptions = ['新手', '成长', '资深', '专家', '领袖']
const mbtiOptions = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']

const SETUP_FORM_KEY = 'setup_form_data'

const DEFAULT_API_KEY = 'sk-cp-39GJD0JfxtzSsZw2X6rOIkd7SOWndipemTrxJFVqqevgca_3lwQZYf5L9VhDuQPy1ofupkZmFBThVJNy-VLyeJT-Jmd2cWBsiKeCdTkBeickBXiRL7HfMUQ'

interface SetupProps {
  hasApiKey: boolean
  onApiKeyConfigured: () => void
}

export default function Setup({ hasApiKey, onApiKeyConfigured }: SetupProps) {
  const { initPlayer, isLoading, loadingMessage, error } = usePlayerStore()
  const [step, setStep] = useState(1)
  const [useDefaultApi, setUseDefaultApi] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [showApiModal, setShowApiModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [localUseDefaultApi, setLocalUseDefaultApi] = useState(true)
  const [localApiKey, setLocalApiKey] = useState('')
  const config = useConfigStore(s => s.config)

  useEffect(() => {
    if (config) {
      setLocalUseDefaultApi(config.useDefaultApi ?? true)
      setLocalApiKey(config.apiKey || '')
    }
  }, [config])

  useEffect(() => {
    setStep(hasApiKey ? 2 : 1)
  }, [hasApiKey])

  useEffect(() => {
    const saved = localStorage.getItem(SETUP_FORM_KEY)
    if (saved) {
      try {
        const { formData: savedForm, questionnaire: savedQuest, openQuestions: savedOpen } = JSON.parse(saved)
        if (savedForm) setFormData(savedForm)
        if (savedQuest) setQuestionnaire(savedQuest)
        if (savedOpen) setOpenQuestions(savedOpen)
      } catch { /* ignore */ }
    }
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    age: '25',
    gender: '',
    education: '本科',
    major: '',
    mbti: '',
    occupation: '',
    careerStage: '成长',
  })

  const [questionnaire, setQuestionnaire] = useState({
    workHours: '',
    exerciseFrequency: '',
    sleepQuality: '',
    socialActivities: '',
    stressLevel: '',
    dietQuality: '',
    healthCondition: '',
    financialStatus: '',
  })

  const [openQuestions, setOpenQuestions] = useState({
    emotionalExpression: '',
    attachmentStyle: '',
    influentialPerson: '',
    decisionPattern: '',
    pastBelief: '',
    detailOrientation: '',
    lastDayVision: '',
    successDefinition: '',
    sacrificeBottom: '',
    recentLow: '',
    helplessnessSource: '',
    frustrationTendency: '',
    pastView: '',
    futurePlanning: '',
    coreFear: '',
    coreDesire: '',
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuestionnaireChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuestionnaire(prev => ({ ...prev, [name]: value }))
  }

  const handleOpenQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOpenQuestions(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(SETUP_FORM_KEY, JSON.stringify({ formData, questionnaire, openQuestions }))
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [formData, questionnaire, openQuestions])

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!useDefaultApi && !apiKey.trim()) {
      setApiKeyError('请输入 API Key')
      return
    }
    try {
      useConfigStore.getState().saveConfig({
        apiKey: useDefaultApi ? DEFAULT_API_KEY : apiKey.trim(),
        model: 'MiniMax-M2.7',
        baseUrl: 'https://api.minimax.chat/v1',
        provider: 'minimax',
        useDefaultApi
      })
      setApiKeyError('')
      setStep(2)
      onApiKeyConfigured()
    } catch {
      setApiKeyError('API Key 保存失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasApiKey) {
      alert('请先配置 API Key')
      return
    }

    // 表单验证
    if (!formData.gender) { alert('请填写性别'); return }
    if (!formData.major) { alert('请填写专业'); return }
    if (!formData.occupation) { alert('请填写职业'); return }
    if (!formData.careerStage) { alert('请选择职业阶段'); return }
    if (!questionnaire.workHours) { alert('请填写工作习惯'); return }
    if (!questionnaire.exerciseFrequency) { alert('请填写运动频率'); return }
    if (!questionnaire.sleepQuality) { alert('请填写睡眠质量'); return }
    if (!questionnaire.socialActivities) { alert('请填写社交活动'); return }
    if (!questionnaire.stressLevel) { alert('请填写压力程度'); return }
    if (!questionnaire.dietQuality) { alert('请填写饮食习惯'); return }
    if (!questionnaire.healthCondition) { alert('请填写健康状况'); return }
    if (!questionnaire.financialStatus) { alert('请填写经济状况'); return }

    const questionnaireText = `
工作习惯: ${questionnaire.workHours}
运动频率: ${questionnaire.exerciseFrequency}
睡眠质量: ${questionnaire.sleepQuality}
社交活动: ${questionnaire.socialActivities}
压力程度: ${questionnaire.stressLevel}
饮食习惯: ${questionnaire.dietQuality}
健康状况: ${questionnaire.healthCondition}
经济状况: ${questionnaire.financialStatus}
`.trim()

    // initPlayer 成功后，清理 localStorage 中的表单数据
    localStorage.removeItem(SETUP_FORM_KEY)
    await initPlayer({
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      education: formData.education,
      major: formData.major,
      mbti: formData.mbti,
      occupation: formData.occupation,
      careerStage: formData.careerStage,
      lifeGoals: questionnaireText,
      // Open questions
      emotionalExpression: openQuestions.emotionalExpression,
      attachmentStyle: openQuestions.attachmentStyle,
      influentialPerson: openQuestions.influentialPerson,
      decisionPattern: openQuestions.decisionPattern,
      pastBelief: openQuestions.pastBelief,
      detailOrientation: openQuestions.detailOrientation,
      lastDayVision: openQuestions.lastDayVision,
      successDefinition: openQuestions.successDefinition,
      sacrificeBottom: openQuestions.sacrificeBottom,
      recentLow: openQuestions.recentLow,
      helplessnessSource: openQuestions.helplessnessSource,
      frustrationTendency: openQuestions.frustrationTendency,
      pastView: openQuestions.pastView,
      futurePlanning: openQuestions.futurePlanning,
      coreFear: openQuestions.coreFear,
      coreDesire: openQuestions.coreDesire,
    })
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl neon-border rounded-lg p-6 bg-transparent/80 backdrop-blur"
      >
        <h1 className="font-orbitron text-3xl text-center neon-gold mb-2">LIFE PROTOCOL</h1>
        <p className="text-center text-theme-primary mb-6">
          {step === 1 ? '配置 AI 服务' : '创建你的角色'}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4 text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">选择 API</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiChoice"
                    checked={useDefaultApi}
                    onChange={() => setUseDefaultApi(true)}
                    className="w-4 h-4 accent-theme-primary"
                  />
                  <span className="text-white">使用默认 API</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="apiChoice"
                    checked={!useDefaultApi}
                    onChange={() => setUseDefaultApi(false)}
                    className="w-4 h-4 accent-theme-primary"
                  />
                  <span className="text-white">自定义 API</span>
                </label>
              </div>
              {useDefaultApi && (
                <p className="text-yellow-400/70 text-xs mt-2">
                  默认 API，高峰期可能无响应，建议配置自己的 API
                </p>
              )}
            </div>

            {!useDefaultApi && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">MiniMax API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                />
                {apiKeyError && <p className="text-red-400 text-sm mt-1">{apiKeyError}</p>}
              </div>
            )}

            <div className="text-xs text-gray-500">
              模型: MiniMax-M2.7
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron rounded hover:bg-theme-primary/30 transition"
            >
              继续
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">年龄</label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  placeholder="25"
                  required
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">性别</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  required
                  placeholder="男/女"
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">学历</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleFormChange}
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                >
                  {educationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">专业</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleFormChange}
                required
                placeholder="计算机科学"
                className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">MBTI</label>
                <select
                  name="mbti"
                  value={formData.mbti}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                >
                  <option value="">选择MBTI</option>
                  {mbtiOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">职业阶段</label>
                <select
                  name="careerStage"
                  value={formData.careerStage}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                >
                  {careerStageOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">职业</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleFormChange}
                required
                placeholder="软件工程师"
                className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
              />
            </div>

            <div className="border-t border-theme-primary/20 pt-4">
              <h3 className="text-theme-primary mb-3">生活习惯问卷</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">工作习惯（每天工作时长、加班频率等）</label>
                  <textarea
                    name="workHours"
                    value={questionnaire.workHours}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">运动频率（每周运动次数、时长、类型）</label>
                  <textarea
                    name="exerciseFrequency"
                    value={questionnaire.exerciseFrequency}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">睡眠质量（每日睡眠时长、入睡难度）</label>
                  <textarea
                    name="sleepQuality"
                    value={questionnaire.sleepQuality}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">社交活动（每周社交频率、活动类型）</label>
                  <textarea
                    name="socialActivities"
                    value={questionnaire.socialActivities}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">压力程度（主要压力来源、应对方式）</label>
                  <textarea
                    name="stressLevel"
                    value={questionnaire.stressLevel}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">饮食习惯（每日餐食规律、饮食偏好）</label>
                  <textarea
                    name="dietQuality"
                    value={questionnaire.dietQuality}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">健康状况（身体和心理健康）</label>
                  <textarea
                    name="healthCondition"
                    value={questionnaire.healthCondition}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">经济状况（年收入、储蓄情况）</label>
                  <textarea
                    name="financialStatus"
                    value={questionnaire.financialStatus}
                    onChange={handleQuestionnaireChange}
                    required
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-theme-primary/20 pt-4">
              <h3 className="text-theme-primary mb-3">开放性问题（选填，可帮助 AI 更准确评估）</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">情感模式 - 描述一次你经历过的重大情感挫折，以及你当时的应对方式</label>
                  <textarea
                    name="recentLow"
                    value={openQuestions.recentLow}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">情感表达 - 你更倾向于压抑情感还是表达情感？为什么？</label>
                  <textarea
                    name="emotionalExpression"
                    value={openQuestions.emotionalExpression}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">依恋类型 - 你的人生中，谁对你的情感模式影响最大？</label>
                  <textarea
                    name="influentialPerson"
                    value={openQuestions.influentialPerson}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">认知风格 - 当你面临重大决定时，你更依赖逻辑分析还是直觉感受？</label>
                  <textarea
                    name="decisionPattern"
                    value={openQuestions.decisionPattern}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">错误信念 - 描述一个你曾经坚持但事后证明是错误的信念</label>
                  <textarea
                    name="pastBelief"
                    value={openQuestions.pastBelief}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">价值取向 - 如果明天是你生命的最后一天，你会选择做什么？</label>
                  <textarea
                    name="lastDayVision"
                    value={openQuestions.lastDayVision}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">成功定义 - 对你来说，成功意味着什么？</label>
                  <textarea
                    name="successDefinition"
                    value={openQuestions.successDefinition}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">牺牲底线 - 你愿意为了某个目标牺牲多少？什么是你绝对不愿牺牲的？</label>
                  <textarea
                    name="sacrificeBottom"
                    value={openQuestions.sacrificeBottom}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">挫折应对 - 什么会让你感到最深的无力感？你通常如何应对这种感受？</label>
                  <textarea
                    name="helplessnessSource"
                    value={openQuestions.helplessnessSource}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">时间感知 - 你对过去的看法如何？对未来有何规划？</label>
                  <textarea
                    name="futurePlanning"
                    value={openQuestions.futurePlanning}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">内在动机 - 你最大的恐惧是什么？你最深的渴望是什么？</label>
                  <textarea
                    name="coreDesire"
                    value={openQuestions.coreDesire}
                    onChange={handleOpenQuestionChange}
                    rows={2}
                    className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center mb-2">
              生成过程中请勿退出或刷新页面
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron rounded hover:bg-theme-primary/30 transition disabled:opacity-50"
            >
              {isLoading ? (loadingMessage || '游戏中...') : '开始人生'}
            </button>
          </form>
        )}
      </motion.div>

      {/* Floating Settings Button */}
      <button
        onClick={() => setShowApiModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-space-black/80 border border-theme-primary/30 text-theme-primary rounded-full flex items-center justify-center hover:bg-theme-primary/20 transition shadow-lg z-40"
        style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Floating Privacy Button */}
      <button
        onClick={() => setShowPrivacyModal(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-space-black/80 border border-theme-primary/30 text-theme-primary rounded-full flex items-center justify-center hover:bg-theme-primary/20 transition shadow-lg z-40"
        style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      {/* API Config Modal */}
      <AnimatePresence>
        {showApiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowApiModal(false)}
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
                <h2 className="text-theme-primary font-orbitron text-lg">API 配置</h2>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">选择 API</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modalApiChoice"
                        checked={localUseDefaultApi}
                        onChange={() => setLocalUseDefaultApi(true)}
                        className="w-4 h-4 accent-theme-primary"
                      />
                      <span className="text-white">使用默认 API</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modalApiChoice"
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

                {!localUseDefaultApi && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">API Key</label>
                    <input
                      type="text"
                      value={localApiKey}
                      onChange={e => setLocalApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-space-black border border-theme-primary/30 rounded px-3 py-2 text-white focus:border-theme-primary outline-none"
                    />
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  模型: MiniMax-M2.7
                </div>

                <button
                  onClick={() => {
                    useConfigStore.getState().saveConfig({
                      apiKey: localUseDefaultApi ? DEFAULT_API_KEY : localApiKey.trim(),
                      model: 'MiniMax-M2.7',
                      baseUrl: 'https://api.minimax.chat/v1',
                      provider: 'minimax',
                      useDefaultApi: localUseDefaultApi,
                    })
                    setShowApiModal(false)
                    setUseDefaultApi(localUseDefaultApi)
                    setApiKey(localApiKey)
                  }}
                  className="w-full py-2 bg-theme-primary/20 border border-theme-primary text-theme-primary font-orbitron rounded hover:bg-theme-primary/30 transition"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPrivacyModal(false)}
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
                  onClick={() => setShowPrivacyModal(false)}
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
    </div>
  )
}
