export interface AnimationMetadata {
  exerciseId: string
  file: string
  thumbnail?: string
  duration?: number
  fallbackColor?: string
}

export const animationMap: Record<string, AnimationMetadata> = {
  "push-up": {
    exerciseId: "push_up",
    file: "/animations/exercise/push-up.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  "wide-push-up": {
    exerciseId: "wide_push_up",
    file: "/animations/exercise/wide-push-up.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  squat: {
    exerciseId: "squat",
    file: "/animations/exercise/squat.json",
    fallbackColor: "oklch(0.705 0.213 47.6 / 0.1)",
  },
  lunge: {
    exerciseId: "bodyweight_lunge",
    file: "/animations/exercise/lunge.json",
    fallbackColor: "oklch(0.705 0.213 47.6 / 0.1)",
  },
  plank: {
    exerciseId: "plank",
    file: "/animations/exercise/plank.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  crunch: {
    exerciseId: "crunch",
    file: "/animations/exercise/crunch.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  "leg-raise": {
    exerciseId: "leg_raise",
    file: "/animations/exercise/leg-raise.json",
    fallbackColor: "oklch(0.705 0.213 47.6 / 0.1)",
  },
  "mountain-climber": {
    exerciseId: "mountain_climber",
    file: "/animations/exercise/mountain-climber.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  burpee: {
    exerciseId: "burpee",
    file: "/animations/exercise/burpee.json",
    fallbackColor: "oklch(0.705 0.213 47.6 / 0.1)",
  },
  "jumping-jack": {
    exerciseId: "jumping_jack",
    file: "/animations/exercise/jumping-jack.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
  "high-knees": {
    exerciseId: "high_knees",
    file: "/animations/exercise/high-knees.json",
    fallbackColor: "oklch(0.705 0.213 47.6 / 0.1)",
  },
  "pull-up": {
    exerciseId: "pull_up",
    file: "/animations/exercise/pull-up.json",
    fallbackColor: "oklch(0.527 0.154 154.66 / 0.1)",
  },
}

export function getAnimationMetadata(exerciseId: string): AnimationMetadata | undefined {
  return animationMap[exerciseId] ?? Object.values(animationMap).find(
    (a) => a.exerciseId === exerciseId,
  )
}

export function getAnimationFile(exerciseId: string): string | null {
  return getAnimationMetadata(exerciseId)?.file ?? null
}

export function hasAnimation(exerciseId: string): boolean {
  return getAnimationMetadata(exerciseId) !== undefined
}
