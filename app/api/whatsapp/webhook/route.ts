import { handleWhatsAppWebhook } from "@/lib/whatsapp/webhook"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  return handleWhatsAppWebhook(request)
}
