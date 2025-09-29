import { BookingSearch } from "@/components/admin/booking-search"

export default function BookingSearchPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Search & Export</h1>
        <p className="text-muted-foreground">Search for bookings and export reports for analysis</p>
      </div>

      <BookingSearch />
    </div>
  )
}
