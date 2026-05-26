create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  google_maps_url text,
  apple_maps_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events
add column venue_id uuid references public.venues(id);

create index venues_name_idx on public.venues (name);
create index events_venue_id_idx on public.events (venue_id);

create trigger set_venues_updated_at
before update on public.venues
for each row
execute function public.set_updated_at();

alter table public.venues enable row level security;

create policy "Public can read venues"
on public.venues
for select
using (true);

create policy "Admin users can insert venues"
on public.venues
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin users can update venues"
on public.venues
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin users can delete venues"
on public.venues
for delete
to authenticated
using (public.is_admin(auth.uid()));
