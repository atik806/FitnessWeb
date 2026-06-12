"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useMealStore, useProfileStore } from "@/store"
import { MealForm } from "@/components/log/meal-form"
import { WaterForm } from "@/components/log/water-form"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Trash2,
  Apple,
  Droplets,
  Flame,
  UtensilsCrossed,
  Loader2,
  GlassWater,
  Coffee,
  Sun,
  Moon,
  Beef,
  Wheat,
  Droplet,
  Settings2,
} from "lucide-react"
import { getToday, cn } from "@/lib/utils"
import { toast } from "sonner"
import type { WaterIntake, MealEntry } from "@/types"

const mealTypeMeta: Record<string, { icon: typeof Apple; color: string; bg: string }> = {
  breakfast: { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
  lunch: { icon: Sun, color: "text-energy", bg: "bg-energy/10" },
  dinner: { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  snack: { icon: Apple, color: "text-fitness", bg: "bg-fitness/10" },
}

const defaultMacros = { protein: 50, carbs: 300, fat: 65 }

export default function NutritionPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [mealOpen, setMealOpen] = useState(false)
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([])
  const { meals, loading: mealsLoading, loadMeals, deleteMeal } = useMealStore()
  const { profile, loadProfile, saveProfile } = useProfileStore()
  const [editCal, setEditCal] = useState("")
  const [editProtein, setEditProtein] = useState("")
  const [editCarbs, setEditCarbs] = useState("")
  const [editFat, setEditFat] = useState("")
  const [editWalk, setEditWalk] = useState("")
  const [editWater, setEditWater] = useState("")
  const [editActive, setEditActive] = useState("")
  const today = getToday()

  const loadWater = useCallback(async (uid: string) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("water_intake")
        .select("*")
        .eq("user_id", uid)
        .eq("date", today)
        .order("created_at", { ascending: false })
      if (data) setWaterIntakes(data as WaterIntake[])
    } catch {}
  }, [today])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        loadProfile(id).catch(() => {})
        loadMeals(id, today).catch(() => {})
        loadWater(id).catch(() => {})
      }
    }).catch(() => {})
  }, [loadProfile, loadMeals, loadWater, today])

  useEffect(() => {
    if (profile) {
      setEditCal(String(profile.calorie_goal ?? 2200))
      setEditProtein(String(profile.protein_goal ?? 50))
      setEditCarbs(String(profile.carbs_goal ?? 300))
      setEditFat(String(profile.fat_goal ?? 65))
      setEditWalk(String(profile.walk_goal_min ?? 30))
      setEditWater(String(profile.water_goal_l ?? 2.5))
      setEditActive(String(profile.active_goal_min ?? 30))
    }
  }, [profile])

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein_g ?? 0), 0)
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs_g ?? 0), 0)
  const totalFat = meals.reduce((sum, m) => sum + (m.fat_g ?? 0), 0)
  const totalWater = waterIntakes.reduce((sum, w) => sum + w.amount_l, 0)
  const calorieGoal = profile?.calorie_goal ?? 2200
  const waterGoal = profile?.water_goal_l ?? 2.5

  const proteinGoal = profile?.protein_goal ?? defaultMacros.protein
  const carbsGoal = profile?.carbs_goal ?? defaultMacros.carbs
  const fatGoal = profile?.fat_goal ?? defaultMacros.fat
  const calPercent = Math.min((totalCalories / calorieGoal) * 100, 100)
  const proteinPct = Math.min((totalProtein / proteinGoal) * 100, 100)
  const carbsPct = Math.min((totalCarbs / carbsGoal) * 100, 100)
  const fatPct = Math.min((totalFat / fatGoal) * 100, 100)
  const waterPercent = Math.min((totalWater / waterGoal) * 100, 100)

  async function handleDeleteWater(id: string) {
    try {
      const supabase = createClient()
      await supabase.from("water_intake").delete().eq("id", id)
      setWaterIntakes((prev) => prev.filter((w) => w.id !== id))
      toast.success("Water entry deleted")
    } catch {
      toast.error("Failed to delete water entry")
    }
  }

  async function handleDeleteMeal(id: string) {
    try {
      await deleteMeal(id)
      toast.success("Meal deleted")
    } catch {
      toast.error("Failed to delete meal")
    }
  }

  async function handleSaveGoals() {
    if (!userId) return
    try {
      await saveProfile(userId, {
        calorie_goal: Number(editCal),
        protein_goal: Number(editProtein),
        carbs_goal: Number(editCarbs),
        fat_goal: Number(editFat),
        walk_goal_min: Number(editWalk),
        water_goal_l: Number(editWater),
        active_goal_min: Number(editActive),
      })
      toast.success("Targets updated")
    } catch {
      toast.error("Failed to save targets")
    }
  }

  function MacroBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = Math.min((value / max) * 100, 100)
    return (
      <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    )
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">Nutrition</h1>
        <p className="text-muted-foreground text-sm">{today}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-energy">
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="size-7 shrink-0 text-energy" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium">Calories</span>
                <span className="text-sm font-bold tabular-nums">{totalCalories} / {calorieGoal}</span>
              </div>
              <div className="bg-secondary mt-1.5 h-2 w-full overflow-hidden rounded-full">
                <div className={cn("h-full rounded-full transition-all duration-700", calPercent >= 100 ? "bg-fitness" : "bg-energy")} style={{ width: `${calPercent}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-fitness">
          <CardContent className="flex items-center gap-3 p-4">
            <Beef className="size-7 shrink-0 text-fitness" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium">Protein</span>
                <span className="text-sm font-bold tabular-nums">{totalProtein.toFixed(1)} / {proteinGoal}g</span>
              </div>
              <MacroBar value={totalProtein} max={proteinGoal} color="bg-fitness" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-energy">
          <CardContent className="flex items-center gap-3 p-4">
            <Wheat className="size-7 shrink-0 text-energy" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium">Carbs</span>
                <span className="text-sm font-bold tabular-nums">{totalCarbs.toFixed(1)} / {carbsGoal}g</span>
              </div>
              <MacroBar value={totalCarbs} max={carbsGoal} color="bg-energy" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="flex items-center gap-3 p-4">
            <Droplet className="size-7 shrink-0 text-sky-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground text-xs font-medium">Fat</span>
                <span className="text-sm font-bold tabular-nums">{totalFat.toFixed(1)} / {fatGoal}g</span>
              </div>
              <MacroBar value={totalFat} max={fatGoal} color="bg-sky-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Daily Targets</h3>
            <Button size="xs" onClick={handleSaveGoals}>
              <Settings2 className="size-3" />
              Save
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-7">
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Calories</label>
              <input type="number" min={1} value={editCal} onChange={(e) => setEditCal(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Protein (g)</label>
              <input type="number" min={1} value={editProtein} onChange={(e) => setEditProtein(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Carbs (g)</label>
              <input type="number" min={1} value={editCarbs} onChange={(e) => setEditCarbs(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Fat (g)</label>
              <input type="number" min={1} value={editFat} onChange={(e) => setEditFat(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Walk (min)</label>
              <input type="number" min={1} value={editWalk} onChange={(e) => setEditWalk(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Water (L)</label>
              <input type="number" min={0.1} step={0.1} value={editWater} onChange={(e) => setEditWater(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">Active (min)</label>
              <input type="number" min={1} value={editActive} onChange={(e) => setEditActive(e.target.value)}
                className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-all focus:ring-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section style={{ animation: "fade-in-up 0.5s ease-out both" }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-fitness/10">
                <UtensilsCrossed className="size-4 text-fitness" />
              </div>
              <h2 className="text-lg font-semibold">Meals</h2>
            </div>
            <Dialog open={mealOpen} onOpenChange={setMealOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Meal</DialogTitle>
                </DialogHeader>
                <MealForm userId={userId} onSuccess={() => { setMealOpen(false); loadMeals(userId, today) }} />
              </DialogContent>
            </Dialog>
          </div>

          {mealsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-fitness/10">
                <Apple className="size-6 text-fitness" />
              </div>
              <p className="text-sm text-muted-foreground">No meals logged today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {meals.map((meal, i) => {
                const meta = mealTypeMeta[meal.meal_type] ?? mealTypeMeta.snack
                const Icon = meta.icon
                return (
                  <Card
                    key={meal.id}
                    className="transition-all hover:shadow-[var(--shadow-card-hover)]"
                    style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.05}s both` }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
                            <Icon className={cn("size-4", meta.color)} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{meal.name}</p>
                            <p className="text-muted-foreground text-xs">{meal.calories} kcal</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {(meal.protein_g ?? 0) > 0 && (
                            <span className="text-fitness bg-fitness/10 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums">{meal.protein_g}P</span>
                          )}
                          {(meal.carbs_g ?? 0) > 0 && (
                            <span className="text-energy bg-energy/10 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums">{meal.carbs_g}C</span>
                          )}
                          {(meal.fat_g ?? 0) > 0 && (
                            <span className="text-sky-500 bg-sky-500/10 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums">{meal.fat_g}F</span>
                          )}
                          <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteMeal(meal.id)}>
                            <Trash2 className="size-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {(meal.protein_g ?? 0) > 0 || (meal.carbs_g ?? 0) > 0 || (meal.fat_g ?? 0) > 0 ? (
                        <div className="mt-2 flex gap-2">
                          {(meal.protein_g ?? 0) > 0 && (
                            <div className="flex-1">
                              <div className="bg-secondary h-1 w-full overflow-hidden rounded-full">
                                <div className="bg-fitness h-full rounded-full" style={{ width: `${Math.min((meal.protein_g! / proteinGoal) * 100, 100)}%` }} />
                              </div>
                            </div>
                          )}
                          {(meal.carbs_g ?? 0) > 0 && (
                            <div className="flex-1">
                              <div className="bg-secondary h-1 w-full overflow-hidden rounded-full">
                                <div className="bg-energy h-full rounded-full" style={{ width: `${Math.min((meal.carbs_g! / carbsGoal) * 100, 100)}%` }} />
                              </div>
                            </div>
                          )}
                          {(meal.fat_g ?? 0) > 0 && (
                            <div className="flex-1">
                              <div className="bg-secondary h-1 w-full overflow-hidden rounded-full">
                                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min((meal.fat_g! / fatGoal) * 100, 100)}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <section style={{ animation: "fade-in-up 0.5s ease-out 0.1s both" }}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10">
              <Droplets className="size-4 text-sky-500" />
            </div>
            <h2 className="text-lg font-semibold">Water</h2>
          </div>

          <Card className="mb-4 border-l-4 border-l-sky-500">
            <CardContent className="flex items-center gap-4 p-4">
              <GlassWater className="size-8 text-sky-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">Total Water</span>
                  <span className="text-lg font-bold tabular-nums shrink-0">
                    {totalWater.toFixed(1)}L / {waterGoal}L
                  </span>
                </div>
                <div className="bg-secondary mt-2 h-2.5 w-full overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      waterPercent >= 100 ? "bg-fitness" : "bg-sky-500",
                    )}
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium">Quick Add</h3>
              <WaterForm userId={userId} onSuccess={() => loadWater(userId)} />
            </CardContent>
          </Card>

          <h3 className="mb-2 text-sm font-medium">Today&apos;s Entries</h3>
          {waterIntakes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-sky-500/10">
                <Droplets className="size-6 text-sky-500" />
              </div>
              <p className="text-sm text-muted-foreground">No water logged today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waterIntakes.map((entry, i) => (
                <Card
                  key={entry.id}
                  className="transition-all hover:shadow-[var(--shadow-card-hover)]"
                  style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.05}s both` }}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10">
                        <Droplets className="size-4 text-sky-500" />
                      </div>
                      <p className="text-sm font-medium">{entry.amount_l}L</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteWater(entry.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
