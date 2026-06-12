"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface CaloriesChartProps {
  data: { date: string; calories: number }[]
  title: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-[var(--shadow-card)]">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">
        {payload[0].value.toLocaleString()} kcal
      </p>
    </div>
  )
}

export default function CaloriesChart({ data, title }: CaloriesChartProps) {
  return (
    <div className="w-full">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="h-[220px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="calories"
            stroke="oklch(0.705 0.213 47.6)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.705 0.213 47.6)", r: 4 }}
            activeDot={{ r: 6, fill: "oklch(0.705 0.213 47.6)" }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
