import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = supabase
      .from("email_inquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (category) {
      query = query.eq("category", category)
    }

    if (priority) {
      query = query.eq("priority", priority)
    }

    const { data: inquiries, error, count } = await query

    if (error) {
      console.error("Error fetching email inquiries:", error)
      return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching email inquiries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { from_email, from_name, subject, message, category, priority } = body

    if (!from_email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: inquiry, error } = await supabase
      .from("email_inquiries")
      .insert({
        from_email,
        from_name: from_name || from_email.split("@")[0],
        subject,
        message,
        category: category || "general",
        priority: priority || "normal",
        status: "new",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating email inquiry:", error)
      return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error creating email inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
