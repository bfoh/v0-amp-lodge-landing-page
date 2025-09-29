import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// Webhook to handle WhatsApp message status updates from Twilio
export async function handleWhatsAppWebhook(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)

    const messageSid = params.get("MessageSid")
    const messageStatus = params.get("MessageStatus")
    const from = params.get("From")
    const to = params.get("To")

    console.log("📱 [v0] WhatsApp webhook received:", {
      messageSid,
      messageStatus,
      from,
      to,
    })

    if (messageSid && messageStatus) {
      // Update the WhatsApp log with delivery status
      const supabase = createAdminClient()

      const { error } = await supabase
        .from("whatsapp_logs")
        .update({
          status: messageStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("message_sid", messageSid)

      if (error) {
        console.error("❌ [v0] Error updating WhatsApp log status:", error)
      } else {
        console.log("✅ [v0] WhatsApp log status updated successfully")
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ [v0] WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
