-- Create rooms table for room types and pricing
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  max_guests integer not null default 2,
  price_per_night decimal(10,2) not null,
  amenities text[],
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for rooms (public read access)
alter table public.rooms enable row level security;

-- Allow everyone to read rooms
create policy "rooms_select_all"
  on public.rooms for select
  using (is_active = true);

-- Insert default room types
insert into public.rooms (name, description, max_guests, price_per_night, amenities, image_url) values
  (
    'Standard Room',
    'Comfortable and affordable rooms with essential amenities for a pleasant stay in Kumasi.',
    2,
    150.00,
    array['Free WiFi', 'Air Conditioning', 'Flat Screen TV', 'Private Bathroom'],
    '/amp-lodge-standard-room.png'
  ),
  (
    'Deluxe Room',
    'Spacious rooms with modern amenities, comfortable bedding, and beautiful views of Kumasi.',
    2,
    250.00,
    array['Free WiFi', 'Air Conditioning', 'Flat Screen TV', 'Private Bathroom', 'Mini Fridge', 'City View'],
    '/amp-lodge-deluxe-room.png'
  ),
  (
    'Executive Suite',
    'Premium suites with separate living areas, premium amenities, and panoramic city views.',
    4,
    450.00,
    array['Free WiFi', 'Air Conditioning', 'Flat Screen TV', 'Private Bathroom', 'Mini Bar', 'Living Area', 'City View', 'Room Service'],
    '/amp-lodge-executive-suite.png'
  )
on conflict do nothing;
