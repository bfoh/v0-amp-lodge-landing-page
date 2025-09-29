"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Calendar, Loader2, AlertCircle } from "lucide-react"

export function BookingForm() {
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // Set minimum dates
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (!checkInDate) {
      setCheckInDate(today.toISOString().split("T")[0])
    }
    if (!checkOutDate) {
      setCheckOutDate(tomorrow.toISOString().split("T")[0])
    }
  }, [])

  const searchAvailableRooms = async () => {
    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates")
      return
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("Check-out date must be after check-in date")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests.toString(),
      })

      router.push(`/rooms/available?${searchParams.toString()}`)
    } catch (error) {
      setError("Failed to search rooms. Please try again.")
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Calendar className="h-5 w-5 mr-2" />
            Search Available Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="checkIn" className="text-sm font-medium">
                Check-in Date
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="checkOut" className="text-sm font-medium">
                Check-out Date
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split("T")[0]}
                className="min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="guests" className="text-sm font-medium">
                Guests
              </Label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={searchAvailableRooms} disabled={isSearching} className="w-full min-h-[44px]" size="lg">
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search Rooms"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-md mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="text-center text-muted-foreground text-sm">
            <p>Search for available rooms and complete your booking in just a few steps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
