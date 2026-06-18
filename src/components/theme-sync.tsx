"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

export function ThemeSync() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (!session?.user) return
      supabase
        .from("user_profile")
        .select("theme")
        .eq("id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.theme && data.theme !== "system") {
            setTheme(data.theme)
          }
        })
    }).catch(() => {})
  }, [setTheme])

  return null
}
