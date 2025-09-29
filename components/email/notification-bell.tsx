"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { emailNotificationManager, type EmailNotification } from "@/lib/email/realtime-notifications"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load initial unread count
    emailNotificationManager.getUnreadCount().then(setUnreadCount)

    // Subscribe to real-time notifications
    const unsubscribeEmail = emailNotificationManager.subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]) // Keep last 10
      setUnreadCount((prev) => prev + 1)

      // Show browser notification for urgent items
      if (notification.type === "urgent_inquiry" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/amp-lodge-logo.png",
          })
        }
      }
    })

    const unsubscribeBooking = emailNotificationManager.subscribeToBookingNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)])
      setUnreadCount((prev) => prev + 1)
    })

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      unsubscribeEmail()
      unsubscribeBooking()
    }
  }, [])

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    emailNotificationManager.markAsRead(unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: EmailNotification["type"]) => {
    switch (type) {
      case "urgent_inquiry":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "new_inquiry":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "email_bounced":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "email_delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "booking_confirmation":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
              >
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
