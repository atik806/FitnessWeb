import { create } from "zustand"
import type { WorkoutEntry } from "@/types"
import { createClient } from "@/lib/supabase/client"

const PAGE_SIZE = 20

interface WorkoutState {
  workouts: WorkoutEntry[]
  loading: boolean
  hasMore: boolean
  loadWorkouts: (userId: string) => Promise<void>
  loadMore: (userId: string) => Promise<void>
  addWorkout: (userId: string, workout: Omit<WorkoutEntry, "id" | "user_id" | "created_at">) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  loading: false,
  hasMore: true,
  async loadWorkouts(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("workout_entry")
        .select("*")
        .eq("user_id", userId)
        .order("done_at", { ascending: false })
        .limit(PAGE_SIZE)
      if (data) {
        set({ workouts: data as WorkoutEntry[], loading: false, hasMore: data.length === PAGE_SIZE })
      } else {
        set({ loading: false, hasMore: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  async loadMore(userId) {
    const { workouts } = get()
    if (workouts.length === 0) return
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("workout_entry")
        .select("*")
        .eq("user_id", userId)
        .order("done_at", { ascending: false })
        .lt("done_at", workouts[workouts.length - 1].done_at)
        .limit(PAGE_SIZE)
      if (data && data.length > 0) {
        set((state) => ({
          workouts: [...state.workouts, ...data as WorkoutEntry[]],
          hasMore: data.length === PAGE_SIZE,
        }))
      } else {
        set({ hasMore: false })
      }
    } catch {}
  },
  async addWorkout(userId, workout) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("workout_entry")
      .insert({ user_id: userId, ...workout })
      .select()
      .single()
    if (error) throw error
    if (data) {
      set((state) => ({ workouts: [data as WorkoutEntry, ...state.workouts] }))
    }
  },
  async deleteWorkout(id) {
    const supabase = createClient()
    await supabase.from("workout_entry").delete().eq("id", id)
    set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }))
  },
}))
