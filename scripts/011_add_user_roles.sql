-- Add role-based authentication system for admin and hotel employee access

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'guest' CHECK (role IN ('guest', 'hotel_employee', 'admin'));

-- Create index on role for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update RLS policies to allow admins to view all profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- New policies with role-based access
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  )
);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Update bookings policies to allow admin and hotel employees to view all bookings
DROP POLICY IF EXISTS "Users can view their own bookings or guest bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings or guest bookings" ON public.bookings;

-- New booking policies with role-based access
CREATE POLICY "bookings_select_policy" ON public.bookings
FOR SELECT USING (
  auth.uid() = user_id OR 
  user_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  )
);

CREATE POLICY "bookings_insert_policy" ON public.bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_update_policy" ON public.bookings
FOR UPDATE USING (
  auth.uid() = user_id OR 
  user_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  )
);

CREATE POLICY "bookings_delete_policy" ON public.bookings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  )
);

-- Create function to check if user has admin or hotel employee role
CREATE OR REPLACE FUNCTION public.is_admin_or_employee()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  );
END;
$$;

-- Insert a default admin user (you can update this with real credentials)
-- This is just for testing - in production, you'd create admin users through a proper process
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@amplodge.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Admin", "last_name": "User"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Create admin profile
INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT id, 'Admin', 'User', 'admin'
FROM auth.users 
WHERE email = 'admin@amplodge.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
