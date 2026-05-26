# Cork Community Art Union Calendar

A React, TypeScript, Vite, Tailwind CSS MVP shell for a shared public cultural calendar for Cork city art events.

## Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Supabase Backend Setup

1. Create a new project at [Supabase](https://supabase.com).
2. Install and log in to the Supabase CLI if you want to run migrations locally:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

The initial schema is in `supabase/migrations/001_initial_schema.sql`.

You can also paste the migration SQL into the Supabase SQL editor for the project.

## Environment Variables

Copy `.env.example` to `.env.local` and add the values from Supabase Project Settings:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The app is still using local mock data for the frontend. Supabase reads and writes will be wired in the next milestone.

## Creating the First Admin

Admins use Supabase Auth with email/password login.

1. Create a user in Supabase Auth.
2. Copy their user id.
3. Insert it into `public.admin_users`:

```sql
insert into public.admin_users (user_id)
values ('USER_ID_HERE');
```

Replace `USER_ID_HERE` with the user's `auth.users.id`.

Public visitors can read approved events and submit pending events. Only users listed in `public.admin_users` can review, update, or delete event records.

## Sample Cork Venues

After running `supabase/migrations/002_venues.sql`, you can seed a few venue names for autocomplete:

```sql
insert into public.venues (name)
values
  ('The Roundy'),
  ('The Kino'),
  ('Triskel Arts Centre'),
  ('Cork Opera House'),
  ('The Everyman'),
  ('Sample Studios'),
  ('St Peter''s Cork'),
  ('Crawford Art Gallery'),
  ('Cyprus Avenue'),
  ('The Poor Relation'),
  ('Plugd Records'),
  ('The Pavilion')
on conflict (name) do nothing;
```

Addresses and direct maps URLs are optional. If they are blank, the app generates map searches using the venue name plus `Cork, Ireland`.
