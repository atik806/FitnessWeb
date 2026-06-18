"use client"

import { ExerciseAnimation } from "@/components/exercise/exercise-animation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Dumbbell, Sparkles, ArrowLeft, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/types/exercise"

interface ExerciseDetailProps {
  exercise: Exercise
  onBack?: () => void
  onSelect?: (exercise: Exercise) => void
  selectLabel?: string
}

const difficultyColors: Record<number, string> = {
  1: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  2: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  3: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  4: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  5: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  6: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  7: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  8: "bg-red-500/10 text-red-600 dark:text-red-400",
  9: "bg-red-500/10 text-red-600 dark:text-red-400",
  10: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Beginner",
  3: "Beginner",
  4: "Intermediate",
  5: "Intermediate",
  6: "Intermediate",
  7: "Advanced",
  8: "Advanced",
  9: "Expert",
  10: "Expert",
}

export function ExerciseDetail({ exercise, onBack, onSelect, selectLabel }: ExerciseDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to exercises
        </button>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center justify-center">
          <div className="rounded-2xl bg-fitness/5 p-4">
            <ExerciseAnimation
              exerciseId={exercise.id}
              size={220}
              autoplay
              loop
              showControls
              lazy={false}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{exercise.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{exercise.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium",
                difficultyColors[exercise.difficulty] ?? "bg-secondary text-secondary-foreground",
              )}
            >
              <Clock className="size-3.5" />
              {difficultyLabels[exercise.difficulty] ?? "Beginner"}
            </div>
            <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-lg px-3 py-1 text-xs capitalize">
              {exercise.category}
            </div>
            {exercise.equipment.map((eq) => (
              <div
                key={eq}
                className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-lg px-3 py-1 text-xs capitalize"
              >
                <Dumbbell className="size-3.5" />
                {eq}
              </div>
            ))}
            {exercise.hasAnimation && (
              <div className="bg-fitness/10 text-fitness flex items-center gap-1 rounded-lg px-3 py-1 text-xs">
                <Sparkles className="size-3.5" />
                Animated
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <ListChecks className="size-4 text-fitness" />
                Execution Tips
              </h4>
              <ol className="flex flex-col gap-2">
                {exercise.executionTips.map((tip, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fitness/10 text-[11px] font-medium text-fitness">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="mb-2 text-sm font-semibold">Target Muscles</h4>
              <div className="flex flex-wrap gap-1.5">
                <div className="rounded-md bg-fitness/10 px-2.5 py-1 text-xs font-medium text-fitness">
                  {exercise.primaryMuscle}
                </div>
                {exercise.secondaryMuscles.map((muscle) => (
                  <div
                    key={muscle}
                    className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {muscle}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {onSelect && (
            <Button
              variant="fitness"
              size="lg"
              onClick={() => onSelect(exercise)}
              className="w-full"
            >
              <Sparkles className="size-4" />
              {selectLabel ?? "Select Exercise"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
