"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Wifi, Car, Coffee, Waves } from "lucide-react"
import Image from "next/image"

interface Room {
  id: string // Changed from number to string to handle UUIDs
  name: string
  description: string
  price_per_night: number
  max_guests: number
  amenities: string[]
  image_url: string
}

export default function AvailableRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const guests = searchParams.get("guests")

  useEffect(() => {
    if (!checkIn || !checkOut || !guests) {
      router.push("/")
      return
    }

    fetchAvailableRooms()
  }, [checkIn, checkOut, guests])

  const fetchAvailableRooms = async () => {
    try {
      console.log("[v0] Fetching available rooms...") // Added debug logging
      setLoading(true)
      const response = await fetch(`/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)

      if (!response.ok) {
        throw new Error("Failed to fetch available rooms")
      }

      const data = await response.json()
      console.log("[v0] Fetched rooms:", data.rooms) // Added debug logging
      setRooms(data.rooms)
    } catch (err) {
      setError("Failed to load available rooms. Please try again.")
      console.error("Error fetching rooms:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRoom = (roomId: string) => {
    // Changed parameter type from number to string
    const bookingParams = new URLSearchParams({
      roomId: roomId, // No need to convert to string since it's already a string
      checkIn: checkIn!,
      checkOut: checkOut!,
      guests: guests!,
    })

    console.log("[v0] Selecting room with ID:", roomId) // Added debug logging
    router.push(`/booking/complete?${bookingParams.toString()}`)
  }

  const handleBackToSearch = () => {
    console.log("[v0] Navigating to booking section from available rooms page")
    window.location.href = "/#booking"
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "parking":
        return <Car className="h-4 w-4" />
      case "breakfast":
        return <Coffee className="h-4 w-4" />
      case "pool":
        return <Waves className="h-4 w-4" />
      default:
        return null
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching for available rooms...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSearch}
            className="min-h-[44px] self-start bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Available Rooms</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {formatDate(checkIn!)} - {formatDate(checkOut!)} • {guests}{" "}
              {Number.parseInt(guests!) === 1 ? "Guest" : "Guests"} • {calculateNights()}{" "}
              {calculateNights() === 1 ? "Night" : "Nights"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive text-sm sm:text-base">{error}</p>
          </div>
        )}

        {rooms.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">No Rooms Available</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Sorry, no rooms are available for your selected dates and guest count.
            </p>
            <Button onClick={handleBackToSearch} className="min-h-[44px]">
              Try Different Dates
            </Button>
          </div>
        )}

        {/* Available Rooms */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-[4/3]">
                <Image src={room.image_url || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
              </div>

              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">{room.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      <Users className="h-4 w-4 inline mr-1" />
                      Up to {room.max_guests} guests
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-primary">${room.price_per_night}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground mb-4 line-clamp-2 text-sm sm:text-base">{room.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </Badge>
                  ))}
                </div>

                {/* Total Price */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Total for {calculateNights()} {calculateNights() === 1 ? "night" : "nights"}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      ${room.price_per_night * calculateNights()}
                    </span>
                  </div>
                </div>

                <Button onClick={() => handleSelectRoom(room.id)} className="w-full min-h-[44px]" size="lg">
                  Select Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
