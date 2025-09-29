import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendInquiryResponseEmail } from "@/lib/email/services"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: inquiry, error } = await supabase.from("email_inquiries").select("*").eq("id", params.id).single()

    if (error || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error fetching email inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, priority, category, assigned_to } = body

    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (priority !== undefined) updates.priority = priority
    if (category !== undefined) updates.category = category
    if (assigned_to !== undefined) updates.assigned_to = assigned_to

    const { data: inquiry, error } = await supabase
      .from("email_inquiries")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating email inquiry:", error)
      return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error updating email inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { responseMessage, staffName } = body

    if (!responseMessage || !staffName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the original inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("email_inquiries")
      .select("*")
      .eq("id", params.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    // Send response email
    const emailResult = await sendInquiryResponseEmail({
      customerEmail: inquiry.from_email,
      customerName: inquiry.from_name,
      originalSubject: inquiry.subject,
      originalMessage: inquiry.message,
      responseMessage,
      inquiryId: inquiry.id,
      staffName,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send response email" }, { status: 500 })
    }

    // Update inquiry status
    const { data: updatedInquiry, error: updateError } = await supabase
      .from("email_inquiries")
      .update({
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating inquiry status:", updateError)
    }

    return NextResponse.json({
      inquiry: updatedInquiry,
      emailSent: true,
      message: "Response sent successfully",
    })
  } catch (error) {
    console.error("Error sending inquiry response:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
