"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ExerciseBrowser } from "@/components/exercise/exercise-browser"
import type { Session } from "@supabase/supabase-js"
import { Dumbbell, Loader2 } from "lucide-react"

export default function ExercisesPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        setUserId(session.user.id)
      }
    }).catch(() => {})
  }, [])

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-fitness/10">
            <Dumbbell className="size-5 text-fitness" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Exercise Library</h1>
            <p className="text-muted-foreground text-sm">
              Browse exercises with animated demonstrations
            </p>
          </div>
        </div>
      </div>

      <ExerciseBrowser />
    </div>
  )
}
