"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Download, FileText, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchFilters {
  guestName: string
  guestEmail: string
  roomNumber: string
  roomType: string
  status: string
  checkInFrom: Date | undefined
  checkInTo: Date | undefined
  checkOutFrom: Date | undefined
  checkOutTo: Date | undefined
}

interface BookingResult {
  id: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  guest_phone: string
  room_number: string
  room_type: string
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  status: string
  special_requests?: string
  created_at: string
}

export function BookingSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    guestName: "",
    guestEmail: "",
    roomNumber: "",
    roomType: "",
    status: "",
    checkInFrom: undefined,
    checkInTo: undefined,
    checkOutFrom: undefined,
    checkOutTo: undefined,
  })
  const [results, setResults] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)

    try {
      const searchParams = new URLSearchParams()

      // Add non-empty filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            searchParams.append(key, format(value, "yyyy-MM-dd"))
          } else if (typeof value === "string" && value.trim()) {
            searchParams.append(key, value.trim())
          }
        }
      })

      const response = await fetch(`/api/admin/bookings/search?${searchParams.toString()}`)
      if (response.ok) {
        const searchResults = await response.json()
        setResults(searchResults)
      } else {
        console.error("Search failed")
        setResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "pdf") => {
    if (results.length === 0) return

    setIsExporting(true)
    try {
      const searchParams = new URLSearchParams()

      // Add current filters to export params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            searchParams.append(key, format(value, "yyyy-MM-dd"))
          } else if (typeof value === "string" && value.trim()) {
            searchParams.append(key, value.trim())
          }
        }
      })

      searchParams.append("format", format)

      const response = await fetch(`/api/admin/bookings/export?${searchParams.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bookings-${new Date().toISOString().split("T")[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      guestName: "",
      guestEmail: "",
      roomNumber: "",
      roomType: "",
      status: "",
      checkInFrom: undefined,
      checkInTo: undefined,
      checkOutFrom: undefined,
      checkOutTo: undefined,
    })
    setResults([])
    setHasSearched(false)
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

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (value instanceof Date) return true
    return typeof value === "string" && value.trim() !== ""
  })

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Bookings
              </CardTitle>
              <CardDescription>Find bookings by guest information, dates, or room details</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Guest Information Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Guest Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestName">Guest Name</Label>
                <Input
                  id="guestName"
                  placeholder="Search by first or last name"
                  value={filters.guestName}
                  onChange={(e) => setFilters({ ...filters, guestName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  placeholder="Search by email address"
                  value={filters.guestEmail}
                  onChange={(e) => setFilters({ ...filters, guestEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Room and Status Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Room and Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g., 101"
                  value={filters.roomNumber}
                  onChange={(e) => setFilters({ ...filters, roomNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Room Type</Label>
                <Select value={filters.roomType} onValueChange={(value) => setFilters({ ...filters, roomType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All room types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All room types</SelectItem>
                    <SelectItem value="Standard Room">Standard Room</SelectItem>
                    <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                    <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Date Ranges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Check-in Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.checkInFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkInFrom ? format(filters.checkInFrom, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkInFrom}
                        onSelect={(date) => setFilters({ ...filters, checkInFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.checkInTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkInTo ? format(filters.checkInTo, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkInTo}
                        onSelect={(date) => setFilters({ ...filters, checkInTo: date })}
                        disabled={(date) => (filters.checkInFrom ? date < filters.checkInFrom : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Check-out Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.checkOutFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkOutFrom ? format(filters.checkOutFrom, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkOutFrom}
                        onSelect={(date) => setFilters({ ...filters, checkOutFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !filters.checkOutTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.checkOutTo ? format(filters.checkOutTo, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.checkOutTo}
                        onSelect={(date) => setFilters({ ...filters, checkOutTo: date })}
                        disabled={(date) => (filters.checkOutFrom ? date < filters.checkOutFrom : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Bookings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>{loading ? "Searching..." : `Found ${results.length} booking(s)`}</CardDescription>
              </div>
              {results.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={isExporting}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={isExporting}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookings found matching your search criteria.</p>
                <p className="text-sm">Try adjusting your filters and search again.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">
                          {booking.guest_first_name} {booking.guest_last_name}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₵{booking.total_amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Contact</p>
                        <p>{booking.guest_email}</p>
                        <p>{booking.guest_phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Room</p>
                        <p>
                          Room {booking.room_number} ({booking.room_type})
                        </p>
                        <p>{booking.guests} guest(s)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dates</p>
                        <p>
                          {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                        <p>
                          {Math.ceil(
                            (new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          night(s)
                        </p>
                      </div>
                    </div>
                    {booking.special_requests && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">Special Requests:</p>
                        <p className="text-sm">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
