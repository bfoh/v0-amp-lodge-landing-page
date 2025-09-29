"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GalleryModal } from "@/components/gallery-modal"
import Link from "next/link"
import { ArrowLeft, Filter } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import { galleryImages, type GalleryImage } from "@/lib/gallery-data"

const IMAGES_PER_PAGE = 8

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [displayedImages, setDisplayedImages] = useState<GalleryImage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Filter images based on selected category
  const filteredImages =
    selectedCategory === "all" ? galleryImages : galleryImages.filter((img) => img.category === selectedCategory)

  // Load initial images
  useEffect(() => {
    const initialImages = filteredImages.slice(0, IMAGES_PER_PAGE)
    setDisplayedImages(initialImages)
    setCurrentPage(1)
    setHasMore(filteredImages.length > IMAGES_PER_PAGE)
  }, [selectedCategory])

  // Load more images (infinite scroll or pagination)
  const loadMoreImages = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    // Simulate API delay for demonstration
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * IMAGES_PER_PAGE
      const endIndex = startIndex + IMAGES_PER_PAGE
      const newImages = filteredImages.slice(startIndex, endIndex)

      if (newImages.length > 0) {
        setDisplayedImages((prev) => [...prev, ...newImages])
        setCurrentPage(nextPage)
        setHasMore(endIndex < filteredImages.length)
      } else {
        setHasMore(false)
      }

      setIsLoading(false)
    }, 500)
  }, [currentPage, filteredImages, isLoading, hasMore])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreImages()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadMoreImages])

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const categories = [
    { value: "all", label: "All Photos" },
    { value: "room", label: "Rooms" },
    { value: "amenity", label: "Amenities" },
    { value: "exterior", label: "Exterior" },
    { value: "dining", label: "Dining" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Left side - Back button and Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 flex-shrink-0">
              <Button variant="ghost" size="sm" asChild className="md:min-h-[44px]">
                <Link href="/" className="flex items-center gap-1 sm:gap-2">
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline md:text-base">Back to Home</span>
                  <span className="sm:hidden text-xs">Home</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <Link href="/" className="flex items-center">
                <img
                  src="/amp-lodge-logo.png"
                  alt="AMP Lodge"
                  className="h-6 sm:h-8 md:h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Center title - only on larger screens */}
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">Photo Gallery</h1>
            </div>

            {/* Mobile title - stacked below on mobile */}
            <div className="sm:hidden flex-1 text-center ml-2">
              <h1 className="text-sm md:text-base font-semibold">Photo Gallery</h1>
            </div>

            {/* Right side spacer for desktop balance */}
            <div className="hidden sm:block w-20 sm:w-24 md:w-32"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge variant="outline" className="mb-4 md:mb-6 md:text-base">
            AMP Lodge Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 text-balance">
            Explore our beautiful property
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl md:max-w-3xl mx-auto text-pretty">
            Browse through our collection of photos showcasing rooms, amenities, and the stunning architecture of AMP
            Lodge.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-3 mb-8 md:mb-12">
          <Filter className="h-5 w-5 md:h-7 md:w-7 lg:h-6 lg:w-6 text-muted-foreground mr-2 mt-2" />
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="min-h-[44px] md:min-h-[52px] lg:min-h-[48px] md:px-8 lg:px-6 md:text-lg lg:text-base transition-all duration-200 hover:scale-105"
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-8 lg:gap-6 space-y-4 md:space-y-8 lg:space-y-6">
          {displayedImages.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => handleImageClick(index)}
              className="group relative block w-full break-inside-avoid mb-4 md:mb-8 lg:mb-6 overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-[1.02]"
              style={{ minHeight: "44px", minWidth: "44px" }}
            >
              <OptimizedImage
                src={image.src} // Using the src property instead of constructing the path
                alt={image.alt}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 33vw, 25vw"
                placeholder="blur"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 md:w-16 md:h-16 lg:w-14 lg:h-14 bg-white/90 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 lg:w-7 lg:h-7 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-2 left-2 sm:top-2 sm:left-2 sm:bottom-auto">
                <Badge
                  variant="secondary"
                  className="text-xs md:text-base lg:text-sm capitalize opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                  {image.category}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12 md:mt-20 lg:mt-16">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 md:w-6 md:h-6 lg:w-5 lg:h-5 bg-primary rounded-full animate-pulse"></div>
              <div
                className="w-4 h-4 md:w-6 md:h-6 lg:w-5 lg:h-5 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-4 h-4 md:w-6 md:h-6 lg:w-5 lg:h-5 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="text-muted-foreground ml-2 md:text-xl lg:text-lg">Loading more images...</span>
            </div>
          )}

          {!isLoading && hasMore && (
            <Button
              onClick={loadMoreImages}
              variant="outline"
              size="lg"
              className="min-h-[44px] md:min-h-[56px] lg:min-h-[52px] md:px-10 lg:px-8 md:text-xl lg:text-lg bg-transparent transition-all duration-200 hover:scale-105"
            >
              Load More Images
            </Button>
          )}

          {!hasMore && displayedImages.length > 0 && (
            <p className="text-muted-foreground md:text-xl lg:text-lg">
              You've seen all {displayedImages.length} images in this category.
            </p>
          )}
        </div>

        {/* Empty State */}
        {displayedImages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No images found in this category.</p>
            <Button onClick={() => setSelectedCategory("all")} variant="outline" className="mt-4">
              View All Photos
            </Button>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        images={displayedImages}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialIndex={selectedImageIndex}
        onImageChange={(index) => setSelectedImageIndex(index)}
      />
    </div>
  )
}
