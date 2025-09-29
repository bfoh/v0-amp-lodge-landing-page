import type * as React from "react"

interface WelcomeEmailProps {
  userName: string
  userEmail: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName, userEmail }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Welcome to AMP Lodge</title>
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
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "normal" }}>Welcome to Our Family!</h2>
          </div>

          {/* Content */}
          <div style={{ padding: "30px 20px", background: "#f9f9f9" }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>Dear {userName},</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              Welcome to AMP Lodge! We're thrilled to have you join our community of travelers who appreciate
              exceptional hospitality and comfort.
            </p>

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "8px",
                marginBottom: "25px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#2563eb" }}>What's Next?</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8" }}>
                <li>Browse our luxurious rooms and suites</li>
                <li>Make your first booking with exclusive member benefits</li>
                <li>Enjoy personalized service during your stay</li>
                <li>Access special offers and promotions</li>
              </ul>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              Your account is now active and ready to use. Start planning your perfect getaway with us!
            </p>

            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <a
                href="https://amplodge.com"
                style={{
                  display: "inline-block",
                  background: "#2563eb",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Start Booking Now
              </a>
            </div>

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
