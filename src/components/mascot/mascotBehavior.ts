export type MascotBehavior =
  | 'walk'
  | 'funny'
  | 'interact'
  | 'react'
  | 'stupid'

export function getRandomBehavior(): MascotBehavior {
  const roll = Math.random() * 100

  if (roll < 30) return 'walk'
  if (roll < 50) return 'funny'
  if (roll < 70) return 'interact'
  if (roll < 90) return 'react'
  return 'stupid'
}

export const behaviorDurations: Record<MascotBehavior, number> = {
  walk: 4000,
  funny: 2500,
  interact: 3000,
  react: 2500,
  stupid: 3500,
}