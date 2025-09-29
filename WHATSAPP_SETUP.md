# WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp messaging for booking confirmations using Twilio's WhatsApp Business API.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **WhatsApp Business Profile**: You'll need to set up a WhatsApp Business profile through Twilio
3. **Phone Number Verification**: Twilio will provide a WhatsApp-enabled phone number

## Environment Variables

Add these environment variables to your Vercel project:

\`\`\`env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio's sandbox number for testing
WHATSAPP_ENABLED=true  # Set to false to disable WhatsApp messaging
\`\`\`

## Setup Steps

### 1. Get Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these values to your environment variables

### 2. WhatsApp Sandbox (Development)

For development and testing, use Twilio's WhatsApp Sandbox:

1. Go to **Messaging** > **Try it out** > **Send a WhatsApp message** in Twilio Console
2. Follow the instructions to join the sandbox by sending a message to the provided number
3. Use the sandbox number (`whatsapp:+14155238886`) as your `TWILIO_WHATSAPP_FROM`

### 3. Production Setup

For production, you'll need to:

1. **Request WhatsApp Business API access** through Twilio
2. **Submit your business for approval** (this can take several days)
3. **Get a dedicated WhatsApp Business number**
4. **Update your environment variables** with the production number

### 4. Webhook Configuration (Optional)

To track message delivery status:

1. In Twilio Console, go to **Phone Numbers** > **Manage** > **WhatsApp senders**
2. Click on your WhatsApp number
3. Set the webhook URL to: `https://your-domain.com/api/whatsapp/webhook`
4. Select **POST** method and check **Delivered** and **Read** events

## Testing

1. Make a test booking with a valid phone number
2. Check the console logs for WhatsApp sending status
3. Verify the message is received on WhatsApp
4. Check the `whatsapp_logs` table in your database for delivery tracking

## Message Format

The WhatsApp confirmation message includes:
- Hotel branding and greeting
- Complete booking details (ID, room, dates, guests, total)
- Special requests (if any)
- Check-in/check-out times
- Professional closing with contact information

## Troubleshooting

### Common Issues:

1. **"Invalid phone number"**: Ensure phone numbers include country code (e.g., +1234567890)
2. **"Unverified sender"**: Make sure you're using the correct Twilio WhatsApp number
3. **"Messages not sending"**: Check that `WHATSAPP_ENABLED=true` in your environment
4. **"Webhook not working"**: Verify the webhook URL is publicly accessible and uses HTTPS

### Debug Logs:

Check your application logs for:
- `📱 [v0] WhatsApp configuration:` - Shows current config
- `📱 [v0] Sending booking confirmation WhatsApp to:` - Message sending attempts
- `✅ [v0] Booking confirmation WhatsApp sent successfully!` - Successful sends
- `❌ [v0] Error sending booking confirmation WhatsApp:` - Error details

## Cost Considerations

- **Sandbox**: Free for testing
- **Production**: Charges apply per message sent
- **International**: Additional charges for international numbers
- Check [Twilio's WhatsApp pricing](https://www.twilio.com/whatsapp/pricing) for current rates

## Compliance

Ensure you comply with:
- WhatsApp Business Policy
- Local telecommunications regulations
- Data privacy laws (GDPR, CCPA, etc.)
- Obtain proper consent before sending messages
