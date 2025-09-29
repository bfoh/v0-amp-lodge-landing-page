import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    let query = supabase
      .from("email_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error("Error fetching email logs:", error)
      return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 })
    }

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Email logs API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
