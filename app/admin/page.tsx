"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react"

interface DashboardStats {
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  totalRevenue: number
  occupancyRate: number
  newBookingsToday: number
}

interface RecentBooking {
  id: string
  guest_first_name: string
  guest_last_name: string
  room_number: string
  room_type: string
  check_in_date: string
  check_out_date: string
  status: string
  total_amount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    newBookingsToday: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/recent-bookings"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setRecentBookings(bookingsData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to AMP Lodge admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">{stats.newBookingsToday} new today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCheckIns}</div>
            <p className="text-xs text-muted-foreground">{stats.todayCheckOuts} check-outs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.occupancyRate}% occupancy rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest booking activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent bookings</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {booking.guest_first_name} {booking.guest_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.room_number} ({booking.room_type})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    <p className="font-medium">₵{booking.total_amount}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">View Calendar</h3>
            <p className="text-sm text-muted-foreground">Manage bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-sm text-muted-foreground">User accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Reports</h3>
            <p className="text-sm text-muted-foreground">Analytics & insights</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Room Status</h3>
            <p className="text-sm text-muted-foreground">Availability</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
