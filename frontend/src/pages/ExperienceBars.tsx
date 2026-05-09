import { usePlayerStore } from '../store/playerStore'
import { ABILITY_NAMES } from '../utils/achievements'
import { getExpThreshold } from '../utils/exp'

const abilityKeys = ['INTELLIGENCE', 'VITALITY', 'CHARISMA', 'CREATIVITY', 'WEALTH', 'WISDOM', 'FORTUNE', 'REPUTATION', 'MENTAL', 'SPIRIT']

function ExperienceBar({ ability, exp, abilityValue }: {
  ability: string
  exp: number
  abilityValue: number
}) {
  const expNeeded = getExpThreshold(abilityValue)
  const percentage = Math.min((exp / expNeeded) * 100, 100)

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{ABILITY_NAMES[ability]}</span>
        <span className="text-gray-400">{Math.round(abilityValue)}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${percentage}%`, background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{exp.toFixed(0)} / {expNeeded} 经验</div>
    </div>
  )
}

export default function ExperienceBars() {
  const { player } = usePlayerStore()
  if (!player) return null

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-orbitron text-2xl neon-gold">经验条</h1>
      </div>

      <div className="bg-theme-card neon-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {abilityKeys.map(key => {
            const abilityValue = player.abilities[key] || 0
            return (
              <ExperienceBar
                key={key}
                ability={key}
                exp={player.experience?.[key] || 0}
                abilityValue={abilityValue}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}