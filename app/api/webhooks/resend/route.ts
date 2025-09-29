import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processInboundEmail } from "@/lib/email/inbound-processor"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (in production, you should verify the webhook signature)
    const signature = request.headers.get("resend-signature")

    // Process different types of webhook events
    const { type, data } = body

    console.log("📧 [v0] Received Resend webhook:", type, data)

    switch (type) {
      case "email.sent":
        await handleEmailSent(data)
        break
      case "email.delivered":
        await handleEmailDelivered(data)
        break
      case "email.bounced":
        await handleEmailBounced(data)
        break
      case "email.complained":
        await handleEmailComplained(data)
        break
      case "email.opened":
        await handleEmailOpened(data)
        break
      case "email.clicked":
        await handleEmailClicked(data)
        break
      case "email.received":
        await handleInboundEmail(data)
        break
      default:
        console.log("📧 [v0] Unknown webhook event type:", type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ [v0] Error processing Resend webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleEmailSent(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)
}

async function handleEmailDelivered(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "delivered",
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)
}

async function handleEmailBounced(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "bounced",
      error_message: data.reason || "Email bounced",
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)

  console.log("⚠️ [v0] Email bounced:", data.email_id, data.reason)
}

async function handleEmailComplained(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "complained",
      error_message: "Recipient marked as spam",
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)

  console.log("⚠️ [v0] Email complaint received:", data.email_id)
}

async function handleEmailOpened(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "opened",
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)
}

async function handleEmailClicked(data: any) {
  const supabase = await createClient()

  await supabase
    .from("email_logs")
    .update({
      status: "clicked",
      metadata: {
        clicked_url: data.url,
        click_count: (data.click_count || 0) + 1,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("email_id", data.email_id)
}

async function handleInboundEmail(data: any) {
  try {
    await processInboundEmail(data)
  } catch (error) {
    console.error("❌ [v0] Error processing inbound email:", error)
  }
}
