-- Create WhatsApp logs table to track message delivery
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'welcome', 'reminder', etc.
    recipient VARCHAR(20) NOT NULL, -- Phone number
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'delivered', 'read'
    message_sid VARCHAR(100), -- Twilio message SID
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_type ON whatsapp_logs(type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_recipient ON whatsapp_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON whatsapp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_message_sid ON whatsapp_logs(message_sid);

-- Enable Row Level Security
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (admin access)
CREATE POLICY "Service role can manage whatsapp_logs" ON whatsapp_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to view their own logs (if needed in future)
CREATE POLICY "Users can view whatsapp_logs" ON whatsapp_logs
    FOR SELECT USING (true); -- Adjust this policy based on your needs

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_logs_updated_at
    BEFORE UPDATE ON whatsapp_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_logs_updated_at();

-- Add comment to table
COMMENT ON TABLE whatsapp_logs IS 'Logs for WhatsApp message delivery tracking';
