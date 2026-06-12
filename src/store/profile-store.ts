import { create } from "zustand"
import type { UserProfile } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  loadProfile: (userId: string) => Promise<void>
  saveProfile: (userId: string, data: Partial<UserProfile>) => Promise<UserProfile>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  async loadProfile(userId) {
    set({ loading: true })
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
      if (error) throw error
      if (data) set({ profile: data as UserProfile, loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },
  async saveProfile(userId, data) {
    const supabase = createClient()
    const { data: result, error } = await supabase
      .from("user_profile")
      .upsert({ id: userId, ...data })
      .select()
      .single()
    if (error) throw error
    const updated = result as UserProfile
    set({ profile: updated })
    return updated
  },
  clearProfile() {
    set({ profile: null })
  },
}))

