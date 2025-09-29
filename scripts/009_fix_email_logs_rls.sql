-- Fix RLS policies for email_logs to allow service role access
-- This allows the booking API to log email activities without authentication

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view email logs" ON email_logs;

-- Create new policies that allow service role access
CREATE POLICY "Service role can manage email logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view email logs" ON email_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage email inquiries and templates as well
CREATE POLICY "Service role can manage email inquiries" ON email_inquiries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');
