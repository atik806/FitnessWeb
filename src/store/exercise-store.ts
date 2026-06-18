import { create } from "zustand"
import type { Exercise } from "@/types/exercise"
import {
  curatedExercises,
  getExercisesByMuscle,
} from "@/lib/exercise-library"

interface ExerciseStoreState {
  exercises: Exercise[]
  filteredExercises: Exercise[]
  searchQuery: string
  selectedMuscle: string | null
  selectedCategory: string | null
  loading: boolean
  setSearchQuery: (query: string) => void
  setSelectedMuscle: (muscle: string | null) => void
  setSelectedCategory: (category: string | null) => void
  filterExercises: () => void
}

export const useExerciseStore = create<ExerciseStoreState>((set, get) => ({
  exercises: curatedExercises,
  filteredExercises: curatedExercises,
  searchQuery: "",
  selectedMuscle: null,
  selectedCategory: null,
  loading: false,

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    get().filterExercises()
  },

  setSelectedMuscle: (muscle: string | null) => {
    set({ selectedMuscle: muscle })
    get().filterExercises()
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category })
    get().filterExercises()
  },

  filterExercises: () => {
    const { exercises, searchQuery, selectedMuscle, selectedCategory } = get()
    let filtered = exercises

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(lower) ||
          ex.primaryMuscle.toLowerCase().includes(lower) ||
          ex.secondaryMuscles.some((m) => m.toLowerCase().includes(lower)) ||
          ex.description.toLowerCase().includes(lower),
      )
    }

    if (selectedMuscle) {
      filtered = getExercisesByMuscle(selectedMuscle)
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (ex) =>
            ex.name.toLowerCase().includes(lower) ||
            ex.description.toLowerCase().includes(lower),
        )
      }
    }

    if (selectedCategory) {
      filtered = filtered.filter((ex) => ex.category === selectedCategory)
    }

    set({ filteredExercises: filtered })
  },
}))
