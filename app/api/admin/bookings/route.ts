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

    // Fetch all bookings with room instance and room type information
    const { data: bookings, error } = await supabase
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
        room_instance_id,
        room_instances (
          room_number,
          rooms (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bookings:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
