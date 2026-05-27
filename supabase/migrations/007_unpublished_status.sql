-- Add 'unpublished' as a distinct event status so admins can hide
-- published events without conflating them with rejected submissions.
ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'unpublished';
