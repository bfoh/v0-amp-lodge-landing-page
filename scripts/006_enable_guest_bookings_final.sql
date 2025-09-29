-- Enable guest bookings by adding guest information fields to bookings table
-- and making user_id nullable for guest bookings

-- Add guest information columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_email text,
ADD COLUMN IF NOT EXISTS guest_first_name text,
ADD COLUMN IF NOT EXISTS guest_last_name text,
ADD COLUMN IF NOT EXISTS guest_phone text;

-- Make user_id nullable to allow guest bookings
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id is provided OR guest information is provided
ALTER TABLE bookings 
ADD CONSTRAINT bookings_user_or_guest_check 
CHECK (
  (user_id IS NOT NULL) OR 
  (guest_email IS NOT NULL AND guest_first_name IS NOT NULL AND guest_last_name IS NOT NULL)
);

-- Create an index on guest_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);

-- Update RLS policies to allow guest bookings
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

-- Create new policies that handle both authenticated users and guests
CREATE POLICY "Users can view their own bookings or guest bookings" ON bookings
FOR SELECT USING (
  auth.uid() = user_id OR 
  user_id IS NULL
);

CREATE POLICY "Anyone can create bookings" ON bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings or guest bookings" ON bookings
FOR UPDATE USING (
  auth.uid() = user_id OR 
  user_id IS NULL
);
