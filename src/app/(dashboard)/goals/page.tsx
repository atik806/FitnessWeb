"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useGoalsStore } from "@/store"
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
  Target,
  CheckCircle2,
  Circle,
  Flag,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { UserGoal } from "@/types"

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  steps: { label: "Walk (min)", color: "text-blue-500", bg: "bg-blue-500/10" },
  water: { label: "Water", color: "text-sky-500", bg: "bg-sky-500/10" },
  calories: { label: "Calories", color: "text-orange-500", bg: "bg-orange-500/10" },
  active_minutes: { label: "Active Minutes", color: "text-amber-500", bg: "bg-amber-500/10" },
  distance: { label: "Distance", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  weight: { label: "Weight", color: "text-purple-500", bg: "bg-purple-500/10" },
  workouts: { label: "Workouts", color: "text-rose-500", bg: "bg-rose-500/10" },
}

const periodLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

const categoryIcons: Record<string, string> = {
  steps: "👟",
  water: "💧",
  calories: "🔥",
  active_minutes: "⏱",
  distance: "📏",
  weight: "⚖️",
  workouts: "💪",
}

export default function GoalsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { goals, loading, loadGoals, addGoal, updateGoal, deleteGoal } = useGoalsStore()

  const [formData, setFormData] = useState({
    title: "",
    category: "steps" as UserGoal["category"],
    target: 30,
    current: 0,
    unit: "min",
    period: "daily" as UserGoal["period"],
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        loadGoals(id)
      }
    }).catch(() => {})
  }, [loadGoals])

  async function handleAddGoal() {
    if (!formData.title || !formData.target) return
    try {
      await addGoal(userId!, {
        title: formData.title,
        category: formData.category,
        target: Number(formData.target),
        current: Number(formData.current),
        unit: formData.unit,
        period: formData.period,
        completed: false,
      })
      setOpen(false)
      setFormData({
        title: "",
        category: "steps",
        target: 30,
        current: 0,
        unit: "min",
        period: "daily",
      })
      toast.success("Goal created")
    } catch {}
  }

  async function handleToggleCompleted(goal: UserGoal) {
    try {
      await updateGoal(goal.id, { completed: !goal.completed })
      toast.success(goal.completed ? "Goal unmarked" : "Goal completed!")
    } catch {}
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal(id)
      toast.success("Goal deleted")
    } catch {}
  }

  const completedCount = goals.filter((g) => g.completed).length
  const totalCount = goals.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Goal</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddGoal()
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Run 5km daily"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as UserGoal["category"] })}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="steps">Walk (min)</option>
                    <option value="water">Water</option>
                    <option value="calories">Calories</option>
                    <option value="active_minutes">Active Minutes</option>
                    <option value="distance">Distance</option>
                    <option value="weight">Weight</option>
                    <option value="workouts">Workouts</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as UserGoal["period"] })}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Target</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    required
                    min={1}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Current</label>
                  <input
                    type="number"
                    value={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: Number(e.target.value) })}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. km, min, L"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-l-4 border-l-fitness">
        <CardContent className="flex items-center gap-4 p-4">
          <Flag className="size-8 text-fitness shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-lg font-bold tabular-nums shrink-0">{completionRate}%</span>
            </div>
            <div className="bg-secondary mt-2 h-2.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-fitness h-full rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {completedCount} of {totalCount} goals completed
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-fitness/10">
            <Target className="size-8 text-fitness" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No goals yet</p>
            <p className="text-muted-foreground mt-1 text-xs">Create your first goal to get started</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal, i) => {
            const progress = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0
            const cat = categoryConfig[goal.category] ?? { color: "text-muted-foreground", bg: "bg-secondary" }
            const emoji = categoryIcons[goal.category] ?? "🎯"
            return (
              <Card
                key={goal.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]",
                  goal.completed && "opacity-60",
                )}
                style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.05}s both` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          cat.bg,
                        )}
                      >
                        <span className="text-lg">{emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className={cn("font-semibold truncate", goal.completed && "line-through")}>
                          {goal.title}
                        </h3>
                        <p className="text-muted-foreground text-xs capitalize">
                          {goal.category.replace(/_/g, " ")} &middot; {periodLabels[goal.period] ?? goal.period}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleCompleted(goal)}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="size-4 text-fitness" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="tabular-nums">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className={cn("text-xs font-medium", progress >= 100 ? "text-fitness" : "text-muted-foreground")}>
                        {progress}%
                      </span>
                    </div>
                    <div className="bg-secondary mt-1.5 h-2 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          progress >= 100
                            ? "bg-fitness"
                            : "bg-primary",
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={async () => {
                          const next = prompt("Update current value:", String(goal.current))
                          if (next && !isNaN(Number(next))) {
                            try { await updateGoal(goal.id, { current: Number(next) }) } catch {}
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline transition-colors"
                      >
                        Update progress
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
