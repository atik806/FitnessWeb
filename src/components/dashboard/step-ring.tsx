"use client"

import { useEffect, useState } from "react"

interface WalkRingProps {
  minutes: number
  goal: number
}

export function WalkRing({ minutes, goal }: WalkRingProps) {
  const [animatedOffset, setAnimatedOffset] = useState(282.74)
  const radius = 72
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const clamped = Math.min(Math.max(minutes / goal, 0), 1)
  const offset = circumference * (1 - clamped)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 300)
    return () => clearTimeout(timer)
  }, [offset])

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative size-36 sm:size-[var(--ring-size)]" style={{ "--ring-size": `${radius * 2}px` } as React.CSSProperties}>
        <svg
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="size-full -rotate-90 drop-shadow-sm"
        >
          <defs>
            <linearGradient id="walk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.527 0.154 154.66)" />
              <stop offset="50%" stopColor="oklch(0.6 0.15 164.66)" />
              <stop offset="100%" stopColor="oklch(0.7 0.12 154.66)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="oklch(0.97 0 0)"
            strokeWidth={strokeWidth}
            className="dark:stroke-[oklch(0.23_0_0)] transition-colors duration-300"
          />

          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="url(#walk-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            className="transition-all duration-1000 ease-out dark:[filter:url(#glow)]"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
            {display}
          </span>
          <span className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider">
            walked
          </span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        {goal} min goal
      </p>
    </div>
  )
}
