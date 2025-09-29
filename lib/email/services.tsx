import { resend, EMAIL_CONFIG } from "./resend-client"
import { createAdminClient } from "@/lib/supabase/server"

interface BookingEmailData {
  userEmail: string
  userName: string
  bookingId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  specialRequests?: string
}

interface WelcomeEmailData {
  userEmail: string
  userName: string
}

interface InquiryResponseEmailData {
  customerEmail: string
  customerName: string
  originalSubject: string
  originalMessage: string
  responseMessage: string
  inquiryId: string
  staffName: string
}

interface BookingReminderEmailData {
  userEmail: string
  userName: string
  bookingId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  daysUntilCheckIn: number
}

interface SendEmailData {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

function generateBookingConfirmationHTML(data: BookingEmailData): string {
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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Booking Confirmation - AMP Lodge</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
           Header 
          <div style="background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">AMP LODGE</h1>
            <h2 style="margin: 0; font-size: 20px; font-weight: normal;">Booking Confirmation</h2>
          </div>

           Content 
          <div style="padding: 30px 20px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.userName},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for choosing AMP Lodge! Your booking has been confirmed and we're excited to welcome you.
            </p>

             Booking Details Card 
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                Booking Details
              </h3>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Booking ID:</td>
                  <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${data.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Room:</td>
                  <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${data.roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Check-in:</td>
                  <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${checkInFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Check-out:</td>
                  <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${checkOutFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Guests:</td>
                  <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${data.guests}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0 8px 0; font-size: 16px; font-weight: bold; color: #111827;">Total Amount:</td>
                  <td style="padding: 12px 0 8px 0; font-size: 16px; font-weight: bold; text-align: right; color: #2563eb;">$${data.totalAmount}</td>
                </tr>
                ${
                  data.specialRequests
                    ? `
                <tr>
                  <td colspan="2" style="padding: 12px 0 0 0;">
                    <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin-top: 8px;">
                      <strong style="font-size: 14px; color: #374151;">Special Requests:</strong>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${data.specialRequests}</p>
                    </div>
                  </td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

             Important Information 
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">Important Information</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #92400e;">
                <li>Check-in time: 3:00 PM</li>
                <li>Check-out time: 11:00 AM</li>
                <li>Please bring a valid ID for check-in</li>
                <li>Contact us if you need to modify your booking</li>
              </ul>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              We look forward to providing you with an exceptional stay at AMP Lodge. If you have any questions or need assistance, please don't hesitate to contact our team.
            </p>

            <p style="font-size: 16px; margin-bottom: 0;">
              Best regards,<br />
              <strong>The AMP Lodge Team</strong>
            </p>
          </div>

           Footer 
          <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>AMP Lodge</strong> | Kumasi, Ghana
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px;">Email: info@amplodge.com | Phone: +233 XX XXX XXXX</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateWelcomeHTML(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Welcome to AMP Lodge</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">AMP LODGE</h1>
            <h2 style="margin: 0; font-size: 20px; font-weight: normal;">Welcome!</h2>
          </div>
          <div style="padding: 30px 20px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.userName},</p>
            <p style="font-size: 16px; margin-bottom: 25px;">
              Welcome to AMP Lodge! We're thrilled to have you join our community.
            </p>
            <p style="font-size: 16px; margin-bottom: 0;">
              Best regards,<br />
              <strong>The AMP Lodge Team</strong>
            </p>
          </div>
          <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateInquiryResponseHTML(data: InquiryResponseEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Response to Your Inquiry</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">AMP LODGE</h1>
            <h2 style="margin: 0; font-size: 20px; font-weight: normal;">Response to Your Inquiry</h2>
          </div>
          <div style="padding: 30px 20px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for contacting AMP Lodge. Here's our response to your inquiry:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #2563eb;">Your Original Message:</h4>
              <p style="font-style: italic; color: #666; margin-bottom: 15px;">"${data.originalMessage}"</p>
              <h4 style="margin: 0 0 10px 0; color: #2563eb;">Our Response:</h4>
              <p style="margin: 0;">${data.responseMessage}</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 0;">
              Best regards,<br />
              <strong>${data.staffName}</strong><br />
              <em>AMP Lodge Team</em>
            </p>
          </div>
          <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              Inquiry ID: ${data.inquiryId}
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateBookingReminderHTML(data: BookingReminderEmailData): string {
  const checkInFormatted = new Date(data.checkInDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Booking Reminder - AMP Lodge</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">AMP LODGE</h1>
            <h2 style="margin: 0; font-size: 20px; font-weight: normal;">Booking Reminder</h2>
          </div>
          <div style="padding: 30px 20px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.userName},</p>
            <p style="font-size: 16px; margin-bottom: 25px;">
              Your stay at AMP Lodge is coming up in ${data.daysUntilCheckIn} ${data.daysUntilCheckIn === 1 ? "day" : "days"}!
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 15px 0; color: #2563eb;">Booking Details:</h4>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              <p><strong>Room:</strong> ${data.roomName}</p>
              <p><strong>Check-in:</strong> ${checkInFormatted}</p>
              <p><strong>Guests:</strong> ${data.guests}</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 0;">
              We look forward to welcoming you!<br />
              <strong>The AMP Lodge Team</strong>
            </p>
          </div>
          <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              This is an automated reminder. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getEmailRecipient(userEmail: string): string {
  // In production with unverified domain, Resend restricts to verified email only
  // Check if we're in a restricted environment
  const isProduction = process.env.NODE_ENV === "production"
  const vercelEnv = process.env.VERCEL_ENV

  // If in production and using unverified domain, use test email
  if (isProduction && vercelEnv === "production") {
    console.log(`📧 [v0] Email restriction detected - redirecting ${userEmail} to test email`)
    return "delivered@resend.dev" // Resend's test email that always works
  }

  return userEmail
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    const recipientEmail = getEmailRecipient(data.userEmail)
    const isTestEmail = recipientEmail !== data.userEmail

    console.log("📧 [v0] Sending booking confirmation email to:", recipientEmail)
    if (isTestEmail) {
      console.log("📧 [v0] Original email was:", data.userEmail, "- using test email due to restrictions")
    }

    const emailHTML = isTestEmail
      ? generateBookingConfirmationHTML({
          ...data,
          userName: `${data.userName} (Original: ${data.userEmail})`,
        })
      : generateBookingConfirmationHTML(data)

    const { data: emailResult, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [recipientEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Booking Confirmation - AMP Lodge${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      html: emailHTML,
    })

    if (error) {
      console.error("❌ [v0] Error sending booking confirmation email:", error)
      throw error
    }

    console.log("✅ [v0] Booking confirmation email sent successfully!", emailResult)

    // Log email activity to database
    await logEmailActivity({
      type: "booking_confirmation",
      recipient: recipientEmail,
      subject: `Booking Confirmation - AMP Lodge${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      status: "sent",
      email_id: emailResult.id,
      metadata: { bookingId: data.bookingId },
    })

    return { success: true, emailId: emailResult.id, message: "Booking confirmation email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending booking confirmation email:", error)

    // Log failed email attempt
    await logEmailActivity({
      type: "booking_confirmation",
      recipient: data.userEmail,
      subject: `Booking Confirmation - AMP Lodge`,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: { bookingId: data.bookingId },
    })

    return { success: false, error: "Failed to send confirmation email" }
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const recipientEmail = getEmailRecipient(data.userEmail)
    const isTestEmail = recipientEmail !== data.userEmail

    console.log("📧 [v0] Sending welcome email to:", recipientEmail)
    if (isTestEmail) {
      console.log("📧 [v0] Original email was:", data.userEmail, "- using test email due to restrictions")
    }

    const { data: emailResult, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [recipientEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Welcome to AMP Lodge - Your Journey Begins!${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      html: generateWelcomeHTML(data),
    })

    if (error) {
      console.error("❌ [v0] Error sending welcome email:", error)
      throw error
    }

    console.log("✅ [v0] Welcome email sent successfully!", emailResult)

    // Log email activity to database
    await logEmailActivity({
      type: "welcome",
      recipient: recipientEmail,
      subject: `Welcome to AMP Lodge - Your Journey Begins!${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      status: "sent",
      email_id: emailResult.id,
    })

    return { success: true, emailId: emailResult.id, message: "Welcome email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending welcome email:", error)

    // Log failed email attempt
    await logEmailActivity({
      type: "welcome",
      recipient: data.userEmail,
      subject: "Welcome to AMP Lodge - Your Journey Begins!",
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return { success: false, error: "Failed to send welcome email" }
  }
}

export async function sendInquiryResponseEmail(data: InquiryResponseEmailData) {
  try {
    const recipientEmail = getEmailRecipient(data.customerEmail)
    const isTestEmail = recipientEmail !== data.customerEmail

    console.log("📧 [v0] Sending inquiry response email to:", recipientEmail)
    if (isTestEmail) {
      console.log("📧 [v0] Original email was:", data.customerEmail, "- using test email due to restrictions")
    }

    const inquiryResponseHTML = generateInquiryResponseHTML(data)

    const { data: emailResult, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [recipientEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Re: ${data.originalSubject}${isTestEmail ? ` (Test - Original: ${data.customerEmail})` : ""}`,
      html: inquiryResponseHTML,
    })

    if (error) {
      console.error("❌ [v0] Error sending inquiry response email:", error)
      throw error
    }

    console.log("✅ [v0] Inquiry response email sent successfully!", emailResult)

    // Log email activity to database
    await logEmailActivity({
      type: "inquiry_response",
      recipient: recipientEmail,
      subject: `Re: ${data.originalSubject}${isTestEmail ? ` (Test - Original: ${data.customerEmail})` : ""}`,
      status: "sent",
      email_id: emailResult.id,
      metadata: { inquiryId: data.inquiryId },
    })

    return { success: true, emailId: emailResult.id, message: "Inquiry response email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending inquiry response email:", error)

    // Log failed email attempt
    await logEmailActivity({
      type: "inquiry_response",
      recipient: data.customerEmail,
      subject: `Re: ${data.originalSubject}`,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: { inquiryId: data.inquiryId },
    })

    return { success: false, error: "Failed to send inquiry response email" }
  }
}

export async function sendBookingReminderEmail(data: BookingReminderEmailData) {
  try {
    const recipientEmail = getEmailRecipient(data.userEmail)
    const isTestEmail = recipientEmail !== data.userEmail

    console.log("📧 [v0] Sending booking reminder email to:", recipientEmail)
    if (isTestEmail) {
      console.log("📧 [v0] Original email was:", data.userEmail, "- using test email due to restrictions")
    }

    const reminderHTML = generateBookingReminderHTML(data)

    const { data: emailResult, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [recipientEmail],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `Upcoming Stay Reminder - AMP Lodge (${data.daysUntilCheckIn} ${data.daysUntilCheckIn === 1 ? "day" : "days"} to go!)${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      html: reminderHTML,
    })

    if (error) {
      console.error("❌ [v0] Error sending booking reminder email:", error)
      throw error
    }

    console.log("✅ [v0] Booking reminder email sent successfully!", emailResult)

    // Log email activity to database
    await logEmailActivity({
      type: "booking_reminder",
      recipient: recipientEmail,
      subject: `Upcoming Stay Reminder - AMP Lodge (${data.daysUntilCheckIn} ${data.daysUntilCheckIn === 1 ? "day" : "days"} to go!)${isTestEmail ? ` (Test - Original: ${data.userEmail})` : ""}`,
      status: "sent",
      email_id: emailResult.id,
      metadata: { bookingId: data.bookingId, daysUntilCheckIn: data.daysUntilCheckIn },
    })

    return { success: true, emailId: emailResult.id, message: "Booking reminder email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending booking reminder email:", error)

    // Log failed email attempt
    await logEmailActivity({
      type: "booking_reminder",
      recipient: data.userEmail,
      subject: `Upcoming Stay Reminder - AMP Lodge (${data.daysUntilCheckIn} ${data.daysUntilCheckIn === 1 ? "day" : "days"} to go!)`,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: { bookingId: data.bookingId, daysUntilCheckIn: data.daysUntilCheckIn },
    })

    return { success: false, error: "Failed to send booking reminder email" }
  }
}

export async function sendEmail(data: SendEmailData) {
  try {
    const recipients = Array.isArray(data.to) ? data.to : [data.to]
    const restrictedRecipients = recipients.map((email) => getEmailRecipient(email))
    const hasTestEmails = restrictedRecipients.some((email, index) => email !== recipients[index])

    console.log("📧 [v0] Sending email to:", restrictedRecipients)
    if (hasTestEmails) {
      console.log("📧 [v0] Original emails were:", recipients, "- using test emails due to restrictions")
    }

    const { data: emailResult, error } = await resend.emails.send({
      from: data.from || EMAIL_CONFIG.from,
      to: restrictedRecipients,
      replyTo: data.replyTo || EMAIL_CONFIG.replyTo,
      subject: `${data.subject}${hasTestEmails ? " (Test Email)" : ""}`,
      html: data.html,
    })

    if (error) {
      console.error("❌ [v0] Error sending email:", error)
      throw error
    }

    console.log("✅ [v0] Email sent successfully!", emailResult)

    // Log email activity to database
    await logEmailActivity({
      type: "general",
      recipient: Array.isArray(data.to) ? data.to.join(", ") : data.to,
      subject: data.subject,
      status: "sent",
      email_id: emailResult.id,
    })

    return { success: true, emailId: emailResult.id, message: "Email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending email:", error)

    // Log failed email attempt
    await logEmailActivity({
      type: "general",
      recipient: Array.isArray(data.to) ? data.to.join(", ") : data.to,
      subject: data.subject,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return { success: false, error: "Failed to send email" }
  }
}

interface EmailActivity {
  type: string
  recipient: string
  subject: string
  status: "sent" | "failed" | "delivered" | "bounced" | "opened" | "clicked"
  email_id?: string
  error_message?: string
  metadata?: Record<string, any>
}

async function logEmailActivity(activity: EmailActivity) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("email_logs").insert({
      ...activity,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("❌ [v0] Error logging email activity:", error.message)
    } else {
      console.log("✅ [v0] Email activity logged successfully")
    }
  } catch (error) {
    console.error("❌ [v0] Error logging email activity:", error instanceof Error ? error.message : "Unknown error")
  }
}
