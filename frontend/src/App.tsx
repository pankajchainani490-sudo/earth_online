import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { usePlayerStore } from './store/playerStore'
import { useConfigStore } from './store/configStore'
import { useThemeStore, THEMES, getThemeVariables } from './store/themeStore'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Achievements from './pages/Achievements'
import History from './pages/History'
import ExperienceBars from './pages/ExperienceBars'
import Tasks from './pages/Tasks'
import Action from './pages/Action'
import Settings from './pages/Settings'
import AllHistory from './pages/AllHistory'
import BottomNav from './components/BottomNav'

function App() {
  const player = usePlayerStore(s => s.player)
  const fetchStatus = usePlayerStore(s => s.fetchStatus)
  const config = useConfigStore(s => s.config)
  const loadConfig = useConfigStore(s => s.loadConfig)
  const currentTheme = useThemeStore(s => s.currentTheme)
  const loadTheme = useThemeStore(s => s.loadTheme)
  const [hasApiKey, setHasApiKey] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    loadConfig()
    loadTheme()
    fetchStatus()
  }, [])

  useEffect(() => {
    // Apply theme CSS variables
    const theme = THEMES[currentTheme]
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (result) return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      return '10, 14, 23'
    }
    document.documentElement.style.setProperty('--theme-primary', theme.primary)
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary)
    document.documentElement.style.setProperty('--theme-bg', theme.bg)
    document.documentElement.style.setProperty('--theme-primary-rgb', hexToRgb(theme.primary))
    document.documentElement.style.setProperty('--theme-secondary-rgb', hexToRgb(theme.secondary))
    document.documentElement.style.setProperty('--theme-bg-rgb', hexToRgb(theme.bg))
  }, [currentTheme])

  useEffect(() => {
    setHasApiKey(!!config?.apiKey)
  }, [config])

  useEffect(() => {
    if (player && location.pathname === '/setup') {
      navigate('/dashboard')
    }
  }, [player, navigate, location.pathname])

  const showBottomNav = player && location.pathname !== '/setup' && location.pathname !== '/config' && location.pathname !== '/all-history'

  return (
    <div className="scanline">
      <div className={`${showBottomNav ? 'pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={player ? <Navigate to="/dashboard" /> : <Setup hasApiKey={hasApiKey} onApiKeyConfigured={() => setHasApiKey(true)} />} />
          <Route path="/setup" element={!player ? <Setup hasApiKey={hasApiKey} onApiKeyConfigured={() => setHasApiKey(true)} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={player ? <Dashboard /> : <Navigate to="/setup" />} />
          <Route path="/achievements" element={player ? <Achievements /> : <Navigate to="/setup" />} />
          <Route path="/history" element={player ? <History /> : <Navigate to="/setup" />} />
          <Route path="/experience" element={player ? <ExperienceBars /> : <Navigate to="/setup" />} />
          <Route path="/tasks" element={player ? <Tasks /> : <Navigate to="/setup" />} />
          <Route path="/action" element={player ? <Action /> : <Navigate to="/setup" />} />
          <Route path="/settings" element={player ? <Settings /> : <Navigate to="/setup" />} />
          <Route path="/all-history" element={player ? <AllHistory /> : <Navigate to="/setup" />} />
        </Routes>
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default App