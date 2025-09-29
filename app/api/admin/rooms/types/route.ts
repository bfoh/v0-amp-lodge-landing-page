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

    // Fetch all room types
    const { data: roomTypes, error } = await supabase.from("rooms").select("*").order("name")

    if (error) {
      console.error("Error fetching room types:", error)
      return NextResponse.json({ error: "Failed to fetch room types" }, { status: 500 })
    }

    return NextResponse.json(roomTypes)
  } catch (error) {
    console.error("Room types API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user has admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, max_guests, price_per_night, amenities, image_url, is_active } = body

    if (!name || !description || !max_guests || !price_per_night) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: roomType, error } = await supabase
      .from("rooms")
      .insert({
        name,
        description,
        max_guests,
        price_per_night,
        amenities: amenities || [],
        image_url: image_url || null,
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating room type:", error)
      return NextResponse.json({ error: "Failed to create room type" }, { status: 500 })
    }

    return NextResponse.json(roomType)
  } catch (error) {
    console.error("Room type creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
