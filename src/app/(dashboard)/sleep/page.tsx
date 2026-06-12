"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSleepStore } from "@/store"
import { SleepForm } from "@/components/log/sleep-form"
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
  Moon,
  Sun,
  Clock,
  Loader2,
} from "lucide-react"
import { sleepDuration, formatDate, formatTime, cn } from "@/lib/utils"
import { toast } from "sonner"

const qualityConfig: Record<string, { label: string; color: string; bar: string }> = {
  poor: { label: "Poor", color: "text-red-500", bar: "bg-red-500" },
  fair: { label: "Fair", color: "text-amber-500", bar: "bg-amber-500" },
  good: { label: "Good", color: "text-fitness", bar: "bg-fitness" },
  great: { label: "Great", color: "text-emerald-500", bar: "bg-emerald-500" },
}

export default function SleepPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { records, loading, loadRecords, deleteRecord } = useSleepStore()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const id = session.user.id
        setUserId(id)
        loadRecords(id)
      }
    }).catch(() => {})
  }, [loadRecords])

  async function handleDelete(id: string) {
    try {
      await deleteRecord(id)
      toast.success("Sleep record deleted")
    } catch {}
  }

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
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
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sleep</h1>
          <p className="text-muted-foreground text-sm">
            {records.length} record{records.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Sleep</DialogTitle>
            </DialogHeader>
            <SleepForm userId={userId} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Moon className="size-8 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No sleep records yet</p>
            <p className="text-muted-foreground mt-1 text-xs">Log your first night of sleep</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Log Your First Night
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {records.map((record, i) => {
            const durationMin = sleepDuration(record.started_at, record.ended_at)
            const quality = qualityConfig[record.quality] ?? qualityConfig.fair
            const startTime = new Date(record.started_at)
            const endTime = new Date(record.ended_at)
            const startHours = startTime.getHours() + startTime.getMinutes() / 60
            const endHours = endTime.getHours() + endTime.getMinutes() / 60
            const nightStart = 20
            const nightEnd = 12
            const totalNight = 24 - nightStart + nightEnd
            const startPos = ((startHours >= nightStart ? startHours - nightStart : 24 - nightStart + startHours) / totalNight) * 100
            const endPos = ((endHours >= nightStart ? endHours - nightStart : 24 - nightStart + endHours) / totalNight) * 100

            return (
              <Card
                key={record.id}
                className="transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
                style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.05}s both` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Moon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {formatDuration(durationMin)}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(record.started_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="bg-secondary/50 relative my-3 h-6 w-full overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full transition-all", quality.bar)}
                      style={{
                        marginLeft: `${startPos}%`,
                        width: `${Math.max(endPos - startPos, 2)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Sun className="size-3" />
                      Bed: {formatTime(record.started_at)}
                    </div>
                    <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Sun className="size-3" />
                      Wake: {formatTime(record.ended_at)}
                    </div>
                    <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <Clock className="size-3" />
                      {durationMin} min
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={cn("text-xs font-medium capitalize", quality.color)}>
                      {quality.label}
                    </span>
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
