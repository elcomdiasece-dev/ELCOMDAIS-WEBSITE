-- Run once in Supabase SQL editor, AFTER supabase_rls.sql.
-- Server-side guard on registrations: seat limit, duplicates, and per-IP rate limit for public submissions.

create table if not exists public.registration_attempts (ip text not null, at timestamptz not null default now());
create index if not exists registration_attempts_ip_at on public.registration_attempts (ip, at);
alter table public.registration_attempts enable row level security; -- no policies: only the trigger below can use it

create or replace function public.guard_registration() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_ip text := coalesce(nullif(split_part(coalesce(current_setting('request.headers', true), '{}')::json->>'x-forwarded-for', ',', 1), ''), 'unknown');
  v_data jsonb;
  v_vals text[];
  v_cap int;
  v_taken text;
begin
  if auth.role() = 'authenticated' then return new; end if; -- admins are not limited

  -- rate limit: 100 public submissions per IP per 10 minutes (high enough for a shared campus network)
  delete from registration_attempts where at < now() - interval '1 day';
  if (select count(*) from registration_attempts where ip = v_ip and at > now() - interval '10 minutes') >= 100 then
    raise exception 'RATE_LIMITED';
  end if;
  insert into registration_attempts (ip) values (v_ip);

  -- one registration at a time per event, so the seat count cannot be raced
  perform pg_advisory_xact_lock(hashtext(new."eventId"));

  select case when e->>'capacity' ~ '^[0-9]+$' then (e->>'capacity')::int end into v_cap
  from settings s, jsonb_array_elements(s.value::text::jsonb) e
  where s.key = 'events' and e->>'id' = new."eventId" limit 1;
  if v_cap is not null and (select count(*) from registrations where "eventId" = new."eventId") >= v_cap then
    raise exception 'EVENT_FULL';
  end if;

  begin v_data := new.data::text::jsonb; exception when others then raise exception 'INVALID_DATA'; end;
  v_vals := array(
    select x from (
      select lower(trim(v_data->>'regno')) x union all select lower(trim(v_data->>'email'))
      union all select lower(trim(m->>'regno')) from jsonb_array_elements(case when jsonb_typeof(v_data->'teamMembers') = 'array' then v_data->'teamMembers' else '[]'::jsonb end) m
      union all select lower(trim(m->>'email')) from jsonb_array_elements(case when jsonb_typeof(v_data->'teamMembers') = 'array' then v_data->'teamMembers' else '[]'::jsonb end) m
    ) t where x is not null and x <> ''
  );
  v_taken := registration_taken(new."eventId", v_vals);
  if v_taken is not null then raise exception 'DUPLICATE: %', v_taken; end if;

  return new;
end $$;

drop trigger if exists guard_registration on public.registrations;
create trigger guard_registration before insert on public.registrations
  for each row execute function public.guard_registration();
