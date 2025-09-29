import { twilioClient, WHATSAPP_CONFIG } from "./twilio-client"
import { createAdminClient } from "@/lib/supabase/server"

interface BookingWhatsAppData {
  phoneNumber: string
  userName: string
  bookingId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  specialRequests?: string
}

interface WhatsAppActivity {
  type: string
  recipient: string
  message: string
  status: "sent" | "failed" | "delivered" | "read"
  message_sid?: string
  error_message?: string
  metadata?: Record<string, any>
}

function formatPhoneNumber(phone: string): string {
  // Remove any existing whatsapp: prefix
  let cleanPhone = phone.replace(/^whatsapp:/, "")

  // Remove all non-digit characters except +
  cleanPhone = cleanPhone.replace(/[^\d+]/g, "")

  // Ensure it starts with +
  if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone
  }

  return `whatsapp:${cleanPhone}`
}

export async function sendBookingConfirmationWhatsApp(data: BookingWhatsAppData) {
  try {
    if (!WHATSAPP_CONFIG.hasRequiredEnvVars) {
      console.log("📱 [v0] WhatsApp environment variables not configured, skipping WhatsApp message...")
      return {
        success: true,
        message: "WhatsApp messaging is not configured (missing environment variables)",
      }
    }

    // Check if WhatsApp is enabled
    if (!WHATSAPP_CONFIG.enabled) {
      console.log("📱 [v0] WhatsApp messaging is disabled, skipping...")
      return { success: true, message: "WhatsApp messaging is disabled" }
    }

    if (!twilioClient) {
      console.log("📱 [v0] Twilio client not initialized, skipping WhatsApp message...")
      return {
        success: true,
        message: "WhatsApp messaging is not configured (Twilio client not initialized)",
      }
    }

    console.log("📱 [v0] Sending booking confirmation WhatsApp to:", data.phoneNumber)

    const formattedPhone = formatPhoneNumber(data.phoneNumber)

    // Format dates to match email format
    const checkInFormatted = new Date(data.checkInDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const checkOutFormatted = new Date(data.checkOutDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Create detailed message matching email content
    let message = `🏨 *AMP LODGE*
*Booking Confirmation*

Dear ${data.userName},

Thank you for choosing AMP Lodge! Your booking has been confirmed and we're excited to welcome you.

📋 *BOOKING DETAILS*
━━━━━━━━━━━━━━━━━━━━
🆔 *Booking ID:* ${data.bookingId}
🏠 *Room:* ${data.roomName}
📅 *Check-in:* ${checkInFormatted}
📅 *Check-out:* ${checkOutFormatted}
👥 *Guests:* ${data.guests}
💰 *Total Amount:* $${data.totalAmount}`

    // Add special requests if provided
    if (data.specialRequests && data.specialRequests.trim()) {
      message += `

📝 *Special Requests:*
${data.specialRequests}`
    }

    message += `

⚠️ *IMPORTANT INFORMATION*
• Check-in time: 3:00 PM
• Check-out time: 11:00 AM
• Please bring a valid ID for check-in
• Contact us if you need to modify your booking

We look forward to providing you with an exceptional stay at AMP Lodge. If you have any questions or need assistance, please don't hesitate to contact our team.

Best regards,
*The AMP Lodge Team*

📍 AMP Lodge | Kumasi, Ghana
📧 info@amplodge.com | 📞 +233 XX XXX XXXX`

    const whatsappMessage = await twilioClient.messages.create({
      from: WHATSAPP_CONFIG.from,
      to: formattedPhone,
      body: message,
    })

    console.log("✅ [v0] Booking confirmation WhatsApp sent successfully!", {
      sid: whatsappMessage.sid,
      status: whatsappMessage.status,
    })

    // Log WhatsApp activity to database
    await logWhatsAppActivity({
      type: "booking_confirmation",
      recipient: data.phoneNumber,
      message: message,
      status: "sent",
      message_sid: whatsappMessage.sid,
      metadata: {
        bookingId: data.bookingId,
        roomName: data.roomName,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guests: data.guests,
        totalAmount: data.totalAmount,
      },
    })

    return {
      success: true,
      messageSid: whatsappMessage.sid,
      message: "Booking confirmation WhatsApp sent successfully",
    }
  } catch (error) {
    console.error("❌ [v0] Error sending booking confirmation WhatsApp:", error)

    // Log failed WhatsApp attempt
    await logWhatsAppActivity({
      type: "booking_confirmation",
      recipient: data.phoneNumber,
      message: "Detailed booking confirmation message",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: { bookingId: data.bookingId },
    })

    return { success: false, error: "Failed to send confirmation WhatsApp message" }
  }
}

export async function sendWelcomeWhatsApp(phoneNumber: string, userName: string) {
  try {
    if (!WHATSAPP_CONFIG.hasRequiredEnvVars) {
      console.log("📱 [v0] WhatsApp environment variables not configured, skipping WhatsApp message...")
      return {
        success: true,
        message: "WhatsApp messaging is not configured (missing environment variables)",
      }
    }

    if (!WHATSAPP_CONFIG.enabled) {
      console.log("📱 [v0] WhatsApp messaging is disabled, skipping...")
      return { success: true, message: "WhatsApp messaging is disabled" }
    }

    if (!twilioClient) {
      console.log("📱 [v0] Twilio client not initialized, skipping WhatsApp message...")
      return {
        success: true,
        message: "WhatsApp messaging is not configured (Twilio client not initialized)",
      }
    }

    console.log("📱 [v0] Sending welcome WhatsApp to:", phoneNumber)

    const formattedPhone = formatPhoneNumber(phoneNumber)
    const message = `🏨 *Welcome to AMP Lodge!*

Hello ${userName}! 👋

Welcome to the AMP Lodge family! We're thrilled to have you with us.

Thank you for choosing AMP Lodge for your accommodation needs. We're committed to providing you with an exceptional experience.

Feel free to reach out if you have any questions or need assistance.

Best regards,
The AMP Lodge Team 🌟`

    const whatsappMessage = await twilioClient.messages.create({
      from: WHATSAPP_CONFIG.from,
      to: formattedPhone,
      body: message,
    })

    console.log("✅ [v0] Welcome WhatsApp sent successfully!", {
      sid: whatsappMessage.sid,
      status: whatsappMessage.status,
    })

    // Log WhatsApp activity to database
    await logWhatsAppActivity({
      type: "welcome",
      recipient: phoneNumber,
      message: message,
      status: "sent",
      message_sid: whatsappMessage.sid,
    })

    return {
      success: true,
      messageSid: whatsappMessage.sid,
      message: "Welcome WhatsApp sent successfully",
    }
  } catch (error) {
    console.error("❌ [v0] Error sending welcome WhatsApp:", error)

    // Log failed WhatsApp attempt
    await logWhatsAppActivity({
      type: "welcome",
      recipient: phoneNumber,
      message: "Welcome message",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return { success: false, error: "Failed to send welcome WhatsApp message" }
  }
}

async function logWhatsAppActivity(activity: WhatsAppActivity) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("whatsapp_logs").insert({
      ...activity,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("❌ [v0] Error logging WhatsApp activity:", error.message)
    } else {
      console.log("✅ [v0] WhatsApp activity logged successfully")
    }
  } catch (error) {
    console.error("❌ [v0] Error logging WhatsApp activity:", error instanceof Error ? error.message : "Unknown error")
  }
}
