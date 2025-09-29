import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const checkIn = searchParams.get("checkIn")
    const checkOut = searchParams.get("checkOut")

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "Check-in and check-out dates are required" }, { status: 400 })
    }

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

    // Get all room instances
    const { data: allRooms, error: roomsError } = await supabase
      .from("room_instances")
      .select(`
        id,
        room_number,
        floor,
        rooms (
          id,
          name,
          max_guests,
          price_per_night
        )
      `)
      .eq("is_active", true)

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError)
      return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
    }

    // Check availability for each room
    const availableRooms = []

    for (const room of allRooms) {
      const { data: isAvailable, error: availabilityError } = await supabase.rpc("check_room_instance_availability", {
        room_instance_id_param: room.id,
        check_in_param: checkIn,
        check_out_param: checkOut,
      })

      if (availabilityError) {
        console.error("Availability check error:", availabilityError)
        continue
      }

      if (isAvailable) {
        availableRooms.push({
          id: room.id,
          room_number: room.room_number,
          room_type: room.rooms.name,
          max_guests: room.rooms.max_guests,
          price_per_night: room.rooms.price_per_night,
        })
      }
    }

    return NextResponse.json(availableRooms)
  } catch (error) {
    console.error("Room availability API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
