"use client"
import { VirtualTourSlideshow } from "@/components/virtual-tour-slideshow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VirtualTourPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Link href="/" className="flex items-center">
              <img src="/amp-lodge-logo.png" alt="AMP Lodge" className="h-8 w-auto object-contain" />
            </Link>
            <div className="w-[100px]" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Virtual Tour
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Explore AMP Lodge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Take a virtual journey through our beautiful facilities, comfortable rooms, and welcoming spaces.
            </p>
          </div>

          {/* Virtual Tour Slideshow */}
          <VirtualTourSlideshow />
        </div>
      </main>
    </div>
  )
}
