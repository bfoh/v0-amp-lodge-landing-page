"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GalleryModal } from "./gallery-modal"
import { OptimizedImage } from "./optimized-image"
import { galleryImages } from "@/lib/gallery-data"

interface GalleryPreviewProps {
  onImageOpen?: (imageId: string) => void // TODO: Analytics hook
}

export function GalleryPreview({ onImageOpen }: GalleryPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Show first 4 images as thumbnails
  const thumbnailImages = galleryImages.slice(0, 4)

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
    onImageOpen?.(galleryImages[index].id) // TODO: Wire analytics
  }

  const handleViewFullGallery = () => {
    setSelectedImageIndex(0)
    setIsModalOpen(true)
    onImageOpen?.("gallery-full") // TODO: Wire analytics
  }

  return (
    <>
      {/* 2x2 Thumbnail Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8">
        {thumbnailImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleThumbnailClick(index)}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
            style={{ minHeight: "44px", minWidth: "44px" }} // Ensure 44x44px tap target
          >
            <OptimizedImage
              src={image.src} // Using the src property instead of constructing the path
              alt={image.alt}
              className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
              placeholder="blur"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
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
          </button>
        ))}
      </div>

      {/* View Full Gallery Button */}
      <div className="text-center">
        <Button
          variant="outline"
          size="lg"
          onClick={handleViewFullGallery}
          className="min-h-[44px] px-6 sm:px-8 bg-transparent cursor-pointer hover:cursor-pointer"
        >
          View Full Gallery
        </Button>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        images={galleryImages}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialIndex={selectedImageIndex}
        onImageChange={(index) => setSelectedImageIndex(index)}
      />
    </>
  )
}
