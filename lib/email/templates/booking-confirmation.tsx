import type * as React from "react"

interface BookingConfirmationEmailProps {
  userName: string
  bookingId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  specialRequests?: string
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  userName,
  bookingId,
  roomName,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
  specialRequests,
}) => {
  const checkInFormatted = new Date(checkInDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const checkOutFormatted = new Date(checkOutDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Booking Confirmation - AMP Lodge</title>
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333", margin: 0, padding: 0 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          {/* Header */}
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "30px 20px",
              textAlign: "center",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "bold" }}>AMP LODGE</h1>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "normal" }}>Booking Confirmation</h2>
          </div>

          {/* Content */}
          <div style={{ padding: "30px 20px", background: "#f9f9f9" }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>Dear {userName},</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              Thank you for choosing AMP Lodge! Your booking has been confirmed and we're excited to welcome you.
            </p>

            {/* Booking Details Card */}
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "8px",
                marginBottom: "25px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  color: "#2563eb",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "10px",
                }}
              >
                Booking Details
              </h3>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>
                    Booking ID:
                  </td>
                  <td style={{ padding: "8px 0", fontSize: "14px", textAlign: "right", color: "#111827" }}>
                    {bookingId}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>Room:</td>
                  <td style={{ padding: "8px 0", fontSize: "14px", textAlign: "right", color: "#111827" }}>
                    {roomName}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>
                    Check-in:
                  </td>
                  <td style={{ padding: "8px 0", fontSize: "14px", textAlign: "right", color: "#111827" }}>
                    {checkInFormatted}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>
                    Check-out:
                  </td>
                  <td style={{ padding: "8px 0", fontSize: "14px", textAlign: "right", color: "#111827" }}>
                    {checkOutFormatted}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>Guests:</td>
                  <td style={{ padding: "8px 0", fontSize: "14px", textAlign: "right", color: "#111827" }}>{guests}</td>
                </tr>
                <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                    Total Amount:
                  </td>
                  <td
                    style={{
                      padding: "12px 0 8px 0",
                      fontSize: "16px",
                      fontWeight: "bold",
                      textAlign: "right",
                      color: "#2563eb",
                    }}
                  >
                    ${totalAmount}
                  </td>
                </tr>
                {specialRequests && (
                  <tr>
                    <td colSpan={2} style={{ padding: "12px 0 0 0" }}>
                      <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "6px", marginTop: "8px" }}>
                        <strong style={{ fontSize: "14px", color: "#374151" }}>Special Requests:</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>{specialRequests}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </table>
            </div>

            {/* Important Information */}
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "25px",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#92400e" }}>Important Information</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#92400e" }}>
                <li>Check-in time: 3:00 PM</li>
                <li>Check-out time: 11:00 AM</li>
                <li>Please bring a valid ID for check-in</li>
                <li>Contact us if you need to modify your booking</li>
              </ul>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              We look forward to providing you with an exceptional stay at AMP Lodge. If you have any questions or need
              assistance, please don't hesitate to contact our team.
            </p>

            <p style={{ fontSize: "16px", marginBottom: "0" }}>
              Best regards,
              <br />
              <strong>The AMP Lodge Team</strong>
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              background: "#374151",
              color: "#d1d5db",
              padding: "20px",
              textAlign: "center",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
              <strong>AMP Lodge</strong> | Kumasi, Ghana
            </p>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Email: info@amplodge.com | Phone: +233 XX XXX XXXX</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
