"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getToday, formatDate, cn } from "@/lib/utils"
import {
  Dumbbell,
  Footprints,
  Flame,
  Moon,
  Loader2,
} from "lucide-react"
import CaloriesChart from "@/components/charts/calories-chart"
import WalkChart from "@/components/charts/walk-chart"
import WaterChart from "@/components/charts/water-chart"
import SleepChart from "@/components/charts/sleep-chart"

type Period = 7 | 30 | 90

interface Stats {
  totalWorkouts: number
  avgWalkMin: number
  avgCalories: number
  avgSleep: number
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>(7)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    avgWalkMin: 0,
    avgCalories: 0,
    avgSleep: 0,
  })
  const [calorieData, setCalorieData] = useState<{ date: string; calories: number }[]>([])
  const [walkData, setWalkData] = useState<{ date: string; walk_min: number }[]>([])
  const [waterData, setWaterData] = useState<{ date: string; water_l: number }[]>([])
  const [sleepData, setSleepData] = useState<{ date: string; duration_hours: number; quality: string }[]>([])
  const [walkGoal, setWalkGoal] = useState(30)

  const displayToday = useMemo(() => getToday(), [])
  const displayStartDate = useMemo(
    () => new Date(Date.now() - period * 86400000).toISOString().split("T")[0],
    [period]
  )

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const today = getToday()
        const startDate = new Date(Date.now() - period * 86400000).toISOString().split("T")[0]

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const [
          { data: metrics },
          { data: workouts },
          { data: sleepRecords },
          { data: profile },
        ] = await Promise.all([
          supabase
            .from("daily_metric")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", startDate)
            .lte("date", today)
            .order("date", { ascending: true }),
          supabase
            .from("workout_entry")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("done_at", startDate)
            .lte("done_at", `${today}T23:59:59`) as any,
          supabase
            .from("sleep_record")
            .select("*")
            .eq("user_id", user.id)
            .gte("started_at", startDate)
            .lte("started_at", `${today}T23:59:59`)
            .order("started_at", { ascending: true }),
          supabase
            .from("user_profile")
            .select("walk_goal_min")
            .eq("id", user.id)
            .maybeSingle(),
        ])

        if (profile?.walk_goal_min) setWalkGoal(profile.walk_goal_min)

        const totalWorkouts = (workouts as any)?.count ?? 0

        const walkArr: { date: string; walk_min: number }[] = []
        const calArr: { date: string; calories: number }[] = []
        const waterArr: { date: string; water_l: number }[] = []

        let totalWalkMin = 0
        let totalCalories = 0
        let metricCount = 0

        if (metrics) {
          for (const m of metrics) {
            const dateLabel = formatDate(m.date)
            walkArr.push({ date: dateLabel, walk_min: m.walk_min })
            calArr.push({ date: dateLabel, calories: m.calories })
            waterArr.push({ date: dateLabel, water_l: m.water_l })
            totalWalkMin += m.walk_min
            totalCalories += m.calories
            metricCount++
          }
        }

        const sleepArr: { date: string; duration_hours: number; quality: string }[] = []
        let totalSleep = 0
        let sleepCount = 0

        if (sleepRecords) {
          for (const s of sleepRecords) {
            const start = new Date(s.started_at).getTime()
            let end = new Date(s.ended_at).getTime()
            if (end <= start) end += 86400000
            const hours = (end - start) / 3600000
            const dateLabel = formatDate(s.started_at)
            sleepArr.push({ date: dateLabel, duration_hours: Math.round(hours * 10) / 10, quality: s.quality })
            totalSleep += hours
            sleepCount++
          }
        }

        setWalkData(walkArr)
        setCalorieData(calArr)
        setWaterData(waterArr)
        setSleepData(sleepArr)
        setStats({
          totalWorkouts,
          avgWalkMin: metricCount ? Math.round(totalWalkMin / metricCount) : 0,
          avgCalories: metricCount ? Math.round(totalCalories / metricCount) : 0,
          avgSleep: sleepCount ? Math.round((totalSleep / sleepCount) * 10) / 10 : 0,
        })
      } catch (e) {
        console.error("Failed to load stats", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(displayStartDate)} &ndash; {formatDate(displayToday)}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1 overflow-x-auto">
          {([7, 30, 90] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                period === p
                  ? "bg-background text-foreground shadow-[var(--shadow-card)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Workouts", value: stats.totalWorkouts, icon: Dumbbell, color: "text-fitness" },
          { label: "Avg Walk", value: `${stats.avgWalkMin} min`, icon: Footprints, color: "text-blue-500" },
          { label: "Avg Calories", value: stats.avgCalories.toLocaleString(), icon: Flame, color: "text-energy" },
          { label: "Avg Sleep", value: `${stats.avgSleep}h`, icon: Moon, color: "text-indigo-500" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.05}s both` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={cn("size-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <CaloriesChart data={calorieData} title="Calories Trend" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <WalkChart data={walkData} goal={walkGoal} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <WaterChart data={waterData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <SleepChart data={sleepData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
