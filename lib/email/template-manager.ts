import { createClient } from "@/lib/supabase/server"

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export class EmailTemplateManager {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  async getTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("name", name)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching email template:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching email template:", error)
      return null
    }
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase.from("email_templates").select("*").eq("is_active", true).order("name")

      if (error) {
        console.error("Error fetching email templates:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching email templates:", error)
      return []
    }
  }

  async createTemplate(
    template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">,
  ): Promise<EmailTemplate | null> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase.from("email_templates").insert(template).select().single()

      if (error) {
        console.error("Error creating email template:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating email template:", error)
      return null
    }
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase.from("email_templates").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating email template:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error updating email template:", error)
      return null
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()

      const { error } = await supabase.from("email_templates").update({ is_active: false }).eq("id", id)

      if (error) {
        console.error("Error deleting email template:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting email template:", error)
      return false
    }
  }

  // Template variable replacement utility
  replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      result = result.replace(regex, String(value))
    })

    return result
  }

  // Extract variables from template content
  extractVariables(content: string): string[] {
    const regex = /{{(\w+)}}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }
}

export const emailTemplateManager = new EmailTemplateManager()
