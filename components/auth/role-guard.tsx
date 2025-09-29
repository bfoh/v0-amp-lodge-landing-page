"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/auth/roles"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/", loadingComponent }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkPermissions() {
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        const userRole = profile?.role || "guest"
        const hasPermission = allowedRoles.includes(userRole as UserRole)

        setIsAuthorized(hasPermission)

        if (!hasPermission) {
          router.push(fallbackPath)
        }
      } catch (error) {
        console.error("Error checking permissions:", error)
        setIsAuthorized(false)
        router.push(fallbackPath)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [allowedRoles, fallbackPath, router])

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
