import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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

    // Get recent bookings (last 10)
    const { data: recentBookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        guest_first_name,
        guest_last_name,
        check_in_date,
        check_out_date,
        total_amount,
        status,
        created_at,
        room_instances (
          room_number,
          rooms (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching recent bookings:", error)
      return NextResponse.json({ error: "Failed to fetch recent bookings" }, { status: 500 })
    }

    // Format the response
    const formattedBookings = recentBookings.map((booking: any) => ({
      id: booking.id,
      guest_first_name: booking.guest_first_name,
      guest_last_name: booking.guest_last_name,
      room_number: booking.room_instances?.room_number || "Unknown",
      room_type: booking.room_instances?.rooms?.name || "Unknown",
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      status: booking.status,
      created_at: booking.created_at,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error("Recent bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
