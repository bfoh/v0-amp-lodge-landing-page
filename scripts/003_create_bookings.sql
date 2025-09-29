-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  guests integer not null default 1,
  total_amount decimal(10,2) not null,
  special_requests text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure check-out is after check-in
  constraint valid_dates check (check_out_date > check_in_date),
  -- Ensure guests don't exceed room capacity
  constraint valid_guests check (guests > 0)
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Create policies for bookings
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_room_id_idx on public.bookings(room_id);
create index if not exists bookings_dates_idx on public.bookings(check_in_date, check_out_date);
create index if not exists bookings_status_idx on public.bookings(status);
