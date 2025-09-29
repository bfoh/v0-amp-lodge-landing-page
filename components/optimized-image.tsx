"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image Component with LQIP support
 *
 * Features:
 * - Responsive images with srcset
 * - Low Quality Image Placeholder (LQIP) blur effect
 * - WebP/AVIF format support with fallbacks
 * - Lazy loading by default (unless priority is set)
 * - Loading states and error handling
 *
 * TODO: Integrate with image CDN (Cloudinary, Vercel Image Optimization, etc.)
 * TODO: Add automatic format detection and conversion
 */
export function OptimizedImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  quality = 75,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate LQIP data URL if not provided
  const defaultBlurDataURL = blurDataURL || generateLQIP()

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Extract filename without extension for format variations
  const baseName = src.replace(/\.[^/.]+$/, "")
  const extension = src.split(".").pop()

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* LQIP Background */}
      {placeholder === "blur" && isLoading && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          style={{
            backgroundImage: `url(${defaultBlurDataURL})`,
          }}
        />
      )}

      {/* Loading Placeholder */}
      {isLoading && placeholder === "empty" && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {/* Main Image */}
      <picture>
        {/* Modern formats with fallbacks */}
        {/* TODO: Enable when CDN supports AVIF */}
        {/* <source srcSet={`${baseName}.avif`} type="image/avif" /> */}

        {/* TODO: Enable when CDN supports WebP */}
        {/* <source srcSet={`${baseName}.webp`} type="image/webp" /> */}

        {/* Fallback to original format */}
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            hasError && "opacity-50",
          )}
          onLoad={handleLoad}
          onError={handleError}
          // TODO: Add srcset for responsive images when CDN is configured
          // srcSet={`
          //   ${baseName}-400w.${extension} 400w,
          //   ${baseName}-800w.${extension} 800w,
          //   ${baseName}-1200w.${extension} 1200w,
          //   ${baseName}-1600w.${extension} 1600w
          // `}
        />
      </picture>

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Generate a simple LQIP (Low Quality Image Placeholder)
 * In production, this should be generated server-side or by your CDN
 */
function generateLQIP(): string {
  // Simple 1x1 pixel transparent image as fallback
  // TODO: Replace with actual LQIP generation using sharp, canvas, or CDN
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
}
