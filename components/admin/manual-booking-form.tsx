"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const bookingSchema = z.object({
  guestFirstName: z.string().min(1, "First name is required"),
  guestLastName: z.string().min(1, "Last name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().min(1, "Phone number is required"),
  roomInstanceId: z.string().min(1, "Room selection is required"),
  checkInDate: z.date({
    required_error: "Check-in date is required",
  }),
  checkOutDate: z.date({
    required_error: "Check-out date is required",
  }),
  guests: z.number().min(1, "At least 1 guest is required"),
  specialRequests: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface RoomInstance {
  id: string
  room_number: string
  room_type: string
  max_guests: number
  price_per_night: number
}

interface ManualBookingFormProps {
  onBookingCreated: () => void
  onCancel: () => void
}

export function ManualBookingForm({ onBookingCreated, onCancel }: ManualBookingFormProps) {
  const [rooms, setRooms] = useState<RoomInstance[]>([])
  const [availableRooms, setAvailableRooms] = useState<RoomInstance[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomInstance | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const watchedValues = watch()
  const { checkInDate, checkOutDate, roomInstanceId, guests } = watchedValues

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (checkInDate && checkOutDate && checkInDate < checkOutDate) {
      checkAvailability()
    } else {
      setAvailableRooms([])
      setSelectedRoom(null)
      setTotalAmount(0)
    }
  }, [checkInDate, checkOutDate])

  useEffect(() => {
    if (roomInstanceId) {
      const room = rooms.find((r) => r.id === roomInstanceId)
      setSelectedRoom(room || null)
      calculateTotal(room)
    }
  }, [roomInstanceId, checkInDate, checkOutDate, rooms])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/admin/rooms/instances")
      if (response.ok) {
        const roomsData = await response.json()
        setRooms(roomsData)
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    }
  }

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) return

    setIsCheckingAvailability(true)
    try {
      const response = await fetch(
        `/api/admin/rooms/availability?checkIn=${format(checkInDate, "yyyy-MM-dd")}&checkOut=${format(checkOutDate, "yyyy-MM-dd")}`,
      )
      if (response.ok) {
        const availableRoomsData = await response.json()
        setAvailableRooms(availableRoomsData)
      }
    } catch (error) {
      console.error("Failed to check availability:", error)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const calculateTotal = (room: RoomInstance | null) => {
    if (!room || !checkInDate || !checkOutDate) {
      setTotalAmount(0)
      return
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    setTotalAmount(room.price_per_night * nights)
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    try {
      const bookingData = {
        roomInstanceId: data.roomInstanceId,
        checkIn: format(data.checkInDate, "yyyy-MM-dd"),
        checkOut: format(data.checkOutDate, "yyyy-MM-dd"),
        guests: data.guests,
        firstName: data.guestFirstName,
        lastName: data.guestLastName,
        email: data.guestEmail,
        phone: data.guestPhone,
        specialRequests: data.specialRequests,
        isManualBooking: true,
      }

      const response = await fetch("/api/admin/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        reset()
        onBookingCreated()
      } else {
        const errorData = await response.json()
        console.error("Booking creation failed:", errorData.error)
      }
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Manual Booking</CardTitle>
        <CardDescription>Add a new booking received offline or over the phone</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestFirstName">First Name</Label>
                <Input
                  id="guestFirstName"
                  {...register("guestFirstName")}
                  className={errors.guestFirstName ? "border-red-500" : ""}
                />
                {errors.guestFirstName && <p className="text-sm text-red-500">{errors.guestFirstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="guestLastName">Last Name</Label>
                <Input
                  id="guestLastName"
                  {...register("guestLastName")}
                  className={errors.guestLastName ? "border-red-500" : ""}
                />
                {errors.guestLastName && <p className="text-sm text-red-500">{errors.guestLastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  {...register("guestEmail")}
                  className={errors.guestEmail ? "border-red-500" : ""}
                />
                {errors.guestEmail && <p className="text-sm text-red-500">{errors.guestEmail.message}</p>}
              </div>
              <div>
                <Label htmlFor="guestPhone">Phone</Label>
                <Input
                  id="guestPhone"
                  {...register("guestPhone")}
                  className={errors.guestPhone ? "border-red-500" : ""}
                />
                {errors.guestPhone && <p className="text-sm text-red-500">{errors.guestPhone.message}</p>}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkInDate && "text-muted-foreground",
                        errors.checkInDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => setValue("checkInDate", date!)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.checkInDate && <p className="text-sm text-red-500">{errors.checkInDate.message}</p>}
              </div>
              <div>
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOutDate && "text-muted-foreground",
                        errors.checkOutDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => setValue("checkOutDate", date!)}
                      disabled={(date) => date <= (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.checkOutDate && <p className="text-sm text-red-500">{errors.checkOutDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max={selectedRoom?.max_guests || 10}
                  {...register("guests", { valueAsNumber: true })}
                  className={errors.guests ? "border-red-500" : ""}
                />
                {errors.guests && <p className="text-sm text-red-500">{errors.guests.message}</p>}
                {selectedRoom && guests > selectedRoom.max_guests && (
                  <p className="text-sm text-red-500">Maximum {selectedRoom.max_guests} guests for this room</p>
                )}
              </div>
              <div>
                <Label>Room Selection</Label>
                <Select
                  value={roomInstanceId}
                  onValueChange={(value) => setValue("roomInstanceId", value)}
                  disabled={isCheckingAvailability || availableRooms.length === 0}
                >
                  <SelectTrigger className={errors.roomInstanceId ? "border-red-500" : ""}>
                    <SelectValue placeholder={isCheckingAvailability ? "Checking availability..." : "Select room"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type} (₵{room.price_per_night}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomInstanceId && <p className="text-sm text-red-500">{errors.roomInstanceId.message}</p>}
                {checkInDate && checkOutDate && availableRooms.length === 0 && !isCheckingAvailability && (
                  <p className="text-sm text-yellow-600">No rooms available for selected dates</p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <Textarea
              id="specialRequests"
              {...register("specialRequests")}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          {/* Booking Summary */}
          {selectedRoom && totalAmount > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>
                    {selectedRoom.room_number} ({selectedRoom.room_type})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>
                    {checkInDate && checkOutDate
                      ? `${format(checkInDate, "MMM dd")} - ${format(checkOutDate, "MMM dd")}`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>
                    {checkInDate && checkOutDate
                      ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total Amount:</span>
                  <span>₵{totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedRoom || totalAmount === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Booking
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
