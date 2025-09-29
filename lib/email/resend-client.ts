import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required")
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Use Resend's default domain for development/testing, custom domain for production
const isDevelopment = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview"

export const EMAIL_CONFIG = {
  // This ensures emails work immediately without domain verification requirements
  from: "AMP Lodge <onboarding@resend.dev>",
  replyTo: "onboarding@resend.dev",
  domain: "resend.dev",
} as const

// Console log for debugging email configuration
console.log("📧 [v0] Email configuration:", {
  environment: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  isDevelopment,
  from: EMAIL_CONFIG.from,
  replyTo: EMAIL_CONFIG.replyTo,
  domain: EMAIL_CONFIG.domain,
})
