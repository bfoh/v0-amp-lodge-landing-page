import { type NextRequest, NextResponse } from "next/server"
import { emailScheduler } from "@/lib/email/notification-scheduler"

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (in production, you should verify this is from Vercel Cron)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🕐 [v0] Running email reminder cron job")

    // Send booking reminders
    await emailScheduler.sendBookingReminders()

    // Send welcome emails
    await emailScheduler.sendWelcomeEmails()

    // Clean up old logs
    await emailScheduler.cleanupOldLogs()

    console.log("✅ [v0] Email reminder cron job completed")

    return NextResponse.json({
      success: true,
      message: "Email reminders processed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ [v0] Error in email reminder cron job:", error)
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
