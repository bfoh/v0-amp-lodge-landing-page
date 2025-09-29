import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmationEmail } from "@/lib/email/services"
import { sendBookingConfirmationWhatsApp } from "@/lib/whatsapp/services"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user has admin or hotel employee role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "hotel_employee"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { roomInstanceId, checkIn, checkOut, guests, firstName, lastName, phone, specialRequests, email } = body

    if (!roomInstanceId || !checkIn || !checkOut || !guests || !firstName || !lastName || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 })
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Get room instance details
    const { data: roomInstance, error: roomError } = await supabase
      .from("room_instances")
      .select(`
        id,
        room_number,
        rooms (
          id,
          name,
          max_guests,
          price_per_night
        )
      `)
      .eq("id", roomInstanceId)
      .eq("is_active", true)
      .single()

    if (roomError || !roomInstance) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if guests exceed room capacity
    if (guests > roomInstance.rooms.max_guests) {
      return NextResponse.json(
        {
          error: `This room can accommodate maximum ${roomInstance.rooms.max_guests} guests`,
        },
        { status: 400 },
      )
    }

    // Check availability
    const { data: isAvailable, error: availabilityError } = await supabase.rpc("check_room_instance_availability", {
      room_instance_id_param: roomInstanceId,
      check_in_param: checkIn,
      check_out_param: checkOut,
    })

    if (availabilityError) {
      console.error("Availability check error:", availabilityError)
      return NextResponse.json({ error: "Error checking availability" }, { status: 500 })
    }

    if (!isAvailable) {
      return NextResponse.json({ error: "Room is not available for the selected dates" }, { status: 409 })
    }

    // Calculate total amount
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = roomInstance.rooms.price_per_night * nights

    const bookingData = {
      user_id: null, // Manual booking, no user required
      room_instance_id: roomInstanceId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guests: guests,
      total_amount: totalAmount,
      special_requests: specialRequests || null,
      status: "confirmed",
      // Guest information fields
      guest_email: email,
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_phone: phone,
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select(`
        *,
        room_instances (
          room_number,
          rooms (
            name,
            description
          )
        )
      `)
      .single()

    if (bookingError) {
      console.error("Booking creation error:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    console.log("[v0] Manual booking created successfully:", booking.id)

    // Send confirmation email and WhatsApp
    try {
      const emailResult = await sendBookingConfirmationEmail({
        userEmail: email,
        userName: `${firstName} ${lastName}`,
        bookingId: booking.id.toString(),
        roomName: booking.room_instances.rooms.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests,
        totalAmount: totalAmount,
        specialRequests: specialRequests,
      })

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error)
      } else {
        console.log("[v0] Email confirmation sent successfully")
      }

      const whatsappResult = await sendBookingConfirmationWhatsApp({
        phoneNumber: phone,
        userName: `${firstName} ${lastName}`,
        bookingId: booking.id.toString(),
        roomName: booking.room_instances.rooms.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests,
        totalAmount: totalAmount,
        specialRequests: specialRequests,
      })

      if (!whatsappResult.success) {
        console.error("WhatsApp sending failed:", whatsappResult.error)
      } else {
        console.log("[v0] WhatsApp confirmation sent successfully")
      }
    } catch (notificationError) {
      console.error("Notification sending error:", notificationError)
      // Don't fail the booking if notifications fail
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Manual booking created successfully! Confirmation email and WhatsApp message have been sent.",
    })
  } catch (error) {
    console.error("Manual booking API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
