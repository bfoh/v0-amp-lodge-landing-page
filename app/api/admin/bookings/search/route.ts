import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

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

    // Build the query
    let query = supabase.from("bookings").select(`
        id,
        guest_first_name,
        guest_last_name,
        guest_email,
        guest_phone,
        check_in_date,
        check_out_date,
        guests,
        total_amount,
        status,
        special_requests,
        created_at,
        room_instances (
          room_number,
          rooms (
            name
          )
        )
      `)

    // Apply filters based on search parameters
    const guestName = searchParams.get("guestName")
    const guestEmail = searchParams.get("guestEmail")
    const roomNumber = searchParams.get("roomNumber")
    const roomType = searchParams.get("roomType")
    const status = searchParams.get("status")
    const checkInFrom = searchParams.get("checkInFrom")
    const checkInTo = searchParams.get("checkInTo")
    const checkOutFrom = searchParams.get("checkOutFrom")
    const checkOutTo = searchParams.get("checkOutTo")

    // Apply guest name filter (search in both first and last name)
    if (guestName) {
      query = query.or(`guest_first_name.ilike.%${guestName}%,guest_last_name.ilike.%${guestName}%`)
    }

    // Apply guest email filter
    if (guestEmail) {
      query = query.ilike("guest_email", `%${guestEmail}%`)
    }

    // Apply status filter
    if (status) {
      query = query.eq("status", status)
    }

    // Apply date range filters
    if (checkInFrom) {
      query = query.gte("check_in_date", checkInFrom)
    }
    if (checkInTo) {
      query = query.lte("check_in_date", checkInTo)
    }
    if (checkOutFrom) {
      query = query.gte("check_out_date", checkOutFrom)
    }
    if (checkOutTo) {
      query = query.lte("check_out_date", checkOutTo)
    }

    // Execute the query
    const { data: bookings, error } = await query.order("created_at", { ascending: false }).limit(100)

    if (error) {
      console.error("Error searching bookings:", error)
      return NextResponse.json({ error: "Failed to search bookings" }, { status: 500 })
    }

    // Filter by room number and room type (since these require joins)
    let filteredBookings = bookings

    if (roomNumber) {
      filteredBookings = filteredBookings.filter((booking: any) =>
        booking.room_instances?.room_number?.toLowerCase().includes(roomNumber.toLowerCase()),
      )
    }

    if (roomType) {
      filteredBookings = filteredBookings.filter((booking: any) =>
        booking.room_instances?.rooms?.name?.toLowerCase().includes(roomType.toLowerCase()),
      )
    }

    // Format the response
    const formattedBookings = filteredBookings.map((booking: any) => ({
      id: booking.id,
      guest_first_name: booking.guest_first_name,
      guest_last_name: booking.guest_last_name,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      room_number: booking.room_instances?.room_number || "Unknown",
      room_type: booking.room_instances?.rooms?.name || "Unknown",
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      guests: booking.guests,
      total_amount: booking.total_amount,
      status: booking.status,
      special_requests: booking.special_requests,
      created_at: booking.created_at,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error("Booking search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
