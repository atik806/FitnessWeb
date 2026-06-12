"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  goal: number
  progress: number
  unit: string
  delay?: number
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  goal,
  progress,
  unit,
  delay = 0,
}: MetricCardProps) {
  const clamped = Math.min(Math.max(progress, 0), 100)

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
      style={{ animation: `fade-in-up 0.5s ease-out ${delay}s both` }}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg transition-colors duration-300",
            clamped >= 100
              ? "bg-fitness/10 text-fitness group-hover:bg-fitness group-hover:text-white"
              : clamped >= 50
                ? "bg-energy/10 text-energy group-hover:bg-energy group-hover:text-white"
                : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </div>
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-muted-foreground text-xs">
          / {goal} {unit}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            clamped >= 100
              ? "bg-fitness"
              : clamped >= 75
                ? "bg-fitness-dark"
                : clamped >= 50
                  ? "bg-energy"
                  : "bg-energy-dark",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
