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

    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const status = searchParams.get("status")
    const roomType = searchParams.get("room_type")

    // Build query
    let query = supabase
      .from("bookings")
      .select(`
        *,
        room_instances!inner(
          room_number,
          floor,
          room_types!inner(
            name,
            price_per_night
          )
        )
      `)
      .order("check_in_date", { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte("check_in_date", startDate)
    }
    if (endDate) {
      query = query.lte("check_out_date", endDate)
    }
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (roomType && roomType !== "all") {
      query = query.eq("room_instances.room_types.name", roomType)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error("Export error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Booking ID",
        "Guest Name",
        "Email",
        "Phone",
        "Room Number",
        "Room Type",
        "Check-in Date",
        "Check-out Date",
        "Nights",
        "Total Amount",
        "Status",
        "Created At",
      ]

      const csvRows = [
        headers.join(","),
        ...bookings.map((booking) =>
          [
            booking.id,
            `"${booking.guest_name}"`,
            booking.guest_email,
            booking.guest_phone || "",
            booking.room_instances.room_number,
            booking.room_instances.room_types.name,
            booking.check_in_date,
            booking.check_out_date,
            booking.nights,
            booking.total_amount,
            booking.status,
            new Date(booking.created_at).toISOString().split("T")[0],
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bookings-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else {
      // Return JSON
      return NextResponse.json({ bookings })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
