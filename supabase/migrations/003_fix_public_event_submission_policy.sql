drop policy if exists "Anyone can submit events" on public.events;
drop policy if exists "Public can insert pending events" on public.events;

create policy "Anyone can submit pending events"
on public.events
for insert
to anon, authenticated
with check (
  status = 'pending'
);

create or replace function public.prepare_event_submission()
returns trigger
language plpgsql
as $$
begin
  if coalesce(public.is_admin(auth.uid()), false) = false then
    new.status = 'pending';
    new.admin_notes = null;
    new.approved_at = null;
    new.approved_by = null;
  end if;

  return new;
end;
$$;
