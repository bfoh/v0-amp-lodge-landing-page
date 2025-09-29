-- Create individual room instances for the calendar view
-- This allows us to track specific rooms (101, 102, 201, 202, 301) instead of just room types

CREATE TABLE IF NOT EXISTS public.room_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  room_number text NOT NULL UNIQUE,
  floor integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.room_instances ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active room instances
CREATE POLICY "room_instances_select_all" ON public.room_instances
FOR SELECT USING (is_active = true);

-- Only admins and hotel employees can modify room instances
CREATE POLICY "room_instances_admin_only" ON public.room_instances
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hotel_employee')
  )
);

-- Insert specific room instances based on the requirements
INSERT INTO public.room_instances (room_type_id, room_number, floor) 
SELECT 
  r.id,
  room_data.room_number,
  room_data.floor
FROM public.rooms r
CROSS JOIN (
  VALUES 
    ('Standard Room', '101', 1),
    ('Standard Room', '102', 1),
    ('Deluxe Room', '201', 2),
    ('Deluxe Room', '202', 2),
    ('Executive Suite', '301', 3)
) AS room_data(room_type, room_number, floor)
WHERE r.name = room_data.room_type
ON CONFLICT (room_number) DO NOTHING;

-- Update bookings table to reference specific room instances instead of room types
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS room_instance_id uuid REFERENCES public.room_instances(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_instance ON public.bookings(room_instance_id);

-- Update the availability check function to work with room instances
CREATE OR REPLACE FUNCTION public.check_room_instance_availability(
  room_instance_id_param uuid,
  check_in_param date,
  check_out_param date
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_instance_id = room_instance_id_param
    AND status NOT IN ('cancelled')
    AND (
      (check_in_date <= check_in_param AND check_out_date > check_in_param) OR
      (check_in_date < check_out_param AND check_out_date >= check_out_param) OR
      (check_in_date >= check_in_param AND check_out_date <= check_out_param)
    )
  );
END;
$$;
