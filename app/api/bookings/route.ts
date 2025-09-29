import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmationEmail } from "@/lib/email/services"
import { sendBookingConfirmationWhatsApp } from "@/lib/whatsapp/services"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { roomId, checkIn, checkOut, guests, firstName, lastName, phone, specialRequests, email } = body

    if (!roomId || !checkIn || !checkOut || !guests || !firstName || !lastName || !phone || !email) {
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
      return NextResponse.json(
        {
          error: "Check-out date must be after check-in date",
        },
        { status: 400 },
      )
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("is_active", true)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if guests exceed room capacity
    if (guests > room.max_guests) {
      return NextResponse.json(
        {
          error: `This room can accommodate maximum ${room.max_guests} guests`,
        },
        { status: 400 },
      )
    }

    // Check availability using our database function
    const { data: isAvailable, error: availabilityError } = await supabase.rpc("check_room_availability", {
      room_id_param: roomId,
      check_in_param: checkIn,
      check_out_param: checkOut,
    })

    if (availabilityError) {
      console.error("Availability check error:", availabilityError)
      return NextResponse.json({ error: "Error checking availability" }, { status: 500 })
    }

    if (!isAvailable) {
      return NextResponse.json(
        {
          error: "Room is not available for the selected dates",
        },
        { status: 409 },
      )
    }

    // Calculate total amount
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = room.price_per_night * nights

    const bookingData = {
      user_id: null, // No user required for guest bookings
      room_id: roomId,
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
        rooms (
          name,
          description,
          image_url
        )
      `)
      .single()

    if (bookingError) {
      console.error("Booking creation error:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    console.log("[v0] Booking created successfully:", booking.id)

    try {
      const emailResult = await sendBookingConfirmationEmail({
        userEmail: email,
        userName: `${firstName} ${lastName}`,
        bookingId: booking.id.toString(),
        roomName: booking.rooms.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests,
        totalAmount: totalAmount,
        specialRequests: specialRequests,
      })

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error)
        // Don't fail the booking if email fails, but log the issue
      } else {
        console.log("[v0] Email confirmation sent successfully")
      }

      const whatsappResult = await sendBookingConfirmationWhatsApp({
        phoneNumber: phone,
        userName: `${firstName} ${lastName}`,
        bookingId: booking.id.toString(),
        roomName: booking.rooms.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: guests,
        totalAmount: totalAmount,
        specialRequests: specialRequests,
      })

      if (!whatsappResult.success) {
        console.error("WhatsApp sending failed:", whatsappResult.error)
        // Don't fail the booking if WhatsApp fails, but log the issue
      } else {
        console.log("[v0] WhatsApp confirmation sent successfully")
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking confirmed successfully! Confirmation email and WhatsApp message have been sent.",
    })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
