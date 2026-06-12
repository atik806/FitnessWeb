"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  Moon,
  BarChart3,
  Target,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/nutrition", label: "Food", icon: Apple },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: UserCircle },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-background px-1 pb-safe md:hidden">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors min-w-0 flex-1",
              isActive
                ? "text-sidebar-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 mb-0.5" />
            <span className="truncate max-w-full">{label}</span>
          </Link>
        )
      })}
      <ThemeToggle />
    </nav>
  )
}
