"use client"

import type React from "react"
import Link from "next/link"
import { useEffect } from "react"

import { HeroSection } from "@/components/ui/hero-section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Wifi, Car, Coffee, Utensils, Star, Calendar, Users, Menu, X } from "lucide-react"
import { useState } from "react"
import { GalleryPreview } from "@/components/gallery-preview"
import { BookingForm } from "@/components/booking-form"

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Handle anchor navigation when coming from external pages
    const handleAnchorNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          const targetElement = document.getElementById(hash.replace("#", ""))
          if (targetElement) {
            const navHeight = 64 // Height of fixed navigation
            const targetPosition = targetElement.offsetTop - navHeight

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            })
          }
        }, 100)
      }
    }

    // Handle initial load with hash
    handleAnchorNavigation()

    // Handle hash changes (for single page navigation)
    window.addEventListener("hashchange", handleAnchorNavigation)

    return () => {
      window.removeEventListener("hashchange", handleAnchorNavigation)
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)

    const targetElement = document.getElementById(targetId.replace("#", ""))
    if (targetElement) {
      const navHeight = 64 // Height of fixed navigation
      const targetPosition = targetElement.offsetTop - navHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()

    const targetElement = document.getElementById(targetId.replace("#", ""))
    if (targetElement) {
      const navHeight = 64 // Height of fixed navigation
      const targetPosition = targetElement.offsetTop - navHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  const actions = [
    {
      text: "Book Your Stay",
      href: "#booking",
      variant: "default",
    },
    {
      text: "Virtual Tour",
      href: "/virtual-tour", // Updated href to navigate to virtual tour page
      variant: "glow",
      icon: <Calendar className="h-5 w-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/amp-lodge-logo.png"
                  alt="AMP Lodge"
                  className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#rooms"
                onClick={(e) => handleNavClick(e, "#rooms")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Rooms
              </a>
              <a
                href="#amenities"
                onClick={(e) => handleNavClick(e, "#amenities")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Amenities
              </a>
              <a
                href="#gallery"
                onClick={(e) => handleNavClick(e, "#gallery")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Gallery
              </a>
              <a
                href="#location"
                onClick={(e) => handleNavClick(e, "#location")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Location
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <Button asChild>
                <a href="#booking" onClick={(e) => handleNavClick(e, "#booking")}>
                  Book Now
                </a>
              </Button>
            </div>

            {/* Mobile Navigation Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button asChild size="sm" className="min-h-[44px] min-w-[44px] px-3">
                <a href="#booking" onClick={(e) => handleNavClick(e, "#booking")}>
                  Book Now
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-1">
                <a
                  href="#rooms"
                  onClick={(e) => handleNavClick(e, "#rooms")}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted/50 min-h-[44px] flex items-center"
                >
                  Rooms
                </a>
                <a
                  href="#amenities"
                  onClick={(e) => handleNavClick(e, "#amenities")}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted/50 min-h-[44px] flex items-center"
                >
                  Amenities
                </a>
                <a
                  href="#gallery"
                  onClick={(e) => handleNavClick(e, "#gallery")}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted/50 min-h-[44px] flex items-center"
                >
                  Gallery
                </a>
                <a
                  href="#location"
                  onClick={(e) => handleNavClick(e, "#location")}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted/50 min-h-[44px] flex items-center"
                >
                  Location
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted/50 min-h-[44px] flex items-center"
                >
                  Contact
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection
          title="Experience luxury at AMP Lodge"
          description="Discover exceptional comfort and authentic Ghanaian hospitality in the heart of Kumasi. Where modern elegance meets traditional warmth."
          actions={actions}
          image={{
            light: "/amp-lodge-main-building.png",
            dark: "/amp-lodge-main-building.png",
            alt: "AMP Lodge main building exterior",
          }}
        />
      </div>

      {/* Rooms Section */}
      <section id="rooms" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Accommodation
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Comfortable rooms for every traveler
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                <img src="/amp-lodge-standard-room.png" alt="Standard Room" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold">Standard Room</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Comfortable and affordable rooms with essential amenities for a pleasant stay in Kumasi.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      1-2 Guests
                    </span>
                    <span className="flex items-center">
                      <Wifi className="h-4 w-4 mr-1" />
                      Free WiFi
                    </span>
                  </div>
                  <Button size="sm" className="text-xs sm:text-sm whitespace-nowrap min-h-[44px]" asChild>
                    <a href="#booking" onClick={(e) => handleNavClick(e, "#booking")}>
                      Book Room
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                <img src="/amp-lodge-deluxe-room.png" alt="Deluxe Room" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold">Deluxe Room</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Spacious rooms with modern amenities, comfortable bedding, and beautiful views of Kumasi.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />2 Guests
                    </span>
                    <span className="flex items-center">
                      <Wifi className="h-4 w-4 mr-1" />
                      Free WiFi
                    </span>
                  </div>
                  <Button size="sm" className="text-xs sm:text-sm whitespace-nowrap min-h-[44px]" asChild>
                    <a href="#booking" onClick={(e) => handleNavClick(e, "#booking")}>
                      Book Room
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                <img
                  src="/amp-lodge-executive-suite.png"
                  alt="Executive Suite"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold">Executive Suite</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Premium suites with separate living areas, premium amenities, and panoramic city views.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />4 Guests
                    </span>
                    <span className="flex items-center">
                      <Coffee className="h-4 w-4 mr-1" />
                      Mini Bar
                    </span>
                  </div>
                  <Button size="sm" className="text-xs sm:text-sm whitespace-nowrap min-h-[44px]" asChild>
                    <a href="#booking" onClick={(e) => handleNavClick(e, "#booking")}>
                      Book Suite
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Hotel Amenities
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything you need for a perfect stay
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Free WiFi</h3>
              <p className="text-sm text-muted-foreground">High-speed internet throughout the property</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Free Parking</h3>
              <p className="text-sm text-muted-foreground">Secure parking for all guests</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Restaurant</h3>
              <p className="text-sm text-muted-foreground">Local and international cuisine</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">24/7 Service</h3>
              <p className="text-sm text-muted-foreground">Round-the-clock guest services</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Photo Gallery
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Explore our stunning facilities
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Take a visual tour of our beautiful property, comfortable rooms, and relaxing outdoor spaces.
            </p>
          </div>

          <GalleryPreview />
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Our Location
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Situated in the heart of Kumasi
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty">
              AMP Lodge is conveniently located in the heart of Kumasi, offering easy access to major attractions and
              business districts.
            </p>
            <div className="flex justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.832736246594!2d-0.5597239840579146!3d5.603716395999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2a0b0b0b0b%3A0x1234567890abcdef!2sAMP%20Lodge!5e0!3m2!1sen!2sgh!4v1633072800000!5m2!1sen!2sgh"
                width="100%"
                height="300"
                className="sm:h-[400px] md:h-[450px] rounded-lg"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              Book Your Stay
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Reserve your room at AMP Lodge
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Search available rooms and book your perfect stay in Kumasi with real-time availability.
            </p>
          </div>

          <BookingForm />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <Badge variant="outline" className="mb-4">
                Get in Touch
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                Ready to experience AMP Lodge?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 text-pretty">
                Contact us today to book your stay or learn more about our services. We're here to make your visit to
                Kumasi unforgettable.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Location</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Kumasi, Ashanti Region, Ghana</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Phone</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">+233 XX XXX XXXX</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Email</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">info@amplodge.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-6">Send us a message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <Button className="w-full min-h-[44px]" size="lg">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">AMP LODGE</h2>
            <p className="text-background/80 mb-8 text-sm sm:text-base">
              Experience the warmth of Ghanaian hospitality in the heart of Kumasi
            </p>
            <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-2 sm:space-y-0 text-sm">
              <a href="#" className="text-background/80 hover:text-background transition-colors py-2 sm:py-0">
                Privacy Policy
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors py-2 sm:py-0">
                Terms of Service
              </a>
              <a href="#contact" className="text-background/80 hover:text-background transition-colors py-2 sm:py-0">
                Contact
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-background/20">
              <p className="text-background/60 text-xs sm:text-sm">© 2025 AMP Lodge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
