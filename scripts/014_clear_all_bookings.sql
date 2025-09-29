-- Clear all booking data to make all rooms available
-- This script removes all existing bookings from the database

-- Delete all bookings
DELETE FROM bookings;

-- Reset the booking-related sequences if any exist
-- This ensures clean booking IDs for future bookings

-- Optional: Clear related notification data about bookings
DELETE FROM notifications WHERE type = 'booking_confirmation' OR type = 'booking_reminder';

-- Optional: Clear email logs related to bookings (keep if you want to maintain email history)
-- DELETE FROM email_logs WHERE type = 'booking_confirmation';

-- Optional: Clear WhatsApp logs related to bookings (keep if you want to maintain message history)  
-- DELETE FROM whatsapp_logs WHERE type = 'booking_confirmation';

-- Verify the cleanup
SELECT COUNT(*) as remaining_bookings FROM bookings;
SELECT COUNT(*) as remaining_booking_notifications FROM notifications WHERE type IN ('booking_confirmation', 'booking_reminder');
