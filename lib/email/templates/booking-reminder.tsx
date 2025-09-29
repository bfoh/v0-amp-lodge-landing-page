import type * as React from "react"

interface BookingReminderEmailProps {
  userName: string
  bookingId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  daysUntilCheckIn: number
}

export const BookingReminderEmail: React.FC<BookingReminderEmailProps> = ({
  userName,
  bookingId,
  roomName,
  checkInDate,
  checkOutDate,
  guests,
  totalAmount,
  daysUntilCheckIn,
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
        <title>Upcoming Stay Reminder - AMP Lodge</title>
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
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "normal" }}>Your Stay is Coming Up!</h2>
          </div>

          {/* Content */}
          <div style={{ padding: "30px 20px", background: "#f9f9f9" }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>Dear {userName},</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              We're excited to welcome you to AMP Lodge in just {daysUntilCheckIn}{" "}
              {daysUntilCheckIn === 1 ? "day" : "days"}! Here's a reminder of your upcoming reservation details:
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
                Reservation Details
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
              </table>
            </div>

            {/* Pre-arrival Information */}
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "25px",
              }}
            >
              <h4 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#047857" }}>Pre-Arrival Information</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#047857", lineHeight: "1.8" }}>
                <li>Check-in time: 3:00 PM - 11:00 PM</li>
                <li>Please bring a valid government-issued ID</li>
                <li>Free Wi-Fi is available throughout the property</li>
                <li>Complimentary breakfast is served from 7:00 AM - 10:00 AM</li>
                <li>Contact us if you need early check-in or late check-out</li>
              </ul>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              Our team is preparing to provide you with an exceptional experience. If you have any special requests or
              need assistance with anything, please don't hesitate to contact us.
            </p>

            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <a
                href="tel:+233XXXXXXXX"
                style={{
                  display: "inline-block",
                  background: "#2563eb",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                Call Us
              </a>
              <a
                href="mailto:info@amplodge.com"
                style={{
                  display: "inline-block",
                  background: "#059669",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Email Us
              </a>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "0" }}>
              We look forward to welcoming you soon!
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
              This is an automated reminder. You can reply to this email for assistance.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
