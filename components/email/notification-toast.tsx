"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { emailNotificationManager, type EmailNotification } from "@/lib/email/realtime-notifications"

export function NotificationToastProvider() {
  useEffect(() => {
    const unsubscribeEmail = emailNotificationManager.subscribeToNotifications((notification) => {
      showNotificationToast(notification)
    })

    const unsubscribeBooking = emailNotificationManager.subscribeToBookingNotifications((notification) => {
      showNotificationToast(notification)
    })

    return () => {
      unsubscribeEmail()
      unsubscribeBooking()
    }
  }, [])

  const showNotificationToast = (notification: EmailNotification) => {
    switch (notification.type) {
      case "urgent_inquiry":
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000, // Show longer for urgent items
          action: {
            label: "View",
            onClick: () => {
              // Navigate to inquiry
              window.location.href = `/dashboard/inquiries/${notification.data?.inquiryId}`
            },
          },
        })
        break

      case "new_inquiry":
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = `/dashboard/inquiries/${notification.data?.inquiryId}`
            },
          },
        })
        break

      case "email_bounced":
        toast.warning(notification.title, {
          description: notification.message,
          duration: 8000,
        })
        break

      case "email_delivered":
        toast.success(notification.title, {
          description: notification.message,
          duration: 3000,
        })
        break

      case "booking_confirmation":
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
          action: {
            label: "View Booking",
            onClick: () => {
              window.location.href = `/dashboard/bookings/${notification.data?.bookingId}`
            },
          },
        })
        break
    }
  }

  return null // This component doesn't render anything
}
