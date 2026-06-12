"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface SleepChartProps {
  data: { date: string; duration_hours: number; quality: string }[]
}

const qualityColors: Record<string, string> = {
  poor: "#ef4444",
  fair: "#f59e0b",
  good: "oklch(0.527 0.154 154.66)",
  great: "#3b82f6",
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-[var(--shadow-card)]">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {entry?.duration_hours?.toFixed(1)}h
      </p>
      {entry?.quality && (
        <p className="text-xs capitalize text-muted-foreground">
          Quality: {entry.quality}
        </p>
      )}
    </div>
  )
}

export default function SleepChart({ data }: SleepChartProps) {
  return (
    <div className="w-full">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Sleep Duration
      </h3>
      <div className="h-[220px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="duration_hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={qualityColors[entry.quality] ?? "#888"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
