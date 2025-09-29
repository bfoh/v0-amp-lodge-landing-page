-- Clean all booking data to make all rooms available
-- This script removes bookings, notifications, and related logs while preserving room structure and user accounts

-- Delete all bookings (this will make all rooms available)
DELETE FROM bookings;

-- Delete booking-related notifications
DELETE FROM notifications WHERE type IN ('booking_confirmation', 'booking_reminder', 'booking_cancelled');

-- Clean up email logs related to bookings (optional - keeps system clean)
DELETE FROM email_logs WHERE type IN ('booking_confirmation', 'booking_reminder');

-- Clean up WhatsApp logs related to bookings (optional - keeps system clean)  
DELETE FROM whatsapp_logs WHERE type IN ('booking_confirmation', 'booking_reminder');

-- Reset any email inquiry statuses to 'new' if they were booking-related
UPDATE email_inquiries SET status = 'new' WHERE category = 'booking';

-- Verify cleanup - this should return 0 bookings
SELECT COUNT(*) as remaining_bookings FROM bookings;

-- Show available rooms after cleanup
SELECT 
  r.name,
  r.price_per_night,
  r.max_guests,
  r.is_active
FROM rooms r 
WHERE r.is_active = true
ORDER BY r.name;
