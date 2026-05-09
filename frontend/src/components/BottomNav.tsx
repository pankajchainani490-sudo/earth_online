import { useLocation, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'

const tabs = [
  { path: '/dashboard', label: '能力值' },
  { path: '/action', label: '行动' },
  { path: '/tasks', label: '任务' },
  { path: '/achievements', label: '成就' },
  { path: '/settings', label: '设置' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTheme = useThemeStore(s => s.currentTheme)
  const primaryColor = currentTheme === 'default' ? '#00d4ff' : currentTheme === 'S' ? '#ff6b35' : currentTheme === 'A+' ? '#808080' : currentTheme === 'A' ? '#000000' : currentTheme === 'B+' ? '#daa520' : '#1a1a1a'
  const secondaryColor = currentTheme === 'default' ? '#fbbf24' : currentTheme === 'S' ? '#cc0000' : currentTheme === 'A+' ? '#6b8e23' : currentTheme === 'A' ? '#ffffff' : currentTheme === 'B+' ? '#ff69b4' : '#8b0000'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: 'var(--theme-bg)', borderColor: `${primaryColor}40` }}>
      <div className="flex">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 py-4 text-center transition-all border-t-2 ${
                isActive ? '' : 'border-transparent'
              }`}
              style={{
                color: isActive ? secondaryColor : `${primaryColor}cc`,
                borderColor: isActive ? secondaryColor : 'transparent',
                textShadow: isActive ? `0 0 10px ${secondaryColor}` : `0 0 10px ${primaryColor}`,
              }}
            >
              <span className="font-orbitron text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
