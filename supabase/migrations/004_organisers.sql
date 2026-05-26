create table public.organisers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  email text,
  website text,
  instagram text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events
add column organiser_id uuid references public.organisers(id);

create index organisers_name_idx on public.organisers (name);
create index events_organiser_id_idx on public.events (organiser_id);

create trigger set_organisers_updated_at
before update on public.organisers
for each row
execute function public.set_updated_at();

alter table public.organisers enable row level security;

create policy "Public can read organisers"
on public.organisers
for select
using (true);

create policy "Admin users can insert organisers"
on public.organisers
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin users can update organisers"
on public.organisers
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin users can delete organisers"
on public.organisers
for delete
to authenticated
using (public.is_admin(auth.uid()));
