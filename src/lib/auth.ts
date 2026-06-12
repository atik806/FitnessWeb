"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error

  if (data.session) {
    await supabase.from("user_profile").upsert({
      id: data.user!.id,
      name,
      weight_kg: 70,
      height_cm: 175,
      age: 25,
      walk_goal_min: 30,
      calorie_goal: 2200,
      water_goal_l: 2.5,
      active_goal_min: 30,
      protein_goal: 50,
      carbs_goal: 300,
      fat_goal: 65,
    })
  }

  return { session: !!data.session }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL ?? ""
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback` },
  })
  if (error) throw error
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
