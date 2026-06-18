"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ExerciseAnimation } from "@/components/exercise/exercise-animation"
import { Dumbbell, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/types/exercise"

interface ExerciseCardProps {
  exercise: Exercise
  selected?: boolean
  onSelect?: (exercise: Exercise) => void
  compact?: boolean
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

export function ExerciseCard({ exercise, selected, onSelect, compact = false }: ExerciseCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 overflow-hidden",
        "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5",
        selected && "ring-2 ring-fitness ring-offset-2 ring-offset-background",
      )}
      onClick={() => onSelect?.(exercise)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-fitness/10 text-fitness",
                compact ? "size-9" : "size-10",
              )}
            >
              <Dumbbell className={cn(compact ? "size-4" : "size-5")} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={cn("font-semibold truncate", compact ? "text-sm" : "text-base")}>
                {exercise.name}
              </h3>
              <p className="text-muted-foreground truncate text-xs">
                {exercise.primaryMuscle}
                {exercise.secondaryMuscles.length > 0 &&
                  ` \u00B7 ${exercise.secondaryMuscles.slice(0, 2).join(", ")}`}
              </p>
            </div>
          </div>
          {selected && (
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fitness">
              <Sparkles className="size-3 text-white" />
            </div>
          )}
        </div>

        {!compact && (
          <div className="mt-3 flex items-center justify-center">
            <ExerciseAnimation
              exerciseId={exercise.id}
              size={140}
              autoplay={isHovered}
              loop
              lazy
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <div
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
              difficultyColors[exercise.difficulty] ?? "bg-secondary text-secondary-foreground",
            )}
          >
            <Clock className="size-3" />
            {difficultyLabels[exercise.difficulty] ?? "Beginner"}
          </div>
          <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] capitalize">
            {exercise.category}
          </div>
          {exercise.hasAnimation && (
            <div className="bg-fitness/10 text-fitness flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px]">
              <Sparkles className="size-3" />
              Animated
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
