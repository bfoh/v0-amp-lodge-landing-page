import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Fetch specific booking details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
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
        updated_at,
        room_instance_id,
        room_instances (
          room_number,
          rooms (
            name
          )
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching booking:", error)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Format the response
    const formattedBooking = {
      ...booking,
      room_number: booking.room_instances?.room_number,
      room_type: booking.room_instances?.rooms?.name,
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error("Booking details API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
