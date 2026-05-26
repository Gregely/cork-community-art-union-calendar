create extension if not exists "pgcrypto";

create type public.event_status as enum ('pending', 'approved', 'rejected');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time time not null,
  end_time time,
  venue text not null,
  organiser text not null,
  discipline text not null,
  description text,
  link_or_ticket_info text not null,
  image_url text,
  status public.event_status not null default 'pending',
  submitter_name text,
  submitter_email text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index events_event_date_idx on public.events (event_date);
create index events_status_idx on public.events (status);
create index events_discipline_idx on public.events (discipline);
create index events_venue_idx on public.events (venue);
create index events_organiser_idx on public.events (organiser);
create index events_created_at_idx on public.events (created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

create or replace function public.prepare_event_submission()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.status = 'pending';
    new.admin_notes = null;
    new.approved_at = null;
    new.approved_by = null;
  end if;

  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = is_admin.user_id
  );
$$;

create trigger prepare_events_submission
before insert on public.events
for each row
execute function public.prepare_event_submission();

alter table public.events enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can select approved events"
on public.events
for select
using (status = 'approved');

create policy "Public can insert pending events"
on public.events
for insert
with check (status = 'pending');

create policy "Admin users can select all events"
on public.events
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admin users can update all events"
on public.events
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin users can delete events"
on public.events
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admin users can read their own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Existing admins can read all admin records"
on public.admin_users
for select
to authenticated
using (public.is_admin(auth.uid()));
