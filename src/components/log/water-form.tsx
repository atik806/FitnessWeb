"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Droplets } from "lucide-react"

const waterSchema = z.object({
  amount_l: z.number().min(0.01, "Amount must be at least 0.01L"),
  date: z.string().min(1, "Date is required"),
})

type WaterFormData = z.infer<typeof waterSchema>

interface WaterFormProps {
  userId: string
  onSuccess: () => void
}

const presets = [
  { label: "Small", amount: 0.25 },
  { label: "Medium", amount: 0.5 },
  { label: "Large", amount: 0.75 },
  { label: "Bottle", amount: 1.0 },
] as const

export function WaterForm({ userId, onSuccess }: WaterFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WaterFormData>({
    resolver: zodResolver(waterSchema),
    defaultValues: {
      amount_l: 0.25,
      date: new Date().toISOString().split("T")[0],
    },
  })

  const selectedAmount = watch("amount_l")

  const onSubmit = async (data: WaterFormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("water_intake").insert({
        user_id: userId,
        amount_l: data.amount_l,
        date: data.date,
      })
      if (error) throw error
      toast.success(`${data.amount_l}L water logged!`)
      onSuccess()
    } catch {
      toast.error("Failed to log water intake")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <Droplets className="size-4" />
        </div>
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Log Water
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">Quick Amount</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const selected = selectedAmount === preset.amount
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setValue("amount_l", preset.amount, { shouldValidate: true })}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Droplets className="size-3.5" />
                {preset.label} ({preset.amount}L)
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount_l" className="text-foreground text-sm font-medium">
          Custom Amount (L)
        </label>
        <input
          id="amount_l"
          type="number"
          min={0.01}
          step={0.01}
          {...register("amount_l", { valueAsNumber: true })}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.amount_l && (
          <p className="text-destructive text-xs">{errors.amount_l.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="text-foreground text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.date && (
          <p className="text-destructive text-xs">{errors.date.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? "Saving..." : "Log Water"}
      </Button>
    </form>
  )
}
