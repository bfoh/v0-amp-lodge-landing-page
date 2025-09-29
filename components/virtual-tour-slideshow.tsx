"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize } from "lucide-react"
import { galleryImages } from "@/lib/gallery-data"
import { OptimizedImage } from "./optimized-image"
import { cn } from "@/lib/utils"

interface VirtualTourSlideshowProps {
  onImageOpen?: (imageId: string) => void // TODO: Analytics hook
  onSlideChange?: (index: number) => void // TODO: Analytics hook
}

export function VirtualTourSlideshow({ onImageOpen, onSlideChange }: VirtualTourSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

  const currentImage = galleryImages[currentIndex]
  const totalImages = galleryImages.length

  // Navigation functions
  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % totalImages
    setCurrentIndex(nextIndex)
    onSlideChange?.(nextIndex)
    console.log("[v0] Virtual tour slide changed to:", nextIndex) // TODO: Wire analytics
  }, [currentIndex, totalImages, onSlideChange])

  const goToPrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages
    setCurrentIndex(prevIndex)
    onSlideChange?.(prevIndex)
    console.log("[v0] Virtual tour slide changed to:", prevIndex) // TODO: Wire analytics
  }, [currentIndex, totalImages, onSlideChange])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    onSlideChange?.(index)
    console.log("[v0] Virtual tour slide changed to:", index) // TODO: Wire analytics
  }

  // Autoplay functionality
  useEffect(() => {
    if (isAutoplay && !prefersReducedMotion) {
      const interval = setInterval(goToNext, 4000) // 4 seconds per slide
      return () => clearInterval(interval)
    }
  }, [isAutoplay, goToNext, prefersReducedMotion])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          event.preventDefault()
          goToNext()
          break
        case "Escape":
          if (isFullscreen) {
            exitFullscreen()
          }
          break
        case " ":
          event.preventDefault()
          setIsAutoplay(!isAutoplay)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrevious, isAutoplay, isFullscreen])

  // Touch/swipe handling
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  // Fullscreen functionality
  const enterFullscreen = () => {
    const element = document.getElementById("virtual-tour-container")
    if (element?.requestFullscreen) {
      element.requestFullscreen()
      setIsFullscreen(true)
      onImageOpen?.(currentImage.id) // TODO: Wire analytics
      console.log("[v0] Virtual tour entered fullscreen mode") // TODO: Wire analytics
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Generate readable caption from filename
  const generateCaption = (image: typeof currentImage) => {
    return image.alt || image.name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div
      id="virtual-tour-container"
      className={cn(
        "relative bg-card rounded-lg overflow-hidden shadow-lg",
        isFullscreen && "fixed inset-0 z-50 bg-black rounded-none",
      )}
    >
      {/* Main Image Display */}
      <div
        className={cn("relative aspect-video bg-muted", isFullscreen && "h-screen aspect-auto")}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <OptimizedImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover"
          sizes={isFullscreen ? "100vw" : "(max-width: 768px) 100vw, 80vw"}
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 z-10",
            "min-w-[44px] min-h-[44px] rounded-full",
            "bg-background/80 hover:bg-background/90 backdrop-blur-sm",
            "shadow-lg border border-border/20",
          )}
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 z-10",
            "min-w-[44px] min-h-[44px] rounded-full",
            "bg-background/80 hover:bg-background/90 backdrop-blur-sm",
            "shadow-lg border border-border/20",
          )}
          onClick={goToNext}
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          {/* Image Counter */}
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {currentIndex + 1} / {totalImages}
          </Badge>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {/* Autoplay Toggle */}
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "min-w-[44px] min-h-[44px] rounded-full",
                "bg-background/80 hover:bg-background/90 backdrop-blur-sm",
                "shadow-lg border border-border/20",
              )}
              onClick={() => setIsAutoplay(!isAutoplay)}
              aria-label={isAutoplay ? "Pause slideshow" : "Play slideshow"}
              disabled={prefersReducedMotion}
            >
              {isAutoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="secondary"
              size="sm"
              className={cn(
                "min-w-[44px] min-h-[44px] rounded-full",
                "bg-background/80 hover:bg-background/90 backdrop-blur-sm",
                "shadow-lg border border-border/20",
              )}
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Bottom Caption */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 sm:p-4 shadow-lg border border-border/20">
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base line-clamp-1">
              {generateCaption(currentImage)}
            </h3>
            <Badge variant="outline" className="text-xs">
              {currentImage.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className={cn("p-2 sm:p-4 bg-card border-t border-border/20", isFullscreen && "hidden")}>
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 relative overflow-hidden rounded-md",
                "min-w-[50px] h-10 sm:min-w-[80px] sm:h-16",
                "border-2 transition-all duration-200",
                "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring",
                currentIndex === index ? "border-primary shadow-md" : "border-border/20 hover:border-border/40",
              )}
              aria-label={`Go to image ${index + 1}: ${image.alt}`}
            >
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                sizes="80px"
                loading="lazy"
              />
              {currentIndex === index && <div className="absolute inset-0 bg-primary/20" />}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div
        className={cn(
          "absolute bottom-4 right-4 z-20",
          "text-xs text-muted-foreground bg-background/80 backdrop-blur-sm",
          "rounded px-2 py-1 border border-border/20",
          isFullscreen ? "block" : "hidden sm:block",
        )}
      >
        ← → Navigate • Space Autoplay • Esc Exit
      </div>
    </div>
  )
}
