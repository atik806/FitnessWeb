"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProfileStore, useWorkoutStore, useMealStore } from "@/store"
import { Greeting } from "@/components/dashboard/greeting"
import { WalkRing } from "@/components/dashboard/step-ring"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentWorkouts } from "@/components/dashboard/recent-workouts"
import { Flame, Droplets, Timer, Loader2 } from "lucide-react"
import { getToday } from "@/lib/utils"

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile, loadProfile } = useProfileStore()
  const { workouts, loadWorkouts } = useWorkoutStore()
  const { meals, loadMeals } = useMealStore()
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
      if (data) setWaterL(data.reduce((s, w) => s + w.amount_l, 0))
    } catch {}
  }, [today])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        Promise.all([
          loadProfile(id),
          loadWorkouts(id),
          loadMeals(id, today),
          loadWater(id),
        ]).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))
  }, [loadProfile, loadWorkouts, loadMeals, loadWater, today])

  const walkMin = workouts
    .filter((w) => w.type === "walking")
    .reduce((s, w) => s + w.duration_min, 0)
  const calories = meals.reduce((s, m) => s + m.calories, 0)
  const activeMin = workouts.reduce((s, w) => s + w.duration_min, 0)

  const walkGoal = Math.max(profile?.walk_goal_min ?? 30, 1)
  const calorieGoal = Math.max(profile?.calorie_goal ?? 2200, 1)
  const waterGoal = Math.max(profile?.water_goal_l ?? 2.5, 0.1)
  const activeGoal = Math.max(profile?.active_goal_min ?? 30, 1)

  if (!userId || loading) {
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

      <RecentWorkouts userId={userId} />
    </div>
  )
}
