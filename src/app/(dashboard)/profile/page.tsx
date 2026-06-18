"use client"

import { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useProfileStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  User,
  Weight,
  Ruler,
  Cake,
  Footprints,
  Flame,
  Droplets,
  Timer,
  Palette,
  LogOut,
  Save,
  Moon,
  Sun,
  Monitor,
  Loader2,
  CheckCircle2,
  UtensilsCrossed,
  RefreshCw,
  UserCircle,
  CalendarDays,
} from "lucide-react"
import { toast } from "sonner"
import type { Session } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

const themes = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const

const macroPresets = [
  { label: "Balanced", protein: 150, carbs: 250, fat: 65 },
  { label: "Low-Carb", protein: 180, carbs: 100, fat: 85 },
  { label: "High-Protein", protein: 200, carbs: 200, fat: 55 },
  { label: "Keto", protein: 160, carbs: 50, fat: 120 },
] as const

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [joinedDate, setJoinedDate] = useState<string>("")
  const { profile, loadProfile, saveProfile } = useProfileStore()
  const { setTheme: applyTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set())

  const [name, setName] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [age, setAge] = useState("")
  const [walkGoal, setWalkGoal] = useState("")
  const [calorieGoal, setCalorieGoal] = useState("")
  const [waterGoal, setWaterGoal] = useState("")
  const [activeGoal, setActiveGoal] = useState("")
  const [proteinGoal, setProteinGoal] = useState("")
  const [carbsGoal, setCarbsGoal] = useState("")
  const [fatGoal, setFatGoal] = useState("")
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        setJoinedDate(
          new Date(session.user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        )
        loadProfile(id)
      }
    }).catch(() => {})
  }, [loadProfile])

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "")
      setWeightKg(String(profile.weight_kg ?? ""))
      setHeightCm(String(profile.height_cm ?? ""))
      setAge(String(profile.age ?? ""))
      setWalkGoal(String(profile.walk_goal_min ?? ""))
      setCalorieGoal(String(profile.calorie_goal ?? ""))
      setWaterGoal(String(profile.water_goal_l ?? ""))
      setActiveGoal(String(profile.active_goal_min ?? ""))
      setProteinGoal(String(profile.protein_goal ?? ""))
      setCarbsGoal(String(profile.carbs_goal ?? ""))
      setFatGoal(String(profile.fat_goal ?? ""))
      setTheme(profile.theme ?? "system")
      setDirtyFields(new Set())
    }
  }, [profile])

  const initials = (profile?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const avatarColor = profile?.name
    ? `hsl(${initials.charCodeAt(0) * 37 % 360}, 65%, 55%)`
    : "var(--fitness)"

  const hasChanges = dirtyFields.size > 0

  function markDirty(field: string) {
    setDirtyFields((prev) => new Set(prev).add(field))
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    try {
      await saveProfile(userId, {
        name,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        age: age ? Number(age) : undefined,
        walk_goal_min: walkGoal ? Number(walkGoal) : undefined,
        calorie_goal: calorieGoal ? Number(calorieGoal) : undefined,
        water_goal_l: waterGoal ? Number(waterGoal) : undefined,
        active_goal_min: activeGoal ? Number(activeGoal) : undefined,
        protein_goal: proteinGoal ? Number(proteinGoal) : undefined,
        carbs_goal: carbsGoal ? Number(carbsGoal) : undefined,
        fat_goal: fatGoal ? Number(fatGoal) : undefined,
        theme,
      })
      setLastSaved(new Date())
      setDirtyFields(new Set())
      toast.success("Profile saved", {
        icon: <CheckCircle2 className="size-4 text-fitness" />,
      })
    } catch {
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch {}
  }

  function handleApplyMacroPreset(preset: typeof macroPresets[number]) {
    setProteinGoal(String(preset.protein))
    setCarbsGoal(String(preset.carbs))
    setFatGoal(String(preset.fat))
    markDirty("protein_goal")
    markDirty("carbs_goal")
    markDirty("fat_goal")
    toast.success(`${preset.label} preset applied`)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      if (!saving && hasChanges) handleSave()
    }
  }, [saving, hasChanges])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground text-sm">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 pb-28">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information, daily targets, and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div
          className="flex items-center gap-5 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]"
          style={{ animation: "fade-in-up 0.35s ease-out both" }}
        >
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {initials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">{profile?.name || "User"}</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <UserCircle className="size-3.5" />
                {profile?.age || "--"} years
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="size-3.5" />
                {profile?.height_cm || "--"} cm
              </span>
              <span className="flex items-center gap-1">
                <Weight className="size-3.5" />
                {profile?.weight_kg || "--"} kg
              </span>
            </div>
            {joinedDate && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-1.5">
                <CalendarDays className="size-3" />
                Member since {joinedDate}
              </p>
            )}
          </div>
        </div>

        <Card style={{ animation: "fade-in-up 0.35s ease-out 0.05s both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-fitness" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic details for personalised fitness tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                icon={User}
                label="Full Name"
                value={name}
                onChange={(v) => { setName(v); markDirty("name") }}
                placeholder="Your name"
              />
              <Field
                icon={Cake}
                label="Age"
                value={age}
                onChange={(v) => { setAge(v); markDirty("age") }}
                type="number"
                min={1}
                max={150}
                placeholder="Years"
              />
              <Field
                icon={Weight}
                label="Weight (kg)"
                value={weightKg}
                onChange={(v) => { setWeightKg(v); markDirty("weight_kg") }}
                type="number"
                min={1}
                step={0.1}
                placeholder="kg"
              />
              <Field
                icon={Ruler}
                label="Height (cm)"
                value={heightCm}
                onChange={(v) => { setHeightCm(v); markDirty("height_cm") }}
                type="number"
                min={1}
                placeholder="cm"
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ animation: "fade-in-up 0.35s ease-out 0.1s both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Footprints className="size-4 text-fitness" />
              Daily Targets
            </CardTitle>
            <CardDescription>Set your daily fitness and nutrition goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                icon={Footprints}
                label="Walk Goal (min)"
                value={walkGoal}
                onChange={(v) => { setWalkGoal(v); markDirty("walk_goal_min") }}
                type="number"
                min={1}
                placeholder="Minutes"
              />
              <Field
                icon={Flame}
                label="Calorie Goal"
                value={calorieGoal}
                onChange={(v) => { setCalorieGoal(v); markDirty("calorie_goal") }}
                type="number"
                min={1}
                placeholder="kcal"
              />
              <Field
                icon={Droplets}
                label="Water Goal (L)"
                value={waterGoal}
                onChange={(v) => { setWaterGoal(v); markDirty("water_goal_l") }}
                type="number"
                min={0.1}
                step={0.1}
                placeholder="Liters"
              />
              <Field
                icon={Timer}
                label="Active Minutes Goal"
                value={activeGoal}
                onChange={(v) => { setActiveGoal(v); markDirty("active_goal_min") }}
                type="number"
                min={1}
                placeholder="Minutes"
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ animation: "fade-in-up 0.35s ease-out 0.15s both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UtensilsCrossed className="size-4 text-fitness" />
              Macronutrient Goals
            </CardTitle>
            <CardDescription>Daily macronutrient targets in grams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {macroPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyMacroPreset(preset)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-fitness/50 hover:text-foreground"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                icon={UtensilsCrossed}
                label="Protein (g)"
                value={proteinGoal}
                onChange={(v) => { setProteinGoal(v); markDirty("protein_goal") }}
                type="number"
                min={1}
                placeholder="g"
              />
              <Field
                icon={UtensilsCrossed}
                label="Carbs (g)"
                value={carbsGoal}
                onChange={(v) => { setCarbsGoal(v); markDirty("carbs_goal") }}
                type="number"
                min={1}
                placeholder="g"
              />
              <Field
                icon={UtensilsCrossed}
                label="Fat (g)"
                value={fatGoal}
                onChange={(v) => { setFatGoal(v); markDirty("fat_goal") }}
                type="number"
                min={1}
                placeholder="g"
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ animation: "fade-in-up 0.35s ease-out 0.2s both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="size-4 text-fitness" />
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              {themes.map((t) => {
                const Icon = t.icon
                const selected = theme === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setTheme(t.value); applyTheme(t.value); markDirty("theme") }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all",
                      selected
                        ? "border-fitness bg-fitness/10 text-fitness shadow-sm"
                        : "border-border text-muted-foreground hover:border-fitness/50 hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg transition-all duration-300 md:left-64",
          hasChanges ? "translate-y-0" : "translate-y-2 opacity-0 pointer-events-none",
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving changes...
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="size-3.5 text-fitness" />
                Saved {lastSaved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </>
            ) : (
              <>
                <div className="size-2 rounded-full bg-amber-500" />
                {dirtyFields.size} unsaved change{dirtyFields.size !== 1 ? "s" : ""}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (profile) {
                  setName(profile.name ?? "")
                  setWeightKg(String(profile.weight_kg ?? ""))
                  setHeightCm(String(profile.height_cm ?? ""))
                  setAge(String(profile.age ?? ""))
                  setWalkGoal(String(profile.walk_goal_min ?? ""))
                  setCalorieGoal(String(profile.calorie_goal ?? ""))
                  setWaterGoal(String(profile.water_goal_l ?? ""))
                  setActiveGoal(String(profile.active_goal_min ?? ""))
                  setProteinGoal(String(profile.protein_goal ?? ""))
                  setCarbsGoal(String(profile.carbs_goal ?? ""))
                  setFatGoal(String(profile.fat_goal ?? ""))
                  setTheme(profile.theme ?? "system")
                  setDirtyFields(new Set())
                }
              }}
              disabled={!hasChanges || saving}
            >
              <RefreshCw className="size-3.5" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center" style={{ animation: "fade-in-up 0.35s ease-out 0.25s both" }}>
        <Button variant="destructive" size="sm" onClick={handleSignOut} className="w-full sm:w-auto">
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

interface FieldProps {
  icon: typeof User
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

function Field({ icon: Icon, label, value, onChange, type = "text", min, max, step, placeholder }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Icon className="size-3.5" />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-fitness"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  )
}
