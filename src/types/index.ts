export interface UserProfile {
  id: string
  name: string
  weight_kg: number
  height_cm: number
  age: number
  walk_goal_min: number
  calorie_goal: number
  water_goal_l: number
  active_goal_min: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  theme: 'system' | 'light' | 'dark'
  created_at: string
  updated_at: string
}

export interface DailyMetric {
  id: string
  user_id: string
  date: string
  walk_min: number
  calories: number
  water_l: number
  active_min: number
  distance_km: number
  created_at: string
  updated_at: string
}

export interface WorkoutEntry {
  id: string
  user_id: string
  type: 'running' | 'strength' | 'cycling' | 'yoga' | 'walking' | 'custom'
  duration_min: number
  distance_km: number | null
  intensity: 'easy' | 'moderate' | 'hard' | 'maximum' | null
  notes: string | null
  done_at: string
  created_at: string
}

export interface WaterIntake {
  id: string
  user_id: string
  amount_l: number
  date: string
  created_at: string
}

export interface SleepRecord {
  id: string
  user_id: string
  started_at: string
  ended_at: string
  quality: 'poor' | 'fair' | 'good' | 'great'
  created_at: string
}

export interface MealEntry {
  id: string
  user_id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'meal'
  date: string
  created_at: string
}

export interface UserGoal {
  id: string
  user_id: string
  category: 'steps' | 'water' | 'calories' | 'active_minutes' | 'distance' | 'weight' | 'workouts'
  title: string
  target: number
  current: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly'
  completed: boolean
  created_at: string
  updated_at: string
}
