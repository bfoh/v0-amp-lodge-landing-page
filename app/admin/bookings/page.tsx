"use client"

import { useState, useEffect, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import resourceTimelinePlugin from "@fullcalendar/resource-timeline"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Filter, Plus } from "lucide-react"
import { ManualBookingForm } from "@/components/admin/manual-booking-form"

interface RoomInstance {
  id: string
  room_number: string
  room_type: string
  floor: number
  color: string
}

interface BookingEvent {
  id: string
  resourceId: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    guestName: string
    guestEmail: string
    guestPhone: string
    roomType: string
    roomNumber: string
    totalAmount: number
    status: string
    specialRequests?: string
  }
}

interface BookingDetails {
  id: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  guest_phone: string
  room_number: string
  room_type: string
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  status: string
  special_requests?: string
  created_at: string
}

export default function BookingCalendarPage() {
  const [rooms, setRooms] = useState<RoomInstance[]>([])
  const [events, setEvents] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [roomTypeFilter, setRoomTypeFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showManualBookingForm, setShowManualBookingForm] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/rooms/instances"),
        fetch("/api/admin/bookings"),
      ])

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const formattedEvents = bookingsData.map((booking: any) => ({
          id: booking.id,
          resourceId: booking.room_instance_id,
          title: `${booking.guest_first_name} ${booking.guest_last_name}`,
          start: booking.check_in_date,
          end: booking.check_out_date,
          backgroundColor: getStatusColor(booking.status),
          borderColor: getStatusColor(booking.status),
          extendedProps: {
            guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
            guestEmail: booking.guest_email,
            guestPhone: booking.guest_phone,
            roomType: booking.room_instances?.rooms?.name || "Unknown",
            roomNumber: booking.room_instances?.room_number || "Unknown",
            totalAmount: booking.total_amount,
            status: booking.status,
            specialRequests: booking.special_requests,
          },
        }))
        setEvents(formattedEvents)
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10b981" // green
      case "pending":
        return "#f59e0b" // yellow
      case "cancelled":
        return "#ef4444" // red
      case "completed":
        return "#3b82f6" // blue
      default:
        return "#6b7280" // gray
    }
  }

  const getRoomTypeColor = (roomType: string) => {
    switch (roomType) {
      case "Standard Room":
        return "#3b82f6" // blue
      case "Deluxe Room":
        return "#10b981" // green
      case "Executive Suite":
        return "#f97316" // orange
      default:
        return "#6b7280" // gray
    }
  }

  const handleEventClick = async (clickInfo: any) => {
    const bookingId = clickInfo.event.id
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`)
      if (response.ok) {
        const bookingDetails = await response.json()
        setSelectedBooking(bookingDetails)
        setShowBookingModal(true)
      }
    } catch (error) {
      console.error("Failed to fetch booking details:", error)
    }
  }

  const handleBookingCreated = () => {
    setShowManualBookingForm(false)
    fetchCalendarData() // Refresh the calendar data
  }

  const filteredRooms = roomTypeFilter === "all" ? rooms : rooms.filter((room) => room.room_type === roomTypeFilter)

  const filteredEvents =
    roomTypeFilter === "all"
      ? events
      : events.filter((event) => {
          const room = rooms.find((r) => r.id === event.resourceId)
          return room?.room_type === roomTypeFilter
        })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Calendar</h1>
          <p className="text-muted-foreground">Manage room bookings and availability</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              <SelectItem value="Standard Room">Standard Rooms</SelectItem>
              <SelectItem value="Deluxe Room">Deluxe Rooms</SelectItem>
              <SelectItem value="Executive Suite">Executive Suites</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowManualBookingForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
              <span className="text-sm">Standard Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
              <span className="text-sm">Deluxe Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }}></div>
              <span className="text-sm">Executive Suite</span>
            </div>
            <div className="border-l border-muted-foreground/20 pl-6 flex gap-4">
              <Badge style={{ backgroundColor: "#10b981" }}>Confirmed</Badge>
              <Badge style={{ backgroundColor: "#f59e0b" }}>Pending</Badge>
              <Badge style={{ backgroundColor: "#3b82f6" }}>Completed</Badge>
              <Badge style={{ backgroundColor: "#ef4444" }}>Cancelled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "resourceTimelineMonth,resourceTimelineWeek",
            }}
            resources={filteredRooms.map((room) => ({
              id: room.id,
              title: `Room ${room.room_number}`,
              extendedProps: {
                roomType: room.room_type,
                floor: room.floor,
              },
            }))}
            events={filteredEvents}
            eventClick={handleEventClick}
            height="600px"
            resourceAreaHeaderContent="Rooms"
            resourceAreaWidth="200px"
            slotMinWidth={50}
            eventDisplay="block"
            eventTextColor="#ffffff"
            resourceLabelContent={(arg) => {
              const room = rooms.find((r) => r.id === arg.resource.id)
              return {
                html: `
                  <div class="flex items-center gap-2 p-2">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${getRoomTypeColor(room?.room_type || "")}"></div>
                    <div>
                      <div class="font-medium">Room ${room?.room_number}</div>
                      <div class="text-xs text-muted-foreground">${room?.room_type}</div>
                    </div>
                  </div>
                `,
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View and manage booking information</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedBooking.guest_first_name} {selectedBooking.guest_last_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedBooking.guest_email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedBooking.guest_phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Booking Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Room:</strong> {selectedBooking.room_number} ({selectedBooking.room_type})
                    </p>
                    <p>
                      <strong>Guests:</strong> {selectedBooking.guests}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge style={{ backgroundColor: getStatusColor(selectedBooking.status) }}>
                        {selectedBooking.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Check-in:</strong> {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Check-out:</strong> {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Booked:</strong> {new Date(selectedBooking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Total Amount:</strong> ₵{selectedBooking.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <h4 className="font-medium mb-2">Special Requests</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedBooking.special_requests}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                  Close
                </Button>
                <Button>Edit Booking</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Booking Form Modal */}
      <Dialog open={showManualBookingForm} onOpenChange={setShowManualBookingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ManualBookingForm onBookingCreated={handleBookingCreated} onCancel={() => setShowManualBookingForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
