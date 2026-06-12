import { create } from "zustand"
import type { SleepRecord } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface SleepState {
  records: SleepRecord[]
  loading: boolean
  loadRecords: (userId: string) => Promise<void>
  addRecord: (userId: string, record: Omit<SleepRecord, "id" | "user_id" | "created_at">) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export const useSleepStore = create<SleepState>((set) => ({
  records: [],
  loading: false,
  async loadRecords(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("sleep_record")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
      if (data) set({ records: data as SleepRecord[], loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async addRecord(userId, record) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("sleep_record")
        .insert({ user_id: userId, ...record })
        .select()
        .single()
      if (data) {
        set((state) => ({ records: [data as SleepRecord, ...state.records] }))
      }
    } catch {}
  },
  async deleteRecord(id) {
    try {
      const supabase = createClient()
      await supabase.from("sleep_record").delete().eq("id", id)
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
    } catch {}
  },
}))
