import { create } from "zustand"
import type { WorkoutEntry } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface WorkoutState {
  workouts: WorkoutEntry[]
  loading: boolean
  loadWorkouts: (userId: string) => Promise<void>
  addWorkout: (userId: string, workout: Omit<WorkoutEntry, "id" | "user_id" | "created_at">) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workouts: [],
  loading: false,
  async loadWorkouts(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("workout_entry")
        .select("*")
        .eq("user_id", userId)
        .order("done_at", { ascending: false })
      if (data) set({ workouts: data as WorkoutEntry[], loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async addWorkout(userId, workout) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("workout_entry")
        .insert({ user_id: userId, ...workout })
        .select()
        .single()
      if (data) {
        set((state) => ({ workouts: [data as WorkoutEntry, ...state.workouts] }))
      }
    } catch {}
  },
  async deleteWorkout(id) {
    try {
      const supabase = createClient()
      await supabase.from("workout_entry").delete().eq("id", id)
      set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }))
    } catch {}
  },
}))
