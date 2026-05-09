// Get exp threshold based on current ability value
// Ranges: 0-19→50, 20-29→100, 30-34→200, 35-39→300, 40-44→500, 45-50→1000
export function getExpThreshold(abilityValue: number): number {
  if (abilityValue < 20) return 50
  if (abilityValue < 30) return 100
  if (abilityValue < 35) return 200
  if (abilityValue < 40) return 300
  if (abilityValue < 45) return 500
  return 1000
}

// Apply experience changes with level-up/down logic
// Level up: exp >= threshold → ability +1, exp carries over
// Level down: exp < 0 → ability -1, exp = maxExp + currentExp
export function applyExperienceChanges(
  abilities: Record<string, number>,
  experience: Record<string, number>,
  abilityLevel: Record<string, number>,
  expChanges: Record<string, number>
): { updatedAbilities: Record<string, number>; updatedExperience: Record<string, number>; updatedLevel: Record<string, number>; changes: Record<string, number> } {
  const updatedAbilities = { ...abilities }
  const updatedExperience = { ...experience }
  const updatedLevel = { ...abilityLevel }
  const changes: Record<string, number> = {}

  for (const key of Object.keys(expChanges)) {
    const currentExp = updatedExperience[key] || 0
    const level = updatedLevel[key] || 1
    const abilityValue = updatedAbilities[key] || 0

    // Apply random factor ±10% for variability
    const randomFactor = 0.9 + Math.random() * 0.2
    let delta = expChanges[key] * randomFactor

    // Round to 1 decimal
    delta = Math.round(delta * 10) / 10

    let newExp = currentExp + delta
    let newAbility = abilityValue
    let newLevel = level

    // Level up: exp >= threshold, carry over overflow
    if (newExp >= 0) {
      while (newExp >= getExpThreshold(newAbility)) {
        newAbility += 1
        newLevel += 1
        // Overflow carries to next level's requirement
      }
    }
    // Level down: exp < 0
    else {
      newAbility -= 1
      newLevel = Math.max(1, newLevel - 1)
      // Calculate max exp for previous ability range
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

    updatedAbilities[key] = newAbility
    updatedExperience[key] = newExp
    updatedLevel[key] = newLevel
    changes[key] = delta
  }

  return { updatedAbilities, updatedExperience, updatedLevel, changes }
}
