// Use the provided Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM

// Twilio API base URL
const TWILIO_API_BASE = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`

// Create authorization header for Twilio API
const createAuthHeader = () => {
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")
  return `Basic ${credentials}`
}

// Native fetch-based Twilio client implementation
export const twilioClient = {
  messages: {
    create: async (messageData: {
      from: string
      to: string
      body?: string
      contentSid?: string
      contentVariables?: string
    }) => {
      try {
        console.log("[v0] Sending WhatsApp message via Twilio API:", {
          from: messageData.from,
          to: messageData.to,
          contentSid: messageData.contentSid,
          hasBody: !!messageData.body,
        })

        const formData = new URLSearchParams()
        formData.append("From", messageData.from)
        formData.append("To", messageData.to)

        if (messageData.contentSid) {
          formData.append("ContentSid", messageData.contentSid)
          if (messageData.contentVariables) {
            formData.append("ContentVariables", messageData.contentVariables)
          }
        } else if (messageData.body) {
          formData.append("Body", messageData.body)
        }

        const response = await fetch(`${TWILIO_API_BASE}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: createAuthHeader(),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Twilio API error response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })
          throw new Error(`Twilio API error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        console.log("[v0] Twilio API success:", {
          sid: result.sid,
          status: result.status,
        })

        return {
          sid: result.sid,
          status: result.status,
          to: result.to,
          from: result.from,
          body: result.body,
          dateCreated: result.date_created,
          dateUpdated: result.date_updated,
          dateSent: result.date_sent,
          accountSid: result.account_sid,
          messagingServiceSid: result.messaging_service_sid,
          errorCode: result.error_code,
          errorMessage: result.error_message,
          direction: result.direction,
          apiVersion: result.api_version,
          price: result.price,
          priceUnit: result.price_unit,
          uri: result.uri,
          subresourceUris: result.subresource_uris,
        }
      } catch (error) {
        console.error("[v0] Error in Twilio client:", error)
        throw error
      }
    },
  },
}

export const WHATSAPP_CONFIG = {
  from: TWILIO_WHATSAPP_FROM ? TWILIO_WHATSAPP_FROM.replace(/^['"]|['"]$/g, "") : "whatsapp:+14155238886", // fallback for development
  enabled: !!(
    process.env.WHATSAPP_ENABLED === "true" &&
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    TWILIO_WHATSAPP_FROM
  ),
  hasRequiredEnvVars: !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM),
  // Template content SID for booking confirmations
  bookingContentSid: "HX350d429d32e64a552466cafecbe95f3c",
} as const

// Console log for debugging WhatsApp configuration
console.log("📱 [v0] WhatsApp configuration:", {
  from: WHATSAPP_CONFIG.from,
  enabled: WHATSAPP_CONFIG.enabled,
  hasRequiredEnvVars: WHATSAPP_CONFIG.hasRequiredEnvVars,
  bookingContentSid: WHATSAPP_CONFIG.bookingContentSid,
})
