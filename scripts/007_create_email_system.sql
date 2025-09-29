-- Create email logs table for tracking email activity
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'welcome', 'inquiry_response', etc.
  recipient VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'delivered', 'bounced', 'opened', 'clicked'
  email_id VARCHAR(255), -- Resend email ID for tracking
  error_message TEXT,
  metadata JSONB, -- Additional data like booking ID, user ID, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_id ON email_logs(email_id);

-- Create email inquiries table for inbound emails
CREATE TABLE IF NOT EXISTS email_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  category VARCHAR(50), -- 'booking', 'general', 'complaint', 'compliment', etc.
  assigned_to UUID, -- Staff member assigned to handle this inquiry
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email inquiries
CREATE INDEX IF NOT EXISTS idx_email_inquiries_from_email ON email_inquiries(from_email);
CREATE INDEX IF NOT EXISTS idx_email_inquiries_status ON email_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_email_inquiries_priority ON email_inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_email_inquiries_category ON email_inquiries(category);
CREATE INDEX IF NOT EXISTS idx_email_inquiries_created_at ON email_inquiries(created_at);

-- Create email templates table for managing email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB, -- Available variables for the template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, content, variables) VALUES
('booking_confirmation', 'Booking Confirmation - AMP Lodge ({{bookingId}})', 
 'Thank you for your booking at AMP Lodge. Your reservation has been confirmed.', 
 '["userName", "bookingId", "roomName", "checkInDate", "checkOutDate", "guests", "totalAmount"]'::jsonb),
('welcome', 'Welcome to AMP Lodge - Your Journey Begins!', 
 'Welcome to AMP Lodge! We are excited to have you join our community.', 
 '["userName", "userEmail"]'::jsonb),
('inquiry_response', 'Re: {{originalSubject}}', 
 'Thank you for contacting AMP Lodge. We have received your inquiry and will respond shortly.', 
 '["customerName", "originalSubject", "inquiryId"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies for email tables
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Email logs: Only authenticated users can view logs
CREATE POLICY "Users can view email logs" ON email_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Email inquiries: Only authenticated users can manage inquiries
CREATE POLICY "Users can manage email inquiries" ON email_inquiries
  FOR ALL USING (auth.role() = 'authenticated');

-- Email templates: Only authenticated users can manage templates
CREATE POLICY "Users can manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_inquiries_updated_at BEFORE UPDATE ON email_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
