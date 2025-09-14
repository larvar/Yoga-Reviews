# Yoga Reviews (Next.js + Supabase)

A simple site to submit and browse LA Fitness yoga class reviews with photos, stars, search/filter and moderation.

## Quick start

1. Install Node.js 18+ (https://nodejs.org)
2. In this folder run:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` (Supabase Settings → API → Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `ADMIN_TOKEN` (make a long random string)

4. Update `next.config.ts` → set your Supabase host in `images.remotePatterns`.

5. Start dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

- Public list shows only **approved & not hidden**.
- New submissions are **pending** until approved at `/admin` (enter your `ADMIN_TOKEN`).

## Supabase setup

Run this SQL once in the Supabase SQL editor:

```sql
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text,
  instructor text,
  location text,
  rating int check (rating between 1 and 5),
  comment text,
  comments text,
  photo_url text,
  approved boolean not null default false,
  hidden boolean not null default false,
  flag_count int not null default 0,
  moderator_note text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS (prototype)
alter table public.reviews enable row level security;
drop policy if exists public_select_reviews on public.reviews;
create policy public_select_reviews on public.reviews for select using (true);
drop policy if exists public_insert_reviews on public.reviews;
create policy public_insert_reviews on public.reviews for insert with check (true);
drop policy if exists public_update_reviews on public.reviews;
create policy public_update_reviews on public.reviews for update using (true) with check (true);
drop policy if exists public_delete_reviews on public.reviews;
create policy public_delete_reviews on public.reviews for delete using (true);

-- Realtime
alter publication supabase_realtime add table public.reviews;

-- Storage bucket
insert into storage.buckets (id, name, public) values ('instructor-photos','instructor-photos', true)
on conflict (id) do nothing;

-- Storage policies (public read/insert/delete)
drop policy if exists "Public read instructor-photos" on storage.objects;
create policy "Public read instructor-photos"
on storage.objects for select
using (bucket_id = 'instructor-photos');

drop policy if exists "Public insert instructor-photos" on storage.objects;
create policy "Public insert instructor-photos"
on storage.objects for insert
with check (bucket_id = 'instructor-photos');

drop policy if exists "Public delete instructor-photos" on storage.objects;
create policy "Public delete instructor-photos"
on storage.objects for delete
using (bucket_id = 'instructor-photos');
```

## Deploy (Vercel)

- Push this folder to GitHub.
- Import in Vercel → add the same env vars.
- Update `next.config.ts` remotePatterns host to your supabase project ref.
