import { createClient } from "@/lib/supabase/server"

interface InboundEmailData {
  from: {
    email: string
    name?: string
  }
  to: {
    email: string
    name?: string
  }
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
  messageId: string
  date: string
}

export async function processInboundEmail(data: InboundEmailData) {
  try {
    console.log("📧 [v0] Processing inbound email from:", data.from.email)

    const supabase = await createClient()

    // Extract and clean email content
    const message = extractEmailContent(data.text || data.html || "")
    const category = categorizeEmail(data.subject, message)
    const priority = determinePriority(data.subject, message, category)

    // Store the inquiry in the database
    const { data: inquiry, error } = await supabase
      .from("email_inquiries")
      .insert({
        from_email: data.from.email,
        from_name: data.from.name || extractNameFromEmail(data.from.email),
        subject: data.subject,
        message: message,
        category: category,
        priority: priority,
        status: "new",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("❌ [v0] Error storing email inquiry:", error)
      return
    }

    console.log("✅ [v0] Email inquiry stored:", inquiry.id)

    // Send auto-response for certain categories
    if (shouldSendAutoResponse(category)) {
      await sendAutoResponse(inquiry)
    }

    // Notify staff about high-priority inquiries
    if (priority === "high" || priority === "urgent") {
      await notifyStaffOfUrgentInquiry(inquiry)
    }

    return inquiry
  } catch (error) {
    console.error("❌ [v0] Error processing inbound email:", error)
    throw error
  }
}

function extractEmailContent(content: string): string {
  // Remove HTML tags if present
  const cleanContent = content.replace(/<[^>]*>/g, "")

  // Remove email signatures and quoted text
  const signatureMarkers = ["-- ", "---", "Sent from", "Get Outlook", "Sent from my iPhone", "Sent from my iPad"]

  const quotedMarkers = ["On ", "From:", "> ", "-----Original Message-----"]

  // Split by lines and process
  const lines = cleanContent.split("\n")
  const cleanLines: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Stop at signature markers
    if (signatureMarkers.some((marker) => trimmedLine.startsWith(marker))) {
      break
    }

    // Stop at quoted text markers
    if (quotedMarkers.some((marker) => trimmedLine.startsWith(marker))) {
      break
    }

    cleanLines.push(line)
  }

  return cleanLines.join("\n").trim()
}

function categorizeEmail(subject: string, message: string): string {
  const subjectLower = subject.toLowerCase()
  const messageLower = message.toLowerCase()

  // Booking-related keywords
  if (
    subjectLower.includes("booking") ||
    subjectLower.includes("reservation") ||
    messageLower.includes("book") ||
    messageLower.includes("reserve")
  ) {
    return "booking"
  }

  // Complaint keywords
  if (
    subjectLower.includes("complaint") ||
    subjectLower.includes("problem") ||
    subjectLower.includes("issue") ||
    messageLower.includes("disappointed") ||
    messageLower.includes("terrible") ||
    messageLower.includes("awful")
  ) {
    return "complaint"
  }

  // Compliment keywords
  if (
    subjectLower.includes("thank") ||
    subjectLower.includes("great") ||
    messageLower.includes("excellent") ||
    messageLower.includes("wonderful") ||
    messageLower.includes("amazing") ||
    messageLower.includes("love")
  ) {
    return "compliment"
  }

  // Cancellation keywords
  if (subjectLower.includes("cancel") || messageLower.includes("cancel")) {
    return "cancellation"
  }

  // Refund keywords
  if (subjectLower.includes("refund") || messageLower.includes("refund") || messageLower.includes("money back")) {
    return "refund"
  }

  return "general"
}

function determinePriority(subject: string, message: string, category: string): string {
  const subjectLower = subject.toLowerCase()
  const messageLower = message.toLowerCase()

  // Urgent keywords
  const urgentKeywords = ["urgent", "emergency", "asap", "immediately", "help"]
  if (urgentKeywords.some((keyword) => subjectLower.includes(keyword) || messageLower.includes(keyword))) {
    return "urgent"
  }

  // High priority categories
  if (category === "complaint" || category === "refund") {
    return "high"
  }

  // High priority keywords
  const highPriorityKeywords = ["important", "serious", "problem", "issue"]
  if (highPriorityKeywords.some((keyword) => subjectLower.includes(keyword) || messageLower.includes(keyword))) {
    return "high"
  }

  // Low priority categories
  if (category === "compliment") {
    return "low"
  }

  return "normal"
}

function extractNameFromEmail(email: string): string {
  const localPart = email.split("@")[0]
  return localPart.replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

function shouldSendAutoResponse(category: string): boolean {
  // Send auto-response for general inquiries and bookings
  return ["general", "booking"].includes(category)
}

async function sendAutoResponse(inquiry: any) {
  try {
    const autoResponseMessage = generateAutoResponseMessage(inquiry.category)

    // This would integrate with your email sending service
    console.log("📧 [v0] Sending auto-response to:", inquiry.from_email)
    console.log("📧 [v0] Auto-response message:", autoResponseMessage)

    // Update inquiry status
    const supabase = await createClient()
    await supabase
      .from("email_inquiries")
      .update({
        status: "auto_responded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiry.id)
  } catch (error) {
    console.error("❌ [v0] Error sending auto-response:", error)
  }
}

function generateAutoResponseMessage(category: string): string {
  switch (category) {
    case "booking":
      return `Thank you for your booking inquiry! We have received your message and our reservations team will respond within 2 hours during business hours. For immediate assistance, please call us at +233 XX XXX XXXX.`

    case "general":
      return `Thank you for contacting AMP Lodge! We have received your message and will respond within 24 hours. For urgent matters, please call us at +233 XX XXX XXXX.`

    default:
      return `Thank you for contacting AMP Lodge! We have received your message and will respond as soon as possible.`
  }
}

async function notifyStaffOfUrgentInquiry(inquiry: any) {
  try {
    console.log("🚨 [v0] Urgent inquiry received:", inquiry.id)
    console.log("🚨 [v0] From:", inquiry.from_email)
    console.log("🚨 [v0] Subject:", inquiry.subject)
    console.log("🚨 [v0] Priority:", inquiry.priority)

    // In a real implementation, you would:
    // 1. Send email notifications to staff
    // 2. Send SMS alerts
    // 3. Create Slack notifications
    // 4. Update dashboard with urgent flag
  } catch (error) {
    console.error("❌ [v0] Error notifying staff:", error)
  }
}
