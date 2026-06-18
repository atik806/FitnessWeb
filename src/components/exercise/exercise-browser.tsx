"use client"

import { useState } from "react"
import { useExerciseStore } from "@/store"
import { ExerciseCard } from "@/components/exercise/exercise-card"
import { muscleGroups } from "@/lib/exercise-library"
import { Search, Filter, Dumbbell, X } from "lucide-react"
import type { Exercise } from "@/types/exercise"

interface ExerciseBrowserProps {
  onSelect?: (exercise: Exercise) => void
  selectedIds?: string[]
  multiSelect?: boolean
}

const categories = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "stretching", label: "Stretching" },
  { value: "plyometrics", label: "Plyometrics" },
]

export function ExerciseBrowser({ onSelect, selectedIds = [], multiSelect = false }: ExerciseBrowserProps) {
  const {
    filteredExercises,
    searchQuery,
    setSearchQuery,
    selectedMuscle,
    setSelectedMuscle,
    selectedCategory,
    setSelectedCategory,
  } = useExerciseStore()

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set(selectedIds))

  const handleSelect = (exercise: Exercise) => {
    if (multiSelect) {
      const next = new Set(selectedExercises)
      if (next.has(exercise.id)) {
        next.delete(exercise.id)
      } else {
        next.add(exercise.id)
      }
      setSelectedExercises(next)
      onSelect?.(exercise)
    } else {
      onSelect?.(exercise)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedMuscle(null)
    setSelectedCategory(null)
  }

  const hasFilters = searchQuery || selectedMuscle || selectedCategory

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none transition-all focus:ring-3"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="size-3" />
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedMuscle(null)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            !selectedMuscle
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          All
        </button>
        {muscleGroups.map((muscle) => (
          <button
            key={muscle.id}
            type="button"
            onClick={() => setSelectedMuscle(muscle.id)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
              selectedMuscle === muscle.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {muscle.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            !selectedCategory
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          All Types
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
              selectedCategory === cat.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-fitness/10">
            <Dumbbell className="size-7 text-fitness" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No exercises found</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Try adjusting your search or filters
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-fitness text-xs font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise, i) => (
            <div
              key={exercise.id}
              style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.03}s both` }}
            >
              <ExerciseCard
                exercise={exercise}
                selected={selectedExercises.has(exercise.id)}
                onSelect={multiSelect ? handleSelect : onSelect}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
