"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useWorkoutStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Dumbbell, Footprints, Bike, PersonStanding, Activity } from "lucide-react"
import { nowLocal } from "@/lib/utils"

const workoutSchema = z.object({
  type: z.enum(["running", "walking", "cycling", "strength", "yoga", "custom"]),
  duration_min: z.number().min(1, "Duration must be at least 1 minute"),
  distance_km: z.number().min(0).nullable().optional(),
  intensity: z.enum(["easy", "moderate", "hard", "maximum"]).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  done_at: z.string().min(1, "Date & time is required"),
})

type WorkoutFormData = z.infer<typeof workoutSchema>

interface WorkoutFormProps {
  userId: string
  onSuccess: () => void
}

const typeOptions = [
  { value: "running", label: "Running", icon: Footprints },
  { value: "walking", label: "Walking", icon: PersonStanding },
  { value: "cycling", label: "Cycling", icon: Bike },
  { value: "strength", label: "Strength", icon: Dumbbell },
  { value: "yoga", label: "Yoga", icon: Activity },
  { value: "custom", label: "Custom", icon: Activity },
] as const

const intensityOptions = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "maximum", label: "Maximum" },
] as const

export function WorkoutForm({ userId, onSuccess }: WorkoutFormProps) {
  const { addWorkout } = useWorkoutStore()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      type: "running",
      duration_min: 30,
      done_at: nowLocal(),
    },
  })

  const selectedType = watch("type")
  const showDistance = ["running", "walking", "cycling"].includes(selectedType)

  const onSubmit = async (data: WorkoutFormData) => {
    try {
      const doneAtISO = new Date(data.done_at).toISOString()
      await addWorkout(userId, {
        type: data.type,
        duration_min: data.duration_min,
        distance_km: showDistance ? (data.distance_km ?? null) : null,
        intensity: data.intensity ?? null,
        notes: data.notes ?? null,
        done_at: doneAtISO,
      })
      toast.success("Workout logged!")
      onSuccess()
    } catch {
      toast.error("Failed to log workout")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">Type</label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => {
            const Icon = opt.icon
            const selected = selectedType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("type", opt.value, { shouldValidate: true })}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {opt.label}
              </button>
            )
          })}
        </div>
        {errors.type && (
          <p className="text-destructive text-xs">{errors.type.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="duration_min" className="text-foreground text-sm font-medium">
          Duration (minutes)
        </label>
        <input
          id="duration_min"
          type="number"
          min={1}
          {...register("duration_min", { valueAsNumber: true })}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.duration_min && (
          <p className="text-destructive text-xs">{errors.duration_min.message}</p>
        )}
      </div>

      {showDistance && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="distance_km" className="text-foreground text-sm font-medium">
            Distance (km)
          </label>
          <input
            id="distance_km"
            type="number"
            min={0}
            step={0.1}
            {...register("distance_km", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
          />
          {errors.distance_km && (
            <p className="text-destructive text-xs">{errors.distance_km.message}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="intensity" className="text-foreground text-sm font-medium">
          Intensity <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <select
          id="intensity"
          {...register("intensity", { setValueAs: (v) => (v === "" ? null : v) })}
          className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        >
          <option value="">None</option>
          {intensityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-foreground text-sm font-medium">
          Notes <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3 resize-none"
        />
        {errors.notes && (
          <p className="text-destructive text-xs">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="done_at" className="text-foreground text-sm font-medium">
          Date & Time
        </label>
        <input
          id="done_at"
          type="datetime-local"
          {...register("done_at")}
          className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.done_at && (
          <p className="text-destructive text-xs">{errors.done_at.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Saving..." : "Log Workout"}
      </Button>
    </form>
  )
}
