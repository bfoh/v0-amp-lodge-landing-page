import { type NextRequest, NextResponse } from "next/server"
import { emailTemplateManager } from "@/lib/email/template-manager"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("email_templates").select("*").eq("id", params.id).single()

    if (error || !data) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, content, is_active } = body

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (subject !== undefined) updates.subject = subject
    if (content !== undefined) {
      updates.content = content
      updates.variables = emailTemplateManager.extractVariables(content)
    }
    if (is_active !== undefined) updates.is_active = is_active

    const template = await emailTemplateManager.updateTemplate(params.id, updates)

    if (!template) {
      return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await emailTemplateManager.deleteTemplate(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
    }

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
