"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"

interface WalkChartProps {
  data: { date: string; walk_min: number }[]
  goal: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const h = Math.floor(val / 60)
  const m = val % 60
  const display = h > 0 ? `${h}h ${m}m` : `${m}m`
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-[var(--shadow-card)]">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {display} walked
      </p>
    </div>
  )
}

export default function WalkChart({ data, goal }: WalkChartProps) {
  return (
    <div className="w-full">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Daily Walk Time
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
          <ReferenceLine
            y={goal}
            stroke="oklch(0.527 0.154 154.66)"
            strokeDasharray="5 5"
            label={{
              value: `Goal: ${goal} min`,
              position: "right",
              fontSize: 12,
              fill: "var(--muted-foreground)",
            }}
          />
          <Bar dataKey="walk_min" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.walk_min >= goal ? "oklch(0.527 0.154 154.66)" : "oklch(0.705 0.213 47.6)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
