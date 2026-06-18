"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useSleepStore } from "@/store"
import { sleepDuration, cn } from "@/lib/utils"
import { Moon, Clock } from "lucide-react"

const qualityConfig: Record<string, { label: string; color: string; bg: string }> = {
  poor: { label: "Poor", color: "text-red-500", bg: "bg-red-500/10" },
  fair: { label: "Fair", color: "text-amber-500", bg: "bg-amber-500/10" },
  good: { label: "Good", color: "text-fitness", bg: "bg-fitness/10" },
  great: { label: "Great", color: "text-emerald-500", bg: "bg-emerald-500/10" },
}

export function SleepSummary() {
  const records = useSleepStore((s) => s.records)

  const lastNight = useMemo(() => {
    if (records.length === 0) return null
    return records[0]
  }, [records])

  if (!lastNight) {
    return (
      <Card className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
            <Moon className="size-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">No Sleep Logged</p>
            <p className="text-muted-foreground text-xs">Log your sleep to see data here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const durationMin = sleepDuration(lastNight.started_at, lastNight.ended_at)
  const hours = Math.floor(durationMin / 60)
  const mins = durationMin % 60
  const quality = qualityConfig[lastNight.quality] ?? qualityConfig.fair

  return (
    <Card className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", quality.bg)}>
          <Moon className={cn("size-5", quality.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Last Night&apos;s Sleep</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {hours}h {mins}m
            </div>
            <span className={cn("text-xs font-medium capitalize", quality.color)}>
              {quality.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
