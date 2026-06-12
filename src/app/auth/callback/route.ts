import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existing } = await supabase
          .from("user_profile")
          .select("id")
          .eq("id", user.id)
          .maybeSingle()

        if (!existing) {
          await supabase.from("user_profile").upsert({
            id: user.id,
            name: user.user_metadata?.name ?? "User",
            weight_kg: 70,
            height_cm: 175,
            age: 25,
            walk_goal_min: 30,
            calorie_goal: 2200,
            water_goal_l: 2.5,
            active_goal_min: 30,
          })
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
