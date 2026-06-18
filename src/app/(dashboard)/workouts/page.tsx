"use client"

import { memo, useEffect, useState } from "react"
import { useWorkoutStore } from "@/store"
import { useAuthStore } from "@/hooks/use-auth"
import { WorkoutForm } from "@/components/log/workout-form"
import { ExerciseAnimation } from "@/components/exercise/exercise-animation"
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
  Sparkles,
} from "lucide-react"
import { formatDate, formatTime, cn } from "@/lib/utils"
import { toast } from "sonner"
import { getExerciseById } from "@/lib/exercise-library"
import { Skeleton } from "@/components/ui/skeleton"
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

function extractExercisesFromNotes(notes: string | null): string[] {
  if (!notes) return []
  const match = notes.match(/Exercises: (.+)/)
  if (!match) return []
  return match[1].split(",").map((s) => s.trim()).filter(Boolean)
}

function exerciseIdToName(id: string): string {
  const ex = getExerciseById(id)
  return ex?.name ?? id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const WorkoutRecordCard = memo(function WorkoutRecordCard({
  workout,
  index,
  onDelete,
}: {
  workout: WorkoutEntry
  index: number
  onDelete: (id: string) => void
}) {
  const Icon = workoutIcons[workout.type] ?? Activity
  const label = workoutLabels[workout.type] ?? "Workout"
  const exerciseIds = extractExercisesFromNotes(workout.notes)
  const previewExercise = exerciseIds.length > 0
    ? getExerciseById(exerciseIds[0])
    : null

  return (
    <Card
      className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
      style={{ animation: `fade-in-up 0.4s ease-out ${index * 0.05}s both` }}
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
            onClick={() => onDelete(workout.id)}
          >
            <Trash2 className="size-4 text-red-500" />
          </Button>
        </div>

        {previewExercise && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-fitness/5 p-2">
            <div className="size-12 shrink-0">
              <ExerciseAnimation
                exerciseId={previewExercise.id}
                size={48}
                autoplay={false}
                loop
                lazy
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-xs font-medium text-fitness">
                <Sparkles className="size-3" />
                Exercises
              </p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {exerciseIds.map((id) => (
                  <span
                    key={id}
                    className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                  >
                    {exerciseIdToName(id)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

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
          {exerciseIds.length > 0 && (
            <div className="bg-fitness/10 text-fitness flex items-center gap-1 rounded-md px-2 py-1 text-xs">
              <Sparkles className="size-3" />
              {exerciseIds.length} exercise{exerciseIds.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {workout.notes && (
          <p className="text-muted-foreground mt-2 text-xs italic">
            {workout.notes.replace(/Exercises:.+$/, "").trim()}
          </p>
        )}
      </CardContent>
    </Card>
  )
})

export default function WorkoutsPage() {
  const [open, setOpen] = useState(false)
  const workouts = useWorkoutStore((s) => s.workouts)
  const loading = useWorkoutStore((s) => s.loading)
  const hasMore = useWorkoutStore((s) => s.hasMore)
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts)
  const loadMore = useWorkoutStore((s) => s.loadMore)
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout)
  const { userId, loading: authLoading, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (userId) loadWorkouts(userId)
  }, [userId, loadWorkouts])

  async function handleDelete(id: string) {
    try {
      await deleteWorkout(id)
      toast.success("Workout deleted")
    } catch {
      toast.error("Failed to delete workout")
    }
  }

  if (authLoading || !userId) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>
          ))}
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

      {loading && workouts.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>
          ))}
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
          {workouts.map((workout, i) => (
            <WorkoutRecordCard
              key={workout.id}
              workout={workout}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {hasMore && workouts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => userId && loadMore(userId)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
