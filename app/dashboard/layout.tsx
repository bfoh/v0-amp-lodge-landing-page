import type React from "react"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted/40 border-r">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <nav className="space-y-2 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
            Overview
          </Link>
          <Link href="/dashboard/emails" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
            <Mail className="h-4 w-4" />
            Email Management
          </Link>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
