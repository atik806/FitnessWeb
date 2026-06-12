"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useSleepStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Clock } from "lucide-react"
import { sleepDuration, cn, nowLocal } from "@/lib/utils"

const sleepSchema = z.object({
  started_at: z.string().min(1, "Start time is required"),
  ended_at: z.string().min(1, "End time is required"),
  quality: z.enum(["poor", "fair", "good", "great"]),
})

type SleepFormData = z.infer<typeof sleepSchema>

interface SleepFormProps {
  userId: string
  onSuccess: () => void
}

const qualityOptions = [
  { value: "poor", label: "Poor", color: "border-red-500/30 text-red-500 bg-red-500/5" },
  { value: "fair", label: "Fair", color: "border-amber-500/30 text-amber-500 bg-amber-500/5" },
  { value: "good", label: "Good", color: "border-fitness/30 text-fitness bg-fitness/5" },
  { value: "great", label: "Great", color: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" },
] as const

export function SleepForm({ userId, onSuccess }: SleepFormProps) {
  const { addRecord } = useSleepStore()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SleepFormData>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      started_at: nowLocal(),
      ended_at: nowLocal(),
      quality: "good",
    },
  })

  const startedAt = watch("started_at")
  const endedAt = watch("ended_at")

  let durationHours: number | null = null
  if (startedAt && endedAt) {
    try {
      durationHours = sleepDuration(startedAt, endedAt) / 60
    } catch {
      // invalid dates, ignore
    }
  }

  const onSubmit = async (data: SleepFormData) => {
    try {
      const toISO = (v: string) => new Date(v).toISOString()
      await addRecord(userId, {
        started_at: toISO(data.started_at),
        ended_at: toISO(data.ended_at),
        quality: data.quality,
      })
      toast.success("Sleep logged!")
      onSuccess()
    } catch {
      toast.error("Failed to log sleep")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="started_at" className="text-foreground text-sm font-medium">
          Bedtime
        </label>
        <input
          id="started_at"
          type="datetime-local"
          {...register("started_at")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.started_at && (
          <p className="text-destructive text-xs">{errors.started_at.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ended_at" className="text-foreground text-sm font-medium">
          Wake-up Time
        </label>
        <input
          id="ended_at"
          type="datetime-local"
          {...register("ended_at")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.ended_at && (
          <p className="text-destructive text-xs">{errors.ended_at.message}</p>
        )}
      </div>

      {durationHours !== null && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-500/10 bg-indigo-500/5 px-3 py-2 text-sm font-medium text-indigo-500">
          <Clock className="size-4" />
          {durationHours >= 1
            ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
            : `${Math.round(durationHours * 60)}m`}{" "}
          of sleep
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">Quality</label>
        <div className="flex flex-wrap gap-2">
          {qualityOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all has-checked:font-medium",
                "has-checked:bg-opacity-100",
                opt.color,
              )}
            >
              <input
                type="radio"
                value={opt.value}
                {...register("quality")}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.quality && (
          <p className="text-destructive text-xs">{errors.quality.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Saving..." : "Log Sleep"}
      </Button>
    </form>
  )
}
