import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Moon,
  Target,
  ChartNoAxesCombined,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  { icon: LayoutDashboard, title: "Dashboard Analytics", desc: "Comprehensive overview of your fitness journey with key metrics at a glance" },
  { icon: Dumbbell, title: "Workout Tracking", desc: "Log exercises, sets, reps, and track strength progression over time" },
  { icon: UtensilsCrossed, title: "Nutrition Logging", desc: "Track calories, macros, and meals with a built-in food database" },
  { icon: Moon, title: "Sleep Tracking", desc: "Monitor sleep duration, quality, and patterns for optimal recovery" },
  { icon: Target, title: "Goals & Progress", desc: "Set personalized goals and visualize your progress with detailed charts" },
  { icon: ChartNoAxesCombined, title: "Advanced Charts", desc: "Deep insights with interactive charts for every aspect of your fitness" },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50K+", label: "Workouts Logged" },
  { value: "99%", label: "Uptime" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between gap-2 px-4 py-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex size-8 items-center justify-center rounded-lg bg-fitness/10">
            <Dumbbell className="size-5 text-fitness" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">FitTrack</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 sm:px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-fitness px-3 sm:px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-fitness-dark whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-fitness/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-48 rounded-full bg-energy/5 blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground animate-fade-in-up">
            <Zap className="size-3.5 text-fitness" />
            Your fitness journey starts here
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-fitness">Fit</span>Track
            <br />
            <span className="text-3xl sm:text-4xl text-muted-foreground font-normal">
              Your complete fitness companion
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Track workouts, monitor nutrition, analyze sleep, and crush your goals — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/auth/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-fitness px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-fitness-dark hover:scale-105 active:scale-95"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border px-8 text-sm font-semibold transition-all hover:bg-accent"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-fitness">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-fitness">transform</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Powerful tools to track, analyze, and improve every aspect of your fitness.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-fitness/30 gradient-card animate-fade-in-up"
                style={{ animationDelay: `${0.5 + i * 0.05}s` }}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-fitness/10 text-fitness group-hover:bg-fitness group-hover:text-white transition-all duration-300">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-fitness/10">
              <Dumbbell className="size-3.5 text-fitness" />
            </div>
            <span className="font-semibold">FitTrack</span>
          </div>
          <p>&copy; {new Date().getFullYear()} FitTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
