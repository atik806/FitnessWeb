"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useMealStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Coffee, Sun, Moon, Apple, Utensils } from "lucide-react"
import { cn, getToday } from "@/lib/utils"

const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required").max(100),
  calories: z.number().min(1, "Calories must be at least 1"),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  date: z.string().min(1, "Date is required"),
})

type MealFormData = z.infer<typeof mealSchema>

interface MealFormProps {
  userId: string
  onSuccess: () => void
}

const mealTypes = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "snack", label: "Snack", icon: Apple },
] as const

const presets: Record<string, { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }> = {
  breakfast: { name: "Breakfast", calories: 400, protein_g: 20, carbs_g: 50, fat_g: 15 },
  lunch: { name: "Lunch", calories: 600, protein_g: 35, carbs_g: 60, fat_g: 20 },
  dinner: { name: "Dinner", calories: 800, protein_g: 45, carbs_g: 70, fat_g: 25 },
  snack: { name: "Snack", calories: 200, protein_g: 10, carbs_g: 25, fat_g: 8 },
}

export function MealForm({ userId, onSuccess }: MealFormProps) {
  const { addMeal } = useMealStore()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      meal_type: "breakfast",
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      date: getToday(),
    },
  })

  const selectedType = watch("meal_type")

  const applyPreset = (type: MealFormData["meal_type"]) => {
    const p = presets[type]
    setValue("meal_type", type, { shouldValidate: true })
    setValue("name", p.name, { shouldValidate: true })
    setValue("calories", p.calories, { shouldValidate: true })
    setValue("protein_g", p.protein_g, { shouldValidate: true })
    setValue("carbs_g", p.carbs_g, { shouldValidate: true })
    setValue("fat_g", p.fat_g, { shouldValidate: true })
  }

  const onSubmit = async (data: MealFormData) => {
    try {
      await addMeal(userId, data)
      toast.success("Meal logged!")
      onSuccess()
    } catch {
      toast.error("Failed to log meal")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-foreground text-sm font-medium">Meal Type</label>
        <div className="flex flex-wrap gap-2">
          {mealTypes.map(({ value, label, icon: Icon }) => {
            const selected = selectedType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => applyPreset(value)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all",
                  selected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-foreground text-sm font-medium">
          Meal Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Oatmeal with berries"
          {...register("name")}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="calories" className="text-foreground text-sm font-medium">
          Calories
        </label>
        <input
          id="calories"
          type="number"
          min={1}
          {...register("calories", { valueAsNumber: true })}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
        />
        {errors.calories && (
          <p className="text-destructive text-xs">{errors.calories.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="protein_g" className="text-foreground text-sm font-medium">
            Protein <span className="text-muted-foreground text-xs">(g)</span>
          </label>
          <input
            id="protein_g"
            type="number"
            min={0}
            step={0.1}
            {...register("protein_g", { valueAsNumber: true })}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="carbs_g" className="text-foreground text-sm font-medium">
            Carbs <span className="text-muted-foreground text-xs">(g)</span>
          </label>
          <input
            id="carbs_g"
            type="number"
            min={0}
            step={0.1}
            {...register("carbs_g", { valueAsNumber: true })}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fat_g" className="text-foreground text-sm font-medium">
            Fat <span className="text-muted-foreground text-xs">(g)</span>
          </label>
          <input
            id="fat_g"
            type="number"
            min={0}
            step={0.1}
            {...register("fat_g", { valueAsNumber: true })}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-3"
          />
        </div>
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
        {isSubmitting ? "Saving..." : "Log Meal"}
      </Button>
    </form>
  )
}
