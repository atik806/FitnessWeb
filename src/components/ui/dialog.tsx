"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => onOpenChange(false)
    el.addEventListener("close", handler)
    return () => el.removeEventListener("close", handler)
  }, [onOpenChange])

  return (
    <dialog
      ref={ref}
      className="backdrop:bg-black/50 fixed inset-0 m-auto h-fit max-h-[85vh] w-[95vw] max-w-md rounded-xl border bg-background p-0 shadow-[var(--shadow-card-hover)] backdrop:backdrop-blur-sm open:flex open:flex-col overscroll-contain"
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false)
      }}
    >
      {children}
    </dialog>
  )
}

export function DialogTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
}

export function DialogClose({ className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "text-muted-foreground hover:text-foreground absolute top-2 right-2 flex items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 size-9",
        className
      )}
      onClick={(e) => {
        const dialog = (e.target as HTMLElement).closest("dialog")
        dialog?.close()
        onClick?.(e)
      }}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}
