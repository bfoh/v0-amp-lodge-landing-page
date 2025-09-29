"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Calendar, User, LogOut, CheckCircle, Mail, Loader2 } from "lucide-react"
import { signOut } from "@/lib/auth-actions"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

interface Room {
  name: string
  image_url: string | null
}

interface Booking {
  id: number
  user_id: string
  room_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  status: string
  created_at: string
  rooms: Room | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
        } else {
          setProfile(profileData)
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            rooms (
              name,
              image_url
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (bookingsError) {
          console.error("Bookings error:", bookingsError)
          setError("Failed to load bookings")
        } else {
          setBookings(bookingsData || [])
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  const bookingId = searchParams.get("booking")
  const isSuccess = searchParams.get("success") === "true"
  const newBooking = bookings?.find((b) => b.id.toString() === bookingId)

  const handleBookingNavigation = () => {
    console.log("[v0] Navigating to booking section from dashboard")
    // Use window.location for cross-page navigation with hash
    window.location.href = "/#booking"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/amp-lodge-logo.png" alt="AMP Lodge" className="h-6 sm:h-8 md:h-10 w-auto object-contain" />
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Welcome, {profile?.first_name || user.email}
              </span>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit" className="min-h-[44px] px-2 sm:px-4">
                  <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your bookings and account settings</p>
        </div>

        {isSuccess && newBooking && (
          <Alert className="mb-6 sm:mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold mb-1 text-sm sm:text-base">Booking Confirmed Successfully!</p>
                  <p className="text-xs sm:text-sm">
                    Your reservation for <strong>{newBooking.rooms?.name}</strong> has been confirmed.
                  </p>
                  <div className="mt-2 p-2 bg-green-100 rounded border border-green-200">
                    <div className="flex items-center text-xs sm:text-sm">
                      <Mail className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="font-medium">Confirmation Email Sent!</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      A detailed confirmation email has been sent to <strong>{user.email}</strong>
                      <br />
                      <em>(In development mode, emails are simulated - check browser console for details)</em>
                    </p>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <User className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleBookingNavigation} className="w-full min-h-[44px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  Make New Booking
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent min-h-[44px]">
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: Booking) => (
                      <div
                        key={booking.id}
                        className={`border rounded-lg p-4 hover:border-border/40 transition-colors ${
                          booking.id.toString() === bookingId && isSuccess
                            ? "border-green-200 bg-green-50/50"
                            : "border-border/20"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base sm:text-lg">{booking.rooms?.name}</h3>
                              {booking.id.toString() === bookingId && isSuccess && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                              {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                              {new Date(booking.check_out_date).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                              <span>Guests: {booking.guests}</span>
                              <span>Total: ${booking.total_amount}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : booking.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          {booking.rooms?.image_url && (
                            <img
                              src={booking.rooms.image_url || "/placeholder.svg"}
                              alt={booking.rooms.name}
                              className="w-full sm:w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Start planning your stay at AMP Lodge
                    </p>
                    <Button onClick={handleBookingNavigation} className="min-h-[44px]">
                      Make Your First Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
