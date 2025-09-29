import { createBrowserClient } from "@supabase/ssr"

export interface EmailNotification {
  id: string
  type: "new_inquiry" | "urgent_inquiry" | "email_bounced" | "email_delivered" | "booking_confirmation"
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
}

export class EmailNotificationManager {
  private supabase: any
  private listeners: Map<string, (notification: EmailNotification) => void> = new Map()

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // Subscribe to real-time email notifications
  subscribeToNotifications(callback: (notification: EmailNotification) => void) {
    const channel = this.supabase
      .channel("email-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "email_inquiries",
        },
        (payload: any) => {
          const inquiry = payload.new
          this.handleNewInquiry(inquiry, callback)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "email_logs",
        },
        (payload: any) => {
          const emailLog = payload.new
          this.handleEmailStatusUpdate(emailLog, callback)
        },
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  // Subscribe to booking confirmations
  subscribeToBookingNotifications(callback: (notification: EmailNotification) => void) {
    const channel = this.supabase
      .channel("booking-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload: any) => {
          const booking = payload.new
          this.handleNewBooking(booking, callback)
        },
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  private handleNewInquiry(inquiry: any, callback: (notification: EmailNotification) => void) {
    const isUrgent = inquiry.priority === "urgent" || inquiry.priority === "high"

    const notification: EmailNotification = {
      id: `inquiry-${inquiry.id}`,
      type: isUrgent ? "urgent_inquiry" : "new_inquiry",
      title: isUrgent ? "Urgent Email Inquiry" : "New Email Inquiry",
      message: `From: ${inquiry.from_email} - ${inquiry.subject}`,
      data: {
        inquiryId: inquiry.id,
        fromEmail: inquiry.from_email,
        subject: inquiry.subject,
        category: inquiry.category,
        priority: inquiry.priority,
      },
      read: false,
      created_at: inquiry.created_at,
    }

    callback(notification)
  }

  private handleEmailStatusUpdate(emailLog: any, callback: (notification: EmailNotification) => void) {
    if (emailLog.status === "bounced") {
      const notification: EmailNotification = {
        id: `bounce-${emailLog.id}`,
        type: "email_bounced",
        title: "Email Bounced",
        message: `Email to ${emailLog.recipient} bounced: ${emailLog.error_message || "Unknown reason"}`,
        data: {
          emailId: emailLog.email_id,
          recipient: emailLog.recipient,
          type: emailLog.type,
          errorMessage: emailLog.error_message,
        },
        read: false,
        created_at: emailLog.updated_at,
      }

      callback(notification)
    } else if (emailLog.status === "delivered" && emailLog.type === "booking_confirmation") {
      const notification: EmailNotification = {
        id: `delivered-${emailLog.id}`,
        type: "email_delivered",
        title: "Booking Confirmation Delivered",
        message: `Booking confirmation successfully delivered to ${emailLog.recipient}`,
        data: {
          emailId: emailLog.email_id,
          recipient: emailLog.recipient,
          bookingId: emailLog.metadata?.bookingId,
        },
        read: false,
        created_at: emailLog.updated_at,
      }

      callback(notification)
    }
  }

  private handleNewBooking(booking: any, callback: (notification: EmailNotification) => void) {
    const notification: EmailNotification = {
      id: `booking-${booking.id}`,
      type: "booking_confirmation",
      title: "New Booking Confirmed",
      message: `Booking ${booking.id} confirmed for ${booking.guest_first_name} ${booking.guest_last_name}`,
      data: {
        bookingId: booking.id,
        guestName: `${booking.guest_first_name} ${booking.guest_last_name}`,
        guestEmail: booking.guest_email,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
      },
      read: false,
      created_at: booking.created_at,
    }

    callback(notification)
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    try {
      // This would typically be stored in a notifications table
      // For now, we'll count recent inquiries and email issues
      const { count: inquiryCount } = await this.supabase
        .from("email_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      const { count: bounceCount } = await this.supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "bounced")
        .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return (inquiryCount || 0) + (bounceCount || 0)
    } catch (error) {
      console.error("Error getting unread count:", error)
      return 0
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds: string[]): Promise<void> {
    // In a full implementation, you would update a notifications table
    console.log("Marking notifications as read:", notificationIds)
  }
}

export const emailNotificationManager = new EmailNotificationManager()
