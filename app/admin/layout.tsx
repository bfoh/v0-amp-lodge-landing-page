import type React from "react"
import Link from "next/link"
import { Calendar, Mail, Users, Settings, BarChart3, Home } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-actions"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={["admin", "hotel_employee"]} fallbackPath="/auth/login">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-muted/40 border-r">
          <div className="p-6">
            <Link href="/" className="flex items-center mb-6">
              <img src="/amp-lodge-logo.png" alt="AMP Lodge" className="h-8 w-auto object-contain" />
            </Link>
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
          <nav className="space-y-2 px-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Booking Calendar
            </Link>
            <Link
              href="/admin/rooms"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              Room Management
            </Link>
            <Link
              href="/admin/emails"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email Management
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Users className="h-4 w-4" />
              User Management
            </Link>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Site
                </Link>
              </Button>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit" className="w-full">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RoleGuard>
  )
}
