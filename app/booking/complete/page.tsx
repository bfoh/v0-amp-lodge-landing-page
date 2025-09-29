"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Calendar, CreditCard, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

interface Room {
  id: string // Changed from number to string to handle UUIDs
  name: string
  description: string
  price_per_night: number
  max_guests: number
  amenities: string[]
  image_url: string
}

interface BookingForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

export default function CompleteBookingPage() {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState<BookingForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const roomId = searchParams.get("roomId")
  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const guests = searchParams.get("guests")

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut || !guests) {
      router.push("/")
      return
    }

    checkAuth()
    fetchRoomDetails()
  }, [roomId, checkIn, checkOut, guests])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setForm((prev) => ({
        ...prev,
        email: user.email || "",
      }))
    }
  }

  const fetchRoomDetails = async () => {
    try {
      console.log("[v0] Fetching room details for roomId:", roomId) // Added debug logging
      setLoading(true)
      const response = await fetch(`/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)

      if (!response.ok) {
        throw new Error("Failed to fetch room details")
      }

      const data = await response.json()
      console.log("[v0] Available rooms data:", data) // Added debug logging

      const selectedRoom = data.rooms.find((r: Room) => r.id === roomId)

      if (!selectedRoom) {
        console.log(
          "[v0] Room not found. Looking for:",
          roomId,
          "Available rooms:",
          data.rooms.map((r: Room) => r.id),
        ) // Added debug logging
        throw new Error("Room not available")
      }

      console.log("[v0] Selected room:", selectedRoom) // Added debug logging
      setRoom(selectedRoom)
    } catch (err) {
      setError("Failed to load room details. Please try again.")
      console.error("Error fetching room:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleConfirmBooking = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.email) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      const bookingData = {
        roomId: roomId!,
        checkIn,
        checkOut,
        guests: Number.parseInt(guests!),
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email, // Always include email for guest bookings
        specialRequests: form.specialRequests,
      }

      console.log("[v0] Booking data:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const result = await response.json()

      if (user) {
        router.push(`/dashboard?booking=${result.booking.id}&success=true`)
      } else {
        router.push(`/booking/success?booking=${result.booking.id}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.")
      console.error("Error creating booking:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalAmount = room ? room.price_per_night * calculateNights() : 0

  const handleBackToSearch = () => {
    console.log("[v0] Navigating to booking section from booking complete page")
    window.location.href = "/#booking"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading booking details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">Room Not Found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">The selected room is no longer available.</p>
            <Button onClick={handleBackToSearch}>Back to Search</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Link href={`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}>
              <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Rooms</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </Link>
          </div>
          <div className="px-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Complete Your Booking
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
              Review your selection and provide guest details
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Guest Information
                </CardTitle>
                <CardDescription className="text-sm">Please provide your details for the reservation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4 sm:grid sm:gap-4 sm:grid-cols-2 sm:space-y-0">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      disabled={submitting}
                      className="mt-1 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      disabled={submitting}
                      className="mt-1 h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    disabled={submitting || !!user} // Only disable if user is logged in
                    className={`mt-1 h-11 ${user ? "bg-muted" : ""}`}
                  />
                  {user && <p className="text-xs text-muted-foreground mt-1">Email is linked to your account</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={submitting}
                    className="mt-1 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="text-sm font-medium">
                    Special Requests
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={form.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    placeholder="Any special requests or requirements..."
                    rows={3}
                    disabled={submitting}
                    className="mt-1 resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Room Details */}
                <div className="relative h-32 sm:h-36 rounded-lg overflow-hidden">
                  <Image src={room.image_url || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg leading-tight">{room.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4" />
                    Up to {room.max_guests} guests
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Check-in:</span>
                    <span className="text-right flex-1">{formatDate(checkIn!)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Check-out:</span>
                    <span className="text-right flex-1">{formatDate(checkOut!)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Guests:</span>
                    <span className="text-right flex-1">{guests}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <p className="text-sm font-medium mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${room.price_per_night} × {calculateNights()} nights
                    </span>
                    <span>${totalAmount}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmBooking}
                  disabled={submitting} // Removed user authentication requirement
                  className="w-full h-12 text-base font-medium"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  By confirming, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
