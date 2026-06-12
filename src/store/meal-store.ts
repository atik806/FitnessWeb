import { create } from "zustand"
import type { MealEntry } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface MealState {
  meals: MealEntry[]
  loading: boolean
  loadMeals: (userId: string, date?: string) => Promise<void>
  addMeal: (userId: string, meal: Omit<MealEntry, "id" | "user_id" | "created_at">) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
}

export const useMealStore = create<MealState>((set) => ({
  meals: [],
  loading: false,
  async loadMeals(userId, date) {
    set({ loading: true })
    const supabase = createClient()
    try {
      let query = supabase
        .from("meal_entry")
        .select("*")
        .eq("user_id", userId)
      if (date) query = query.eq("date", date)
      const { data } = await query.order("created_at", { ascending: false })
      if (data) set({ meals: data as MealEntry[], loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async addMeal(userId, meal) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("meal_entry")
        .insert({ user_id: userId, ...meal })
        .select()
        .single()
      if (data) {
        set((state) => ({ meals: [data as MealEntry, ...state.meals] }))
      }
    } catch {}
  },
  async deleteMeal(id) {
    try {
      const supabase = createClient()
      await supabase.from("meal_entry").delete().eq("id", id)
      set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }))
    } catch {}
  },
}))
