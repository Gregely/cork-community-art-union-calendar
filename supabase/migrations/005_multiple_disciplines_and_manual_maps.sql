-- Add disciplines array column and manual_maps_url to events table

-- Multiple disciplines: array of discipline names
alter table public.events
  add column if not exists disciplines text[] not null default '{}';

-- Backfill from the existing discipline text column
update public.events
set disciplines = array[discipline]
where disciplines = '{}'
  and discipline is not null
  and discipline <> '';

-- Manual maps link: only used when no saved venue is selected
alter table public.events
  add column if not exists manual_maps_url text;
