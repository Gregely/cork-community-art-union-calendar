-- Separate storage tracking column so we know which images are
-- in Supabase Storage (and can be deleted) vs external URLs.
alter table public.events add column if not exists image_storage_path text;
