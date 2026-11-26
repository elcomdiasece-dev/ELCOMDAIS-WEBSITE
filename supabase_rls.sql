-- Run once in Supabase → SQL editor. Review table/column names against your schema first.
-- Model: the public can read site content and INSERT registrations only. Admins (logged-in
-- Supabase users) can do everything. Public sign-ups must be OFF (Authentication → Sign In / Providers → "Allow new users to sign up").

-- 1. Helper functions for the public event page (no registrant data is exposed).
create or replace function public.registration_count(p_event_id text)
returns int language sql security definer set search_path = public as $$
  select count(*)::int from registrations where "eventId" = p_event_id;
$$;

create or replace function public.registration_taken(p_event_id text, p_values text[])
returns text language sql security definer set search_path = public as $$
  select v from unnest(p_values) v
  where exists (
    select 1 from registrations r
    where r."eventId" = p_event_id and (
      lower(r.data::text::jsonb->>'regno') = lower(trim(v)) or
      lower(r.data::text::jsonb->>'email') = lower(trim(v)) or
      exists (
        select 1 from jsonb_array_elements(coalesce(r.data::text::jsonb->'teamMembers','[]'::jsonb)) m
        where lower(m->>'regno') = lower(trim(v)) or lower(m->>'email') = lower(trim(v))
      )
    )
  ) limit 1;
$$;
revoke all on function public.registration_count(text), public.registration_taken(text, text[]) from public;
grant execute on function public.registration_count(text), public.registration_taken(text, text[]) to anon, authenticated;

-- 2. Turn RLS on everywhere.
alter table registrations enable row level security;
alter table settings      enable row level security;
alter table events        enable row level security;
alter table albums        enable row level security;
alter table images        enable row level security;

-- 3. Drop old permissive policies (names unknown) so only the ones below apply.
do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname = 'public' and tablename in ('registrations','settings','events','albums','images')
  loop execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename); end loop;
end $$;

-- 4. registrations: public insert only (bounded size); admins read/update/delete.
create policy reg_insert_public on registrations for insert to anon, authenticated
  with check (length(data::text) < 5000 and length("eventId") < 100);
create policy reg_admin_all on registrations for all to authenticated using (true) with check (true);

-- 5. Content tables: public read, admin write. settings: never expose a leftover 'registrations' key.
create policy events_read on events for select to anon, authenticated using (true);
create policy albums_read on albums for select to anon, authenticated using (true);
create policy images_read on images for select to anon, authenticated using (true);
create policy settings_read on settings for select to anon, authenticated using (key in ('events','committee'));
create policy events_admin on events for all to authenticated using (true) with check (true);
create policy albums_admin on albums for all to authenticated using (true) with check (true);
create policy images_admin on images for all to authenticated using (true) with check (true);
create policy settings_admin on settings for all to authenticated using (true) with check (true);

-- 6. MANUAL, AFTER CHECKING: the old settings row key='registrations' may hold registrations that never reached
-- the table (it was the app's "backup"). The policy above already hides it from the public. Compare it with the
-- table, copy any missing rows across, export a backup, and only then run:
--   delete from settings where key = 'registrations';
