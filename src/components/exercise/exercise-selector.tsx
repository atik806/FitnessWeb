"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ExerciseBrowser } from "@/components/exercise/exercise-browser"
import { ExerciseDetail } from "@/components/exercise/exercise-detail"
import { Button } from "@/components/ui/button"
import { Check, Dumbbell, X } from "lucide-react"
import type { Exercise } from "@/types/exercise"

interface ExerciseSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercises: Exercise[]) => void
  selectedIds?: string[]
}

export function ExerciseSelector({ open, onOpenChange, onSelect }: ExerciseSelectorProps) {
  const [selected, setSelected] = useState<Map<string, Exercise>>(new Map())
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null)

  const handleSelect = (exercise: Exercise) => {
    const next = new Map(selected)
    if (next.has(exercise.id)) {
      next.delete(exercise.id)
    } else {
      next.set(exercise.id, exercise)
    }
    setSelected(next)
  }

  const handleDetailSelect = (exercise: Exercise) => {
    const next = new Map(selected)
    next.set(exercise.id, exercise)
    setSelected(next)
    setViewingExercise(null)
  }

  const confirmSelection = () => {
    onSelect(Array.from(selected.values()))
    onOpenChange(false)
  }

  const clearAll = () => {
    setSelected(new Map())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="size-4 text-fitness" />
            {viewingExercise ? viewingExercise.name : "Exercise Library"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        {viewingExercise ? (
          <ExerciseDetail
            exercise={viewingExercise}
            onBack={() => setViewingExercise(null)}
            onSelect={handleDetailSelect}
            selectLabel={
              selected.has(viewingExercise.id)
                ? "Already Selected \u2713"
                : "Add to Workout"
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {selected.size} exercise{selected.size !== 1 ? "s" : ""} selected
              </p>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3" />
                  Clear all
                </button>
              )}
            </div>

            <ExerciseBrowser
              onSelect={handleSelect}
              selectedIds={Array.from(selected.keys())}
              multiSelect
            />

            {selected.size > 0 && (
              <Button
                variant="fitness"
                size="lg"
                onClick={confirmSelection}
                className="mt-2 w-full"
              >
                <Check className="size-4" />
                Add {selected.size} Exercise{selected.size !== 1 ? "s" : ""} to Workout
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
