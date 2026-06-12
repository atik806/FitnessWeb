"use client"

import { useEffect, useState } from "react"
import { getGreeting } from "@/lib/utils"

interface GreetingProps {
  name?: string
}

export function Greeting({ name: propName }: GreetingProps) {
  const [name, setName] = useState(propName ?? "")
  const [greeting, setGreeting] = useState("")
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    setGreeting(getGreeting())
    const today = new Date()
    setDateStr(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    )
  }, [])

  useEffect(() => {
    if (!propName) {
      const stored = localStorage.getItem("fitness-name")
      if (stored) setName(stored)
    }
  }, [propName])

  return (
    <div className="flex flex-col gap-1" style={{ animation: "fade-in-up 0.5s ease-out both" }}>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting}
        {name ? `, ${name}!` : "!"}
      </h1>
      <p className="text-muted-foreground text-sm">{dateStr}</p>
    </div>
  )
}
