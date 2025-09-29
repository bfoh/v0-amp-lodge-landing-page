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

    // Fetch room instances with room type information
    const { data: roomInstances, error } = await supabase
      .from("room_instances")
      .select(`
        id,
        room_number,
        floor,
        is_active,
        rooms (
          id,
          name,
          description,
          max_guests,
          price_per_night
        )
      `)
      .eq("is_active", true)
      .order("room_number")

    if (error) {
      console.error("Error fetching room instances:", error)
      return NextResponse.json({ error: "Failed to fetch room instances" }, { status: 500 })
    }

    // Format the data for the calendar
    const formattedRooms = roomInstances.map((instance: any) => ({
      id: instance.id,
      room_number: instance.room_number,
      room_type: instance.rooms.name,
      floor: instance.floor,
      max_guests: instance.rooms.max_guests,
      price_per_night: instance.rooms.price_per_night,
    }))

    return NextResponse.json(formattedRooms)
  } catch (error) {
    console.error("Room instances API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
