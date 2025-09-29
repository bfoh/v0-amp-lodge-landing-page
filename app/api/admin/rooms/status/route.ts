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

    // Get all room instances with their current booking status
    const { data: roomInstances, error: roomsError } = await supabase
      .from("room_instances")
      .select(`
        id,
        room_number,
        floor,
        is_active,
        rooms (
          name
        )
      `)
      .eq("is_active", true)
      .order("room_number")

    if (roomsError) {
      console.error("Error fetching room instances:", roomsError)
      return NextResponse.json({ error: "Failed to fetch room instances" }, { status: 500 })
    }

    // Check current bookings for each room
    const roomStatuses = await Promise.all(
      roomInstances.map(async (room: any) => {
        const today = new Date().toISOString().split("T")[0]

        // Check if room has current booking
        const { data: currentBooking } = await supabase
          .from("bookings")
          .select(`
            id,
            guest_first_name,
            guest_last_name,
            check_in_date,
            check_out_date,
            status
          `)
          .eq("room_instance_id", room.id)
          .eq("status", "confirmed")
          .lte("check_in_date", today)
          .gte("check_out_date", today)
          .single()

        let status: "available" | "occupied" | "maintenance" | "cleaning" = "available"
        let currentBookingInfo = undefined

        if (currentBooking) {
          status = "occupied"
          currentBookingInfo = {
            guest_name: `${currentBooking.guest_first_name} ${currentBooking.guest_last_name}`,
            check_out_date: currentBooking.check_out_date,
          }
        }

        return {
          room_instance_id: room.id,
          room_number: room.room_number,
          room_type: room.rooms.name,
          status,
          current_booking: currentBookingInfo,
        }
      }),
    )

    return NextResponse.json(roomStatuses)
  } catch (error) {
    console.error("Room status API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
