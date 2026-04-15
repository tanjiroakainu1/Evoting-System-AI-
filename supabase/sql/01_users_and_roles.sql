-- 01_users_and_roles.sql
-- User directory table aligned with src/types/user.ts.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'voter', 'candidate', 'mis_office', 'osa_office');
  end if;

  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type registration_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.app_users (
  id text primary key,
  auth_user_id text unique,
  profile_display_id integer generated always as identity unique,
  email citext not null unique,
  full_name text not null,
  role app_role not null,
  -- DEV-ONLY convenience for local migration from localStorage demo auth.
  -- Replace with Supabase Auth in production.
  -- No DB-level length restriction; enforce strength in app/server logic.
  demo_password text,
  registration_status registration_status not null default 'approved',
  profile_photo_data_url text,
  account_type text,
  last_name text,
  first_name text,
  middle_name text,
  extension_name text,
  gender text,
  birthday date,
  citizenship text,
  civil_status text,
  contact_number text,
  province text,
  town_city text,
  barangay text,
  zip_code text,
  campus text,
  id_number text,
  department text,
  course text,
  year text,
  academic_year text,
  semester text,
  student_status text,
  precinct text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_users_year_level_chk check (
    year is null
    or year in ('1st Year', '2nd Year', '3rd Year', '4th Year')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();
