"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExerciseAnimation } from "@/components/exercise/exercise-animation"
import { Button } from "@/components/ui/button"
import { Dumbbell, Sparkles, ArrowRight } from "lucide-react"
import { getExercisesWithAnimation } from "@/lib/exercise-library"
import type { Exercise } from "@/types/exercise"
import Link from "next/link"

export function DailyExercise() {
  const exercise = useMemo<Exercise | null>(() => {
    const exercises = getExercisesWithAnimation()
    if (exercises.length === 0) return null
    const today = new Date().toISOString().split("T")[0]
    const dayOfYear = today.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0)
    const index = dayOfYear % exercises.length
    return exercises[index]
  }, [])

  if (!exercise) return null

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="size-4 text-fitness" />
            Exercise of the Day
          </h3>
          <Link
            href="/exercises"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-fitness transition-colors"
          >
            Browse all
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
          <div className="flex items-center justify-center rounded-xl bg-fitness/5 p-3">
            <ExerciseAnimation
              exerciseId={exercise.id}
              size={120}
              autoplay
              loop
              lazy={false}
            />
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <div>
              <p className="font-semibold text-base">{exercise.name}</p>
              <p className="text-muted-foreground text-xs line-clamp-2">
                {exercise.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-md bg-fitness/10 px-2 py-0.5 text-[11px] font-medium text-fitness">
                {exercise.primaryMuscle}
              </div>
              <div className="rounded-md bg-secondary px-2 py-0.5 text-[11px] capitalize text-secondary-foreground">
                {exercise.category}
              </div>
              {exercise.hasAnimation && (
                <div className="rounded-md bg-fitness/10 px-2 py-0.5 text-[11px] text-fitness">
                  Animated
                </div>
              )}
            </div>

            <Link href="/workouts" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Dumbbell className="size-3.5" />
                Log This Exercise
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
