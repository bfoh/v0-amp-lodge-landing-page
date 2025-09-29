import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const checkInDate = searchParams.get("checkIn")
    const checkOutDate = searchParams.get("checkOut")
    const guests = Number.parseInt(searchParams.get("guests") || "1")

    // If no dates provided, return all active rooms
    if (!checkInDate || !checkOutDate) {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_active", true)
        .gte("max_guests", guests)
        .order("price_per_night", { ascending: true })

      if (error) {
        console.error("Rooms fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
      }

      return NextResponse.json({ rooms })
    }

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return NextResponse.json({ error: "Check-in date cannot be in the past" }, { status: 400 })
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Use our database function to get available rooms
    const { data: availableRooms, error } = await supabase.rpc("get_available_rooms", {
      check_in_param: checkInDate,
      check_out_param: checkOutDate,
      guests_param: guests,
    })

    if (error) {
      console.error("Available rooms fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch available rooms" }, { status: 500 })
    }

    return NextResponse.json({ rooms: availableRooms })
  } catch (error) {
    console.error("Available rooms API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
