"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProfileStore, useWorkoutStore, useMealStore, useSleepStore } from "@/store"
import { useAuthStore } from "@/hooks/use-auth"
import { Greeting } from "@/components/dashboard/greeting"
import { WalkRing } from "@/components/dashboard/step-ring"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentWorkouts } from "@/components/dashboard/recent-workouts"
import { DailyExercise } from "@/components/dashboard/daily-exercise"
import { SleepSummary } from "@/components/dashboard/sleep-summary"
import { Flame, Droplets, Timer, Loader2 } from "lucide-react"
import { getToday } from "@/lib/utils"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const profile = useProfileStore((s) => s.profile)
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const workouts = useWorkoutStore((s) => s.workouts)
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts)
  const meals = useMealStore((s) => s.meals)
  const loadMeals = useMealStore((s) => s.loadMeals)
  const loadSleep = useSleepStore((s) => s.loadRecords)
  const { userId, loading: authLoading, fetchUser } = useAuthStore()
  const [waterL, setWaterL] = useState(0)
  const today = getToday()

  const loadWater = useCallback(async (uid: string) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("water_intake")
        .select("amount_l")
        .eq("user_id", uid)
        .eq("date", today)
      if (data) setWaterL(data.reduce((s: number, w: { amount_l: number }) => s + w.amount_l, 0))
    } catch {}
  }, [today])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!userId) {
      if (!authLoading) setLoading(false)
      return
    }
    Promise.all([
      loadProfile(userId),
      loadWorkouts(userId),
      loadMeals(userId, today),
      loadSleep(userId),
      loadWater(userId),
    ]).finally(() => setLoading(false))
  }, [userId, authLoading, loadProfile, loadWorkouts, loadMeals, loadSleep, loadWater, today])

  const walkMin = workouts
    .filter((w) => w.type === "walking")
    .reduce((s, w) => s + w.duration_min, 0)
  const calories = meals.reduce((s, m) => s + m.calories, 0)
  const activeMin = workouts.reduce((s, w) => s + w.duration_min, 0)

  const walkGoal = Math.max(profile?.walk_goal_min ?? 30, 1)
  const calorieGoal = Math.max(profile?.calorie_goal ?? 2200, 1)
  const waterGoal = Math.max(profile?.water_goal_l ?? 2.5, 0.1)
  const activeGoal = Math.max(profile?.active_goal_min ?? 30, 1)

  if (loading || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Greeting name={profile?.name} />

      <div className="relative flex items-center justify-center py-4">
        <WalkRing minutes={walkMin} goal={walkGoal} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Flame}
          label="Calories"
          value={calories}
          goal={calorieGoal}
          progress={(calories / calorieGoal) * 100}
          unit="kcal"
        />
        <MetricCard
          icon={Droplets}
          label="Water"
          value={Math.round(waterL * 10) / 10}
          goal={waterGoal}
          progress={(waterL / waterGoal) * 100}
          unit="L"
        />
        <MetricCard
          icon={Timer}
          label="Active Minutes"
          value={activeMin}
          goal={activeGoal}
          progress={(activeMin / activeGoal) * 100}
          unit="min"
        />
      </div>

      <DailyExercise />

      <SleepSummary />

      <RecentWorkouts userId={userId} />
    </div>
  )
}
