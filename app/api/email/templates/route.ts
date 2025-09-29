import { type NextRequest, NextResponse } from "next/server"
import { emailTemplateManager } from "@/lib/email/template-manager"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    const templates = await emailTemplateManager.getAllTemplates()

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, subject, content } = body

    if (!name || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Extract variables from content
    const variables = emailTemplateManager.extractVariables(content)

    const template = await emailTemplateManager.createTemplate({
      name,
      subject,
      content,
      variables,
      is_active: true,
    })

    if (!template) {
      return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
