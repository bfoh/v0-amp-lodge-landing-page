-- Add guest information fields to bookings table and make user_id nullable
alter table public.bookings 
  alter column user_id drop not null,
  add column guest_first_name text,
  add column guest_last_name text,
  add column guest_email text,
  add column guest_phone text;

-- Add constraint to ensure either user_id or guest info is provided
alter table public.bookings 
  add constraint booking_has_user_or_guest 
  check (
    (user_id is not null) or 
    (guest_first_name is not null and guest_last_name is not null and guest_email is not null and guest_phone is not null)
  );

-- Update RLS policies to allow guest bookings
drop policy if exists "bookings_select_own" on public.bookings;
drop policy if exists "bookings_insert_own" on public.bookings;
drop policy if exists "bookings_update_own" on public.bookings;

-- New policies that handle both authenticated users and guest bookings
create policy "bookings_select_policy"
  on public.bookings for select
  using (
    auth.uid() = user_id or 
    user_id is null
  );

create policy "bookings_insert_policy"
  on public.bookings for insert
  with check (
    (auth.uid() = user_id) or 
    (user_id is null and guest_first_name is not null and guest_last_name is not null and guest_email is not null and guest_phone is not null)
  );

create policy "bookings_update_policy"
  on public.bookings for update
  using (
    auth.uid() = user_id or 
    (user_id is null and auth.uid() is null)
  );

-- Create index for guest email lookups
create index if not exists bookings_guest_email_idx on public.bookings(guest_email);
