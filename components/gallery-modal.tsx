"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"

interface GalleryImage {
  id: string
  name: string
  alt: string
  category: "room" | "amenity" | "exterior" | "dining"
  src: string // Added src property to match the updated interface
}

interface GalleryModalProps {
  images: GalleryImage[]
  isOpen: boolean
  onClose: () => void
  initialIndex: number
  onImageChange?: (index: number) => void
}

export function GalleryModal({ images, isOpen, onClose, initialIndex, onImageChange }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    console.log("[v0] GalleryModal images array:", images)
  }, [images])

  useEffect(() => {
    const currentImage = images?.[currentIndex]
    console.log("[v0] Showing image src:", currentImage?.src)
    console.log("[v0] Current image object:", currentImage)
  }, [currentIndex, images])

  useEffect(() => {
    if (!isOpen) return

    images.forEach((image, index) => {
      const url = image.src
      if (!url) {
        console.warn("[v0] Missing URL for image:", image)
        return
      }

      fetch(url, { method: "HEAD" })
        .then((res) => console.log("[v0] Image fetch test:", url, "Status:", res.status))
        .catch((err) => console.error("[v0] Image fetch error:", url, err))
    })
  }, [images, isOpen])

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const prevIndexRef = useRef(currentIndex)
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      onImageChange?.(currentIndex)
      prevIndexRef.current = currentIndex
    }
  }, [currentIndex, onImageChange])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements?.length) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsLoading(true)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsLoading(true)
  }, [images.length])

  // Touch handlers for swipe gestures
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

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close Button */}
      <Button
        ref={closeButtonRef}
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0 min-w-[44px] min-h-[44px] md:min-w-[48px] md:min-h-[48px] cursor-pointer"
        aria-label="Close gallery"
      >
        <X className="h-6 w-6 md:h-7 md:w-7" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 md:left-8 lg:left-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-2 border-white/20 min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px] lg:min-w-[44px] lg:min-h-[44px] cursor-pointer shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-7 w-7 md:h-9 md:w-9 lg:h-6 lg:w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-2 sm:right-4 md:right-8 lg:right-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-2 border-white/20 min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px] lg:min-w-[44px] lg:min-h-[44px] cursor-pointer shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
        aria-label="Next image"
      >
        <ChevronRight className="h-7 w-7 md:h-9 md:w-9 lg:h-6 lg:w-6" />
      </Button>

      {/* Image Container */}
      <div className="relative max-w-7xl max-h-[90vh] mx-4">
        {/* Loading placeholder with LQIP effect */}
        {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />}

        <img
          src={currentImage?.src || "/placeholder.svg"}
          alt={currentImage?.alt || `Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          style={{ maxWidth: "100%", maxHeight: "80vh", display: "block" }}
          onLoad={() => {
            console.log("[v0] Image loaded successfully:", currentImage?.src)
            setIsLoading(false)
          }}
          onError={(e) => {
            console.warn("[v0] Failed to load image:", e.currentTarget.src)
            setIsLoading(false)
            const fallback = "/placeholder.svg"
            if (e.currentTarget.src !== fallback) {
              console.log("[v0] Setting fallback image:", fallback)
              e.currentTarget.src = fallback
            }
          }}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 md:px-8 md:py-4 lg:px-6 lg:py-3 rounded-full text-sm md:text-lg lg:text-base backdrop-blur-sm border border-white/20">
        <span id="gallery-modal-title" className="sr-only">
          Gallery image {currentIndex + 1} of {images.length}
        </span>
        <div className="flex items-center gap-2 md:gap-4 lg:gap-3">
          <span aria-live="polite" className="font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="hidden sm:inline md:text-base lg:text-sm text-white/70">• Use ← → keys or swipe</span>
          <span className="sm:hidden text-xs text-white/70">• Swipe to navigate</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <Button
          asChild
          variant="secondary"
          className="min-h-[44px] md:min-h-[52px] lg:min-h-[48px] md:px-6 lg:px-4 cursor-pointer transition-all duration-200 hover:scale-105"
        >
          <Link href="/gallery" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 md:h-6 md:w-6 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline md:text-lg lg:text-base">Open full gallery page</span>
            <span className="sm:hidden text-sm">Full gallery</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
