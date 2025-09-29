import { createClient } from "@/lib/supabase/server"
import { sendBookingReminderEmail } from "./services"

export class EmailNotificationScheduler {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  // Send booking reminders for upcoming stays
  async sendBookingReminders() {
    try {
      const supabase = await this.getSupabase()

      // Get bookings with check-in dates in 1, 3, and 7 days
      const reminderDays = [1, 3, 7]

      for (const days of reminderDays) {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + days)
        const targetDateString = targetDate.toISOString().split("T")[0]

        const { data: bookings, error } = await supabase
          .from("bookings")
          .select(`
            *,
            rooms (
              name,
              description,
              image_url
            )
          `)
          .eq("check_in_date", targetDateString)
          .eq("status", "confirmed")
          .is("reminder_sent", null) // Only send if reminder hasn't been sent

        if (error) {
          console.error(`Error fetching bookings for ${days}-day reminder:`, error)
          continue
        }

        for (const booking of bookings || []) {
          try {
            const emailResult = await sendBookingReminderEmail({
              userEmail: booking.guest_email,
              userName: `${booking.guest_first_name} ${booking.guest_last_name}`,
              bookingId: booking.id.toString(),
              roomName: booking.rooms.name,
              checkInDate: booking.check_in_date,
              checkOutDate: booking.check_out_date,
              guests: booking.guests,
              totalAmount: booking.total_amount,
              daysUntilCheckIn: days,
            })

            if (emailResult.success) {
              // Mark reminder as sent
              await supabase
                .from("bookings")
                .update({
                  reminder_sent: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", booking.id)

              console.log(`✅ [v0] Sent ${days}-day reminder for booking ${booking.id}`)
            }
          } catch (error) {
            console.error(`❌ [v0] Error sending reminder for booking ${booking.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("❌ [v0] Error in booking reminder scheduler:", error)
    }
  }

  // Send welcome emails to new users
  async sendWelcomeEmails() {
    try {
      const supabase = await this.getSupabase()

      // Get users who signed up in the last hour and haven't received welcome email
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data: users, error } = await supabase.auth.admin.listUsers()

      if (error) {
        console.error("Error fetching new users:", error)
        return
      }

      for (const user of users.users) {
        if (new Date(user.created_at) > new Date(oneHourAgo)) {
          // Check if welcome email already sent
          const { data: existingLog } = await supabase
            .from("email_logs")
            .select("id")
            .eq("recipient", user.email)
            .eq("type", "welcome")
            .single()

          if (!existingLog) {
            // Send welcome email (implementation would go here)
            console.log(`📧 [v0] Would send welcome email to ${user.email}`)
          }
        }
      }
    } catch (error) {
      console.error("❌ [v0] Error in welcome email scheduler:", error)
    }
  }

  // Clean up old email logs
  async cleanupOldLogs() {
    try {
      const supabase = await this.getSupabase()

      // Delete email logs older than 90 days
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase.from("email_logs").delete().lt("created_at", ninetyDaysAgo)

      if (error) {
        console.error("Error cleaning up old email logs:", error)
      } else {
        console.log("✅ [v0] Cleaned up old email logs")
      }
    } catch (error) {
      console.error("❌ [v0] Error in log cleanup:", error)
    }
  }
}

export const emailScheduler = new EmailNotificationScheduler()
