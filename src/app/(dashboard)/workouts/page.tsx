"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkoutStore } from "@/store"
import { WorkoutForm } from "@/components/log/workout-form"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Trash2,
  Footprints,
  Dumbbell,
  Bike,
  PersonStanding,
  Activity,
  Calendar,
  Clock,
  Zap,
  Loader2,
} from "lucide-react"
import { formatDate, formatTime, cn } from "@/lib/utils"
import { toast } from "sonner"
import type { WorkoutEntry } from "@/types"

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

const intensityColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  moderate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  maximum: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export default function WorkoutsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { workouts, loading, loadWorkouts, deleteWorkout } = useWorkoutStore()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        loadWorkouts(id)
      }
    }).catch(() => {})
  }, [loadWorkouts])

  async function handleDelete(id: string) {
    try {
      await deleteWorkout(id)
      toast.success("Workout deleted")
    } catch {}
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground text-sm">
            {workouts.length} workout{workouts.length !== 1 ? "s" : ""} logged
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
            </DialogHeader>
            <WorkoutForm userId={userId} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-fitness/10">
            <Activity className="size-8 text-fitness" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No workouts yet</p>
            <p className="text-muted-foreground mt-1 text-xs">Log your first workout to get started</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Log Your First Workout
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workouts.map((workout, i) => {
            const Icon = workoutIcons[workout.type] ?? Activity
            const label = workoutLabels[workout.type] ?? "Workout"
            return (
              <Card
                key={workout.id}
                className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
                style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.05}s both` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-fitness/10 text-fitness">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{label}</h3>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Calendar className="size-3" />
                          {formatDate(workout.done_at)} at {formatTime(workout.done_at)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(workout.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Clock className="size-3" />
                      {workout.duration_min} min
                    </div>
                    {workout.distance_km != null && (
                      <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                        <Activity className="size-3" />
                        {workout.distance_km} km
                      </div>
                    )}
                    {workout.intensity && (
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                          intensityColors[workout.intensity] ?? "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <Zap className="size-3" />
                        {workout.intensity}
                      </div>
                    )}
                  </div>

                  {workout.notes && (
                    <p className="text-muted-foreground mt-2 text-xs italic">
                      {workout.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
