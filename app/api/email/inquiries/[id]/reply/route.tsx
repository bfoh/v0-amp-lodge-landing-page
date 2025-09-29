import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/services"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { content } = await request.json()

    // Get the original inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("email_inquiries")
      .select("*")
      .eq("id", params.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    // Send reply email
    const emailResult = await sendEmail({
      to: inquiry.from_email,
      subject: `Re: ${inquiry.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for contacting AMP Lodge</h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your original message:</strong></p>
            <p style="font-style: italic;">${inquiry.content}</p>
          </div>
          <div style="margin: 20px 0;">
            <p><strong>Our response:</strong></p>
            <p>${content.replace(/\n/g, "<br>")}</p>
          </div>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            AMP Lodge Team<br>
            <a href="mailto:info@amplodge.com">info@amplodge.com</a>
          </p>
        </div>
      `,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
    }

    // Update inquiry status
    const { error: updateError } = await supabase
      .from("email_inquiries")
      .update({
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating inquiry status:", updateError)
    }

    // Log the reply
    await supabase.from("email_logs").insert({
      to_email: inquiry.from_email,
      subject: `Re: ${inquiry.subject}`,
      status: "sent",
      template_name: "inquiry_reply",
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reply API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
