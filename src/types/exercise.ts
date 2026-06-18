export interface Exercise {
  id: string
  name: string
  description: string
  difficulty: number
  category: "strength" | "cardio" | "stretching" | "plyometrics"
  equipment: string[]
  primaryMuscle: string
  secondaryMuscles: string[]
  executionTips: string[]
  hasAnimation: boolean
  animationFile: string | null
}

export interface WorkoutSet {
  id: string
  workoutId: string
  exerciseId: string
  sortOrder: number
  reps: number | null
  weightKg: number | null
  durationSeconds: number | null
  distanceM: number | null
  notes: string | null
}

export interface WorkoutWithExercises {
  id: string
  userId: string
  name: string
  type: "running" | "strength" | "cycling" | "yoga" | "walking" | "custom"
  durationMin: number
  notes: string | null
  doneAt: string
  createdAt: string
  exercises: WorkoutSet[]
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "cardio"
  | "full_body"
  | "core"
  | "other"
