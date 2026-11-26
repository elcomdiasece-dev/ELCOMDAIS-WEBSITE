-- Run once in Supabase SQL editor. Club join-form submissions.
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 100),
  regno text not null check (length(regno) between 3 and 20),
  year text not null check (year in ('1st Year','2nd Year','3rd Year','4th Year')),
  section text not null check (section in ('A','B','C')),
  branch text not null check (branch in ('B.Tech ECE','E&CS')),
  created_at timestamptz not null default now()
);
create unique index if not exists members_regno_unique on public.members (lower(regno));
alter table public.members enable row level security;

drop policy if exists members_insert_public on public.members;
drop policy if exists members_admin on public.members;
create policy members_insert_public on public.members for insert to anon, authenticated with check (true);
create policy members_admin on public.members for all to authenticated using (true) with check (true);

-- Rate limit public submissions per IP (reuses registration_attempts from supabase_registration_guard.sql).
create or replace function public.guard_member() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ip text := coalesce(nullif(split_part(coalesce(current_setting('request.headers', true), '{}')::json->>'x-forwarded-for', ',', 1), ''), 'unknown');
begin
  if auth.role() = 'authenticated' then return new; end if;
  if (select count(*) from registration_attempts where ip = v_ip and at > now() - interval '10 minutes') >= 100 then
    raise exception 'RATE_LIMITED';
  end if;
  insert into registration_attempts (ip) values (v_ip);
  return new;
end $$;
drop trigger if exists guard_member on public.members;
create trigger guard_member before insert on public.members for each row execute function public.guard_member();

-- If you ran an earlier version of this file, this brings the branch rule up to date.
alter table public.members drop constraint if exists members_branch_check;
alter table public.members add constraint members_branch_check check (branch in ('B.Tech ECE','E&CS'));

-- Email column: SASTRA addresses only, one member per email.
alter table public.members add column if not exists email text;
alter table public.members drop constraint if exists members_email_check;
alter table public.members add constraint members_email_check
  check (email is null or (length(email) <= 100 and email ~* '^[a-z0-9._-]+@sastra[.]ac[.]in$'));
create unique index if not exists members_email_unique on public.members (lower(email));
-- New public submissions must include an email (older rows may be blank).
drop policy if exists members_insert_public on public.members;
create policy members_insert_public on public.members for insert to anon, authenticated with check (email is not null);
