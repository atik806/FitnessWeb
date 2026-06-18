"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { LottieRefCurrentProps } from "lottie-react"
import { getAnimationFile } from "@/lib/animation-metadata"

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center size-full min-h-[100px]">
      <div className="size-8 rounded-full border-2 border-border border-t-fitness animate-spin" />
    </div>
  ),
})

interface ExerciseAnimationProps {
  exerciseId: string
  size?: number
  className?: string
  autoplay?: boolean
  loop?: boolean
  speed?: number
  showControls?: boolean
  lazy?: boolean
}

export function ExerciseAnimation({
  exerciseId,
  size = 200,
  className = "",
  autoplay = true,
  loop = true,
  speed = 1,
  showControls = false,
  lazy = true,
}: ExerciseAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isVisible, setIsVisible] = useState(!lazy)
  const [isPlaying, setIsPlaying] = useState(autoplay)

  useEffect(() => {
    if (!lazy) {
      setIsVisible(true)
      return
    }
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "100px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lazy])

  useEffect(() => {
    if (!isVisible) return
    const file = getAnimationFile(exerciseId)
    if (!file) {
      setLoading(false)
      setError(true)
      return
    }
    setLoading(true)
    setError(false)
    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation")
        return res.json()
      })
      .then((data) => {
        setAnimationData(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [exerciseId, isVisible])

  const togglePlay = useCallback(() => {
    if (!lottieRef.current) return
    if (isPlaying) {
      lottieRef.current.pause()
    } else {
      lottieRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed)
    }
  }, [speed])

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="size-10 rounded-full border-2 border-border border-t-fitness animate-spin" />
      </div>
    )
  }

  if (error || !animationData) {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl bg-fitness/5 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="flex size-12 items-center justify-center rounded-lg bg-fitness/10">
          <span className="text-2xl">🏋️</span>
        </div>
        <span className="text-xs text-muted-foreground">Animation</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: size, height: size }}
      />
      {showControls && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground text-xs backdrop-blur-sm transition-colors hover:bg-background"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      )}
    </div>
  )
}
