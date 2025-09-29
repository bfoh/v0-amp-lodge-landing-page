"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function BookingSuccessPage() {
  const [bookingId, setBookingId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const booking = searchParams.get("booking")
    if (booking) {
      setBookingId(booking)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for choosing AMP Lodge. Your reservation has been successfully confirmed.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
            <CardDescription>{bookingId && `Booking ID: ${bookingId}`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                Confirmation Email
              </div>
              <p className="text-sm">
                A confirmation email with all booking details has been sent to your email address.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Phone className="h-4 w-4" />
                Need Help?
              </div>
              <p className="text-sm">
                If you have any questions about your booking, please contact us at{" "}
                <a href="mailto:info@amplodge.com" className="text-primary hover:underline">
                  info@amplodge.com
                </a>{" "}
                or call us at{" "}
                <a href="tel:+233123456789" className="text-primary hover:underline">
                  +233 123 456 789
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Back to Homepage
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">We look forward to welcoming you to AMP Lodge!</p>
        </div>
      </div>
    </div>
  )
}
