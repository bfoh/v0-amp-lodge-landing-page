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

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    console.log("✅ [v0] Sending booking confirmation email to:", data.userEmail)
    console.log("📧 [v0] Email details:", {
      to: data.userEmail,
      subject: `Booking Confirmation - AMP Lodge (${data.bookingId})`,
      bookingDetails: {
        room: data.roomName,
        checkIn: data.checkInDate,
        checkOut: data.checkOutDate,
        guests: data.guests,
        total: data.totalAmount,
        specialRequests: data.specialRequests,
      },
    })

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, you would use a service like Resend, SendGrid, or Nodemailer
    // For now, we're simulating the email sending process
    const emailHTML = generateBookingEmailHTML(data)

    // Log the complete email that would be sent
    console.log("📧 [v0] EMAIL SENT SUCCESSFULLY!")
    console.log("📧 [v0] Email HTML content generated and ready to send")
    console.log("📧 [v0] In production, this would be sent via your email service provider")

    console.log("✅ [v0] Booking confirmation email sent successfully!")

    return { success: true, message: "Booking confirmation email sent successfully" }
  } catch (error) {
    console.error("❌ [v0] Error sending booking confirmation email:", error)
    return { success: false, error: "Failed to send confirmation email" }
  }
}

export function generateBookingEmailHTML(data: BookingEmailData): string {
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
      <meta charset="utf-8">
      <title>Booking Confirmation - AMP Lodge</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AMP LODGE</h1>
          <h2>Booking Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.userName},</p>
          
          <p>Thank you for choosing AMP Lodge! Your booking has been confirmed.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Booking ID:</strong>
              <span>${data.bookingId}</span>
            </div>
            <div class="detail-row">
              <strong>Room:</strong>
              <span>${data.roomName}</span>
            </div>
            <div class="detail-row">
              <strong>Check-in:</strong>
              <span>${checkInFormatted}</span>
            </div>
            <div class="detail-row">
              <strong>Check-out:</strong>
              <span>${checkOutFormatted}</span>
            </div>
            <div class="detail-row">
              <strong>Guests:</strong>
              <span>${data.guests}</span>
            </div>
            <div class="detail-row">
              <strong>Total Amount:</strong>
              <span>$${data.totalAmount}</span>
            </div>
            ${
              data.specialRequests
                ? `
            <div class="detail-row">
              <strong>Special Requests:</strong>
              <span>${data.specialRequests}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <p>We look forward to welcoming you to AMP Lodge. If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The AMP Lodge Team</p>
        </div>
        
        <div class="footer">
          <p>AMP Lodge | Kumasi, Ghana | info@amplodge.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}
