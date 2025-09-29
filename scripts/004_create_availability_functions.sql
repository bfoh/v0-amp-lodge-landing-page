-- Create function to check room availability
create or replace function public.check_room_availability(
  room_id_param uuid,
  check_in_param date,
  check_out_param date,
  exclude_booking_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  conflicting_bookings integer;
begin
  -- Count overlapping bookings for the room
  select count(*)
  into conflicting_bookings
  from public.bookings
  where room_id = room_id_param
    and status in ('pending', 'confirmed')
    and (
      -- New booking starts during existing booking
      (check_in_param >= check_in_date and check_in_param < check_out_date)
      or
      -- New booking ends during existing booking
      (check_out_param > check_in_date and check_out_param <= check_out_date)
      or
      -- New booking completely encompasses existing booking
      (check_in_param <= check_in_date and check_out_param >= check_out_date)
    )
    and (exclude_booking_id is null or id != exclude_booking_id);
  
  return conflicting_bookings = 0;
end;
$$;

-- Create function to get available rooms for date range
create or replace function public.get_available_rooms(
  check_in_param date,
  check_out_param date,
  guests_param integer default 1
)
returns table (
  id uuid,
  name text,
  description text,
  max_guests integer,
  price_per_night decimal,
  amenities text[],
  image_url text,
  total_price decimal
)
language plpgsql
security definer
as $$
declare
  nights integer;
begin
  -- Calculate number of nights
  nights := check_out_param - check_in_param;
  
  return query
  select 
    r.id,
    r.name,
    r.description,
    r.max_guests,
    r.price_per_night,
    r.amenities,
    r.image_url,
    (r.price_per_night * nights) as total_price
  from public.rooms r
  where r.is_active = true
    and r.max_guests >= guests_param
    and public.check_room_availability(r.id, check_in_param, check_out_param);
end;
$$;
