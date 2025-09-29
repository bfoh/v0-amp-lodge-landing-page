import { createClient } from "@/lib/supabase/server"

export type UserRole = "guest" | "hotel_employee" | "admin"

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

export async function isAdminOrEmployee(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.role === "admin" || profile?.role === "hotel_employee"
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.role === "admin"
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}
