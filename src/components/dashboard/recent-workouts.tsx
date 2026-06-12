"use client"

import { useEffect } from "react"
import { Dumbbell, Footprints, Bike, PersonStanding, Activity, Loader2 } from "lucide-react"
import { useWorkoutStore } from "@/store"
import { timeAgo } from "@/lib/utils"

const workoutIcons: Record<string, typeof Dumbbell> = {
  running: Footprints,
  strength: Dumbbell,
  cycling: Bike,
  walking: PersonStanding,
  yoga: PersonStanding,
  custom: Activity,
}

const workoutLabels: Record<string, string> = {
  running: "Running",
  strength: "Strength",
  cycling: "Cycling",
  walking: "Walking",
  yoga: "Yoga",
  custom: "Workout",
}

export function RecentWorkouts({ userId }: { userId: string }) {
  const { workouts, loading, loadWorkouts } = useWorkoutStore()

  useEffect(() => {
    loadWorkouts(userId)
  }, [loadWorkouts, userId])



  const recent = workouts.slice(0, 5)

  if (!loading && recent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-card-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-fitness/10">
          <Activity className="size-6 text-fitness" />
        </div>
        <p className="text-sm text-muted-foreground">No workouts yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-[var(--shadow-card)]">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Recent Workouts</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((workout) => {
            const Icon = workoutIcons[workout.type] ?? Activity
            const label = workoutLabels[workout.type] ?? "Workout"

            return (
              <div
                key={workout.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fitness/10 text-fitness">
                  <Icon className="size-4" />
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-muted-foreground text-xs">
                    {workout.duration_min} min
                    {workout.distance_km != null && ` · ${workout.distance_km} km`}
                  </span>
                </div>

                <span className="text-muted-foreground shrink-0 text-xs">
                  {timeAgo(workout.done_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
