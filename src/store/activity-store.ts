import { create } from "zustand"
import type { DailyMetric } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { getToday } from "@/lib/utils"

interface ActivityState {
  metrics: DailyMetric | null
  loading: boolean
  loadToday: (userId: string) => Promise<void>
  upsertMetrics: (userId: string, data: Partial<DailyMetric>) => Promise<void>
}

export const useActivityStore = create<ActivityState>((set) => ({
  metrics: null,
  loading: false,
  async loadToday(userId) {
    set({ loading: true })
    const supabase = createClient()
    const today = getToday()
    try {
      const { data } = await supabase
        .from("daily_metric")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle()
      if (data) set({ metrics: data as DailyMetric, loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async upsertMetrics(userId, data) {
    try {
      const supabase = createClient()
      const today = getToday()
      const { data: result } = await supabase
        .from("daily_metric")
        .upsert({ user_id: userId, date: today, ...data }, { onConflict: "user_id,date" })
        .select()
        .maybeSingle()
      if (result) set({ metrics: result as DailyMetric })
    } catch {}
  },
}))
