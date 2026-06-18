"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"

interface AuthState {
  userId: string | null
  loading: boolean
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  loading: true,
  async fetchUser() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      set({ userId: session?.user?.id ?? null, loading: false })
    } catch {
      set({ userId: null, loading: false })
    }
  },
}))
