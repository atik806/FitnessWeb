import { create } from "zustand"
import type { UserGoal } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface GoalsState {
  goals: UserGoal[]
  loading: boolean
  loadGoals: (userId: string) => Promise<void>
  addGoal: (userId: string, goal: Omit<UserGoal, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  updateGoal: (id: string, data: Partial<UserGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  loading: false,
  async loadGoals(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("user_goal")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (data) set({ goals: data as UserGoal[], loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async addGoal(userId, goal) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("user_goal")
        .insert({ user_id: userId, ...goal })
        .select()
        .single()
      if (data) {
        set((state) => ({ goals: [data as UserGoal, ...state.goals] }))
      }
    } catch {}
  },
  async updateGoal(id, data) {
    try {
      const supabase = createClient()
      await supabase.from("user_goal").update(data).eq("id", id)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
      }))
    } catch {}
  },
  async deleteGoal(id) {
    try {
      const supabase = createClient()
      await supabase.from("user_goal").delete().eq("id", id)
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
    } catch {}
  },
}))
