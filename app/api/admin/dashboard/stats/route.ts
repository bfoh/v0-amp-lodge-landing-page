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

    const today = new Date().toISOString().split("T")[0]

    // Get total bookings
    const { count: totalBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .neq("status", "cancelled")

    // Get today's check-ins
    const { count: todayCheckIns } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("check_in_date", today)
      .eq("status", "confirmed")

    // Get today's check-outs
    const { count: todayCheckOuts } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("check_out_date", today)
      .eq("status", "confirmed")

    // Get total revenue
    const { data: revenueData } = await supabase.from("bookings").select("total_amount").neq("status", "cancelled")

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

    // Get new bookings today
    const { count: newBookingsToday } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`)

    // Calculate occupancy rate (simplified - rooms occupied today / total rooms)
    const { count: totalRooms } = await supabase
      .from("room_instances")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    const { count: occupiedRooms } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .lte("check_in_date", today)
      .gte("check_out_date", today)

    const occupancyRate = totalRooms ? Math.round(((occupiedRooms || 0) / totalRooms) * 100) : 0

    const stats = {
      totalBookings: totalBookings || 0,
      todayCheckIns: todayCheckIns || 0,
      todayCheckOuts: todayCheckOuts || 0,
      totalRevenue: totalRevenue,
      occupancyRate: occupancyRate,
      newBookingsToday: newBookingsToday || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
