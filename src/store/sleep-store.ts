import { create } from "zustand"
import type { SleepRecord } from "@/types"
import { createClient } from "@/lib/supabase/client"

const PAGE_SIZE = 20

interface SleepState {
  records: SleepRecord[]
  loading: boolean
  hasMore: boolean
  loadRecords: (userId: string) => Promise<void>
  loadMore: (userId: string) => Promise<void>
  addRecord: (userId: string, record: Omit<SleepRecord, "id" | "user_id" | "created_at">) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export const useSleepStore = create<SleepState>((set, get) => ({
  records: [],
  loading: false,
  hasMore: true,
  async loadRecords(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("sleep_record")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(PAGE_SIZE)
      if (data) {
        set({ records: data as SleepRecord[], loading: false, hasMore: data.length === PAGE_SIZE })
      } else {
        set({ loading: false, hasMore: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  async loadMore(userId) {
    const { records } = get()
    if (records.length === 0) return
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from("sleep_record")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .lt("started_at", records[records.length - 1].started_at)
        .limit(PAGE_SIZE)
      if (data && data.length > 0) {
        set((state) => ({
          records: [...state.records, ...data as SleepRecord[]],
          hasMore: data.length === PAGE_SIZE,
        }))
      } else {
        set({ hasMore: false })
      }
    } catch {}
  },
  async addRecord(userId, record) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("sleep_record")
      .insert({ user_id: userId, ...record })
      .select()
      .single()
    if (error) throw error
    if (data) {
      set((state) => ({ records: [data as SleepRecord, ...state.records] }))
    }
  },
  async deleteRecord(id) {
    const supabase = createClient()
    await supabase.from("sleep_record").delete().eq("id", id)
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
  },
}))
