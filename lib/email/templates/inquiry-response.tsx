import type * as React from "react"

interface InquiryResponseEmailProps {
  customerName: string
  originalSubject: string
  originalMessage: string
  responseMessage: string
  inquiryId: string
  staffName: string
}

export const InquiryResponseEmail: React.FC<InquiryResponseEmailProps> = ({
  customerName,
  originalSubject,
  originalMessage,
  responseMessage,
  inquiryId,
  staffName,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Re: {originalSubject}</title>
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
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "normal" }}>Response to Your Inquiry</h2>
          </div>

          {/* Content */}
          <div style={{ padding: "30px 20px", background: "#f9f9f9" }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>Dear {customerName},</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              Thank you for contacting AMP Lodge. We have reviewed your inquiry and are pleased to provide you with the
              following response:
            </p>

            {/* Response Message */}
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "8px",
                marginBottom: "25px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#2563eb" }}>Our Response</h3>
              <div style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151" }}>
                {responseMessage.split("\n").map((paragraph, index) => (
                  <p key={index} style={{ margin: "0 0 15px 0" }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Original Inquiry */}
            <div
              style={{
                background: "#f3f4f6",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "25px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#6b7280" }}>Your Original Inquiry:</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "#374151" }}>
                Subject: {originalSubject}
              </p>
              <div style={{ fontSize: "14px", color: "#6b7280", fontStyle: "italic" }}>
                {originalMessage.split("\n").map((paragraph, index) => (
                  <p key={index} style={{ margin: "0 0 10px 0" }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              If you have any additional questions or need further assistance, please don't hesitate to contact us.
              We're here to help make your experience with AMP Lodge exceptional.
            </p>

            <p style={{ fontSize: "16px", marginBottom: "0" }}>
              Best regards,
              <br />
              <strong>{staffName}</strong>
              <br />
              <span style={{ color: "#6b7280", fontSize: "14px" }}>AMP Lodge Customer Service Team</span>
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
            <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#9ca3af" }}>Inquiry Reference: #{inquiryId}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
              You can reply directly to this email for further assistance.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
