/**
 * Image Optimization Utilities
 *
 * This file contains utilities for image optimization, CDN integration,
 * and responsive image generation.
 *
 * TODO: Integrate with your preferred image CDN:
 * - Vercel Image Optimization: https://vercel.com/docs/concepts/image-optimization
 * - Cloudinary: https://cloudinary.com/
 * - ImageKit: https://imagekit.io/
 * - AWS CloudFront + Lambda@Edge
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png"
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  blur?: number
}

/**
 * Generate optimized image URL with transformations
 *
 * @param src - Original image source
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(src: string, options: ImageTransformOptions = {}): string {
  // TODO: Replace with your CDN's URL transformation logic

  // Example for Vercel Image Optimization:
  // const params = new URLSearchParams()
  // if (options.width) params.set('w', options.width.toString())
  // if (options.height) params.set('h', options.height.toString())
  // if (options.quality) params.set('q', options.quality.toString())
  // return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`

  // Example for Cloudinary:
  // const transformations = []
  // if (options.width) transformations.push(`w_${options.width}`)
  // if (options.height) transformations.push(`h_${options.height}`)
  // if (options.quality) transformations.push(`q_${options.quality}`)
  // if (options.format) transformations.push(`f_${options.format}`)
  // return `https://res.cloudinary.com/your-cloud/image/upload/${transformations.join(',')}/v1/${src}`

  // For now, return original URL
  return src
}

/**
 * Generate responsive image srcset
 *
 * @param src - Original image source
 * @param widths - Array of widths to generate
 * @returns srcset string
 */
export function generateSrcSet(src: string, widths: number[] = [400, 800, 1200, 1600]): string {
  // TODO: Implement with your CDN
  return widths.map((width) => `${getOptimizedImageUrl(src, { width })} ${width}w`).join(", ")
}

/**
 * Generate LQIP (Low Quality Image Placeholder) data URL
 *
 * @param src - Original image source
 * @returns Promise<string> - Base64 encoded LQIP
 */
export async function generateLQIP(src: string): Promise<string> {
  // TODO: Implement LQIP generation
  // This should be done server-side using sharp, canvas, or your CDN

  // Example with sharp (server-side):
  // const sharp = require('sharp')
  // const buffer = await sharp(src)
  //   .resize(10, 10)
  //   .blur(1)
  //   .jpeg({ quality: 20 })
  //   .toBuffer()
  // return `data:image/jpeg;base64,${buffer.toString('base64')}`

  // For now, return a simple placeholder
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
}

/**
 * Preload critical images
 *
 * @param images - Array of image URLs to preload
 */
export function preloadImages(images: string[]): void {
  if (typeof window === "undefined") return

  images.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = src
    document.head.appendChild(link)
  })
}

/**
 * Lazy load images with Intersection Observer
 *
 * @param selector - CSS selector for images to lazy load
 */
export function setupLazyLoading(selector = "img[data-src]"): void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return

  const images = document.querySelectorAll(selector)

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.removeAttribute("data-src")
          observer.unobserve(img)
        }
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
}
