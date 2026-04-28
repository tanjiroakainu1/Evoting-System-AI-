-- 99_all_in_one.sql
-- Complete schema + policies + demo seed (users and elections).
-- Run this in Supabase SQL Editor as a single paste.
-- This file merges:
-- 00_extensions.sql
-- 01_users_and_roles.sql
-- 02_positions_and_elections.sql
-- 03_campaigns_and_votes.sql
-- 04_audit_and_releases.sql
-- 05_rls_policies.sql
-- 90_seed_demo_accounts.sql
-- 91_seed_demo_elections.sql
-- 92_seed_demo_flow.sql

-- 00_extensions.sql
create extension if not exists pgcrypto;
create extension if not exists citext;

-- 01_users_and_roles.sql
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'voter', 'candidate', 'mis_office', 'osa_office');
  end if;

  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type registration_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'campaign_application_status') then
    create type campaign_application_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create table if not exists public.ballot_positions (
  id text primary key,
  title text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.elections (
  id text primary key,
  display_id bigint generated always as identity unique,
  title text not null,
  description text not null default '',
  organization_type text not null default '',
  voting_venue text not null default '',
  policies text not null default '',
  start_at timestamptz not null,
  end_at timestamptz not null,
  election_pin char(6) not null unique,
  created_by_user_id text references public.app_users(id) on delete set null,
  created_by_name text not null default '',
  manual_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint elections_date_range_chk check (end_at > start_at),
  constraint elections_pin_format_chk check (election_pin ~ '^[0-9]{6}$')
);

create or replace function public.random_pin6()
returns char(6)
language sql
as $$
  select lpad((floor(random() * 1000000))::text, 6, '0')::char(6);
$$;

create or replace function public.assign_election_pin()
returns trigger
language plpgsql
as $$
declare
  candidate_pin char(6);
  guard integer := 0;
begin
  if new.election_pin is not null and new.election_pin ~ '^[0-9]{6}$' then
    return new;
  end if;

  candidate_pin := public.random_pin6();
  while exists (
    select 1
    from public.elections e
    where e.election_pin = candidate_pin
      and e.id <> new.id
  ) and guard < 200 loop
    candidate_pin := public.random_pin6();
    guard := guard + 1;
  end loop;

  new.election_pin := candidate_pin;
  return new;
end;
$$;

drop trigger if exists trg_elections_assign_pin on public.elections;
create trigger trg_elections_assign_pin
before insert or update on public.elections
for each row
execute function public.assign_election_pin();

create table if not exists public.election_positions (
  election_id text not null references public.elections(id) on delete cascade,
  position_id text not null references public.ballot_positions(id) on delete restrict,
  -- Snapshot title keeps historical reports stable if a position title is renamed later.
  position_title_snapshot text not null,
  created_at timestamptz not null default now(),
  primary key (election_id, position_id)
);

create table if not exists public.election_voter_enrollments (
  election_id text not null references public.elections(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  voter_email citext not null,
  voter_name text not null,
  pin char(6) not null,
  created_at timestamptz not null default now(),
  primary key (election_id, user_id),
  constraint election_voter_pin_format_chk check (pin ~ '^[0-9]{6}$')
);

create or replace function public.assign_voter_pin()
returns trigger
language plpgsql
as $$
declare
  candidate_pin char(6);
  guard integer := 0;
begin
  if new.pin is not null and new.pin ~ '^[0-9]{6}$' then
    return new;
  end if;

  candidate_pin := public.random_pin6();
  while exists (
    select 1
    from public.election_voter_enrollments r
    where r.election_id = new.election_id
      and r.pin = candidate_pin
      and (r.user_id <> new.user_id)
  ) and guard < 200 loop
    candidate_pin := public.random_pin6();
    guard := guard + 1;
  end loop;

  new.pin := candidate_pin;
  return new;
end;
$$;

drop trigger if exists trg_election_voter_enrollments_assign_pin on public.election_voter_enrollments;
create trigger trg_election_voter_enrollments_assign_pin
before insert or update on public.election_voter_enrollments
for each row
execute function public.assign_voter_pin();

create table if not exists public.campaign_applications (
  id text primary key,
  election_id text not null references public.elections(id) on delete cascade,
  candidate_user_id text not null references public.app_users(id) on delete cascade,
  position_id text not null references public.ballot_positions(id) on delete restrict,
  platform text not null default '',
  ballot_photo_data_url text,
  status campaign_application_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_user_id text references public.app_users(id) on delete set null,
  reviewed_by_name text
);

create table if not exists public.ballot_votes (
  election_id text not null references public.elections(id) on delete cascade,
  voter_user_id text not null references public.app_users(id) on delete cascade,
  position_id text not null references public.ballot_positions(id) on delete restrict,
  application_id text not null references public.campaign_applications(id) on delete restrict,
  cast_at timestamptz not null default now(),
  primary key (election_id, voter_user_id, position_id)
);

create or replace function public.prevent_ballot_resubmission()
returns trigger
language plpgsql
as $$
declare
  first_cast timestamptz;
begin
  select min(v.cast_at)
    into first_cast
  from public.ballot_votes v
  where v.election_id = new.election_id
    and v.voter_user_id = new.voter_user_id;

  if first_cast is not null and new.cast_at <> first_cast then
    raise exception 'Ballot already submitted for this election. Re-voting is restricted.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ballot_votes_prevent_resubmission on public.ballot_votes;
create trigger trg_ballot_votes_prevent_resubmission
before insert or update on public.ballot_votes
for each row
execute function public.prevent_ballot_resubmission();

create table if not exists public.election_activity_logs (
  id text primary key,
  action text not null,
  election_id text references public.elections(id) on delete set null,
  election_display_id bigint,
  election_title text,
  actor_user_id text references public.app_users(id) on delete set null,
  actor_email citext,
  actor_role app_role,
  created_at timestamptz not null default now()
);

create table if not exists public.official_results_releases (
  id text primary key,
  election_id text not null references public.elections(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by_user_id text references public.app_users(id) on delete set null,
  created_by_email citext not null,
  created_by_role app_role not null
);

create unique index if not exists election_voter_enrollments_pin_unique_idx
  on public.election_voter_enrollments (election_id, pin);

with ranked_campaign_apps as (
  select
    ctid,
    row_number() over (
      partition by election_id, candidate_user_id
      order by created_at desc, id desc
    ) as rn
  from public.campaign_applications
)
delete from public.campaign_applications c
using ranked_campaign_apps r
where c.ctid = r.ctid
  and r.rn > 1;

drop index if exists campaign_applications_unique_candidate_slot_idx;
create unique index if not exists campaign_applications_unique_candidate_election_idx
  on public.campaign_applications (election_id, candidate_user_id);

create index if not exists ballot_votes_election_position_idx
  on public.ballot_votes (election_id, position_id);

create index if not exists election_activity_logs_election_idx
  on public.election_activity_logs (election_id, created_at desc);

create unique index if not exists official_results_releases_unique_election_idx
  on public.official_results_releases (election_id);

create or replace view public.v_election_pin_registry as
select
  e.id as election_id,
  e.display_id as election_display_id,
  e.title as election_title,
  e.election_pin,
  r.user_id as voter_user_id,
  r.voter_name,
  r.voter_email,
  r.pin as voter_pin
from public.elections e
left join public.election_voter_enrollments r
  on r.election_id = e.id;

create or replace view public.v_system_assistant_profile as
select
  'E-Vote Assistant'::text as assistant_name,
  'OpenRouter'::text as ai_provider,
  'Raminder Jangao'::text as developer_name,
  true::boolean as floating_gem_enabled;

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_ballot_positions_updated_at on public.ballot_positions;
create trigger trg_ballot_positions_updated_at
before update on public.ballot_positions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_elections_updated_at on public.elections;
create trigger trg_elections_updated_at
before update on public.elections
for each row
execute function public.set_updated_at();

alter table public.app_users enable row level security;
alter table public.ballot_positions enable row level security;
alter table public.elections enable row level security;
alter table public.election_positions enable row level security;
alter table public.election_voter_enrollments enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.ballot_votes enable row level security;
alter table public.election_activity_logs enable row level security;
alter table public.official_results_releases enable row level security;

drop policy if exists app_users_rw_demo on public.app_users;
create policy app_users_rw_demo on public.app_users
for all to anon, authenticated using (true) with check (true);

drop policy if exists ballot_positions_rw_demo on public.ballot_positions;
create policy ballot_positions_rw_demo on public.ballot_positions
for all to anon, authenticated using (true) with check (true);

drop policy if exists elections_rw_demo on public.elections;
create policy elections_rw_demo on public.elections
for all to anon, authenticated using (true) with check (true);

drop policy if exists election_positions_rw_demo on public.election_positions;
create policy election_positions_rw_demo on public.election_positions
for all to anon, authenticated using (true) with check (true);

drop policy if exists election_voter_enrollments_rw_demo on public.election_voter_enrollments;
create policy election_voter_enrollments_rw_demo on public.election_voter_enrollments
for all to anon, authenticated using (true) with check (true);

drop policy if exists campaign_applications_rw_demo on public.campaign_applications;
create policy campaign_applications_rw_demo on public.campaign_applications
for all to anon, authenticated using (true) with check (true);

drop policy if exists ballot_votes_rw_demo on public.ballot_votes;
create policy ballot_votes_rw_demo on public.ballot_votes
for all to anon, authenticated using (true) with check (true);

drop policy if exists election_activity_logs_rw_demo on public.election_activity_logs;
create policy election_activity_logs_rw_demo on public.election_activity_logs
for all to anon, authenticated using (true) with check (true);

drop policy if exists official_results_releases_rw_demo on public.official_results_releases;
create policy official_results_releases_rw_demo on public.official_results_releases
for all to anon, authenticated using (true) with check (true);

-- 90_seed_demo_accounts.sql
insert into public.app_users (
  id,
  email,
  full_name,
  role,
  demo_password,
  registration_status,
  account_type,
  campus,
  course,
  year,
  academic_year,
  semester,
  student_status,
  barangay,
  town_city,
  province,
  precinct
)
values
  ('10000000-0000-0000-0000-000000000001', 'admin@gmail.com', 'System Administrator', 'admin', 'admin123', 'approved', null, null, null, null, null, null, null, null, null, null, null),
  ('10000000-0000-0000-0000-000000000002', 'misoffice@gmail.com', 'MIS Office', 'mis_office', '123', 'approved', null, null, null, null, null, null, null, null, null, null, null),
  ('10000000-0000-0000-0000-000000000003', 'osaoffice@gmail.com', 'OSA Office', 'osa_office', '123', 'approved', null, null, null, null, null, null, null, null, null, null, null),
  ('10000000-0000-0000-0000-000000000010', 'voter@gmail.com', 'Demo Voter', 'voter', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Information Technology', '3rd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', 'Demo Precinct 001'),
  ('10000000-0000-0000-0000-000000000011', 'votertwo@gmail.com', 'Demo Voter Two', 'voter', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Information Technology', '2nd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', 'Demo Precinct 002'),
  ('10000000-0000-0000-0000-000000000012', 'voterthree@gmail.com', 'Demo Voter Three', 'voter', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Entrepreneurship', '1st Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', 'Demo Precinct 003'),
  ('10000000-0000-0000-0000-000000000013', 'voterfour@gmail.com', 'Demo Voter Four', 'voter', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Civil Engineering', '4th Year', '2025-2026', '2nd Semester', 'Irregular', 'Tagudin', 'Tagudin', 'Ilocos Sur', 'Demo Precinct 004'),
  ('10000000-0000-0000-0000-000000000020', 'candidate@gmail.com', 'Demo Candidate', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Information Technology', '3rd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null),
  ('10000000-0000-0000-0000-000000000021', 'testcandidate@gmail.com', 'Test Candidate', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Information Technology', '4th Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null),
  ('10000000-0000-0000-0000-000000000022', 'alphacandidate@gmail.com', 'Demo Candidate Alpha', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Accountancy', '3rd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null),
  ('10000000-0000-0000-0000-000000000023', 'betacandidate@gmail.com', 'Demo Candidate Beta', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Hospitality Management', '2nd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null),
  ('10000000-0000-0000-0000-000000000024', 'gammacandidate@gmail.com', 'Demo Candidate Gamma', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Criminology', '3rd Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null),
  ('10000000-0000-0000-0000-000000000025', 'deltacandidate@gmail.com', 'Demo Candidate Delta', 'candidate', '123', 'approved', 'Student', 'Tagudin Campus', 'BS Psychology', '4th Year', '2025-2026', '2nd Semester', 'Regular', 'Tagudin', 'Tagudin', 'Ilocos Sur', null)
on conflict (email) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  demo_password = excluded.demo_password,
  registration_status = excluded.registration_status,
  account_type = excluded.account_type,
  campus = excluded.campus,
  course = excluded.course,
  year = excluded.year,
  academic_year = excluded.academic_year,
  semester = excluded.semester,
  student_status = excluded.student_status,
  barangay = excluded.barangay,
  town_city = excluded.town_city,
  province = excluded.province,
  precinct = excluded.precinct;

create or replace view public.v_demo_quick_login_accounts as
select
  role,
  email,
  demo_password
from public.app_users
where email in (
  'admin@gmail.com',
  'misoffice@gmail.com',
  'osaoffice@gmail.com',
  'candidate@gmail.com',
  'voter@gmail.com'
)
order by role, email;

-- 91_seed_demo_elections.sql
insert into public.ballot_positions (id, title)
values
  ('20000000-0000-0000-0000-000000000001', 'President'),
  ('20000000-0000-0000-0000-000000000002', 'Vice President'),
  ('20000000-0000-0000-0000-000000000003', 'Secretary'),
  ('20000000-0000-0000-0000-000000000004', 'Treasurer'),
  ('20000000-0000-0000-0000-000000000005', 'Auditor')
on conflict (title) do nothing;

delete from public.ballot_positions where lower(title) = 'raminder';
delete from public.elections where lower(title) = 'sadasdasd';

insert into public.elections (
  id,
  title,
  description,
  organization_type,
  voting_venue,
  policies,
  start_at,
  end_at,
  election_pin,
  created_by_user_id,
  created_by_name
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'Demo: Student Council Election',
    'Annual election for the Supreme Student Council representatives (demo record).',
    'Supreme Student Council',
    'Tagudin Campus — Student Affairs Hall',
    'One vote per position. Voters must verify identity with their election PIN. Ballots are confidential.',
    '2025-01-15T08:00:00+08',
    '2025-01-20T18:00:00+08',
    '739105',
    (select id from public.app_users where email = 'admin@gmail.com'),
    'System Administrator'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Demo: Campus Leadership Election (Active)',
    'Live demo election with approved candidates and seeded votes for result flow.',
    'Supreme Student Council',
    'Tagudin Campus',
    'One vote per office. Seeded for end-to-end voting demonstration.',
    '2026-04-15T03:24:00+08',
    '2026-05-14T03:24:00+08',
    '628401',
    (select id from public.app_users where email = 'admin@gmail.com'),
    'System Administrator'
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  organization_type = excluded.organization_type,
  voting_venue = excluded.voting_venue,
  policies = excluded.policies,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  election_pin = excluded.election_pin,
  created_by_user_id = excluded.created_by_user_id,
  created_by_name = excluded.created_by_name;

insert into public.election_positions (election_id, position_id, position_title_snapshot)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'President'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Vice President'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'President'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Vice President')
on conflict (election_id, position_id) do nothing;

-- 92_seed_demo_flow.sql
insert into public.election_voter_enrollments (
  election_id,
  user_id,
  voter_email,
  voter_name,
  pin
)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'voter@gmail.com', 'Demo Voter', null),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'votertwo@gmail.com', 'Demo Voter Two', null),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 'voterthree@gmail.com', 'Demo Voter Three', null),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'voterfour@gmail.com', 'Demo Voter Four', null),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'voter@gmail.com', 'Demo Voter', null),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 'votertwo@gmail.com', 'Demo Voter Two', null),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', 'voterthree@gmail.com', 'Demo Voter Three', null),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000013', 'voterfour@gmail.com', 'Demo Voter Four', null)
on conflict (election_id, user_id) do update
set
  voter_email = excluded.voter_email,
  voter_name = excluded.voter_name;

insert into public.campaign_applications (
  id,
  election_id,
  candidate_user_id,
  position_id,
  platform,
  ballot_photo_data_url,
  status,
  created_at,
  reviewed_at,
  reviewed_by_user_id,
  reviewed_by_name
)
values
  ('40000000-0000-0000-0000-000000000101', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000001', 'Campus integrity and transparent student governance program.', null, 'approved', '2025-01-08T10:00:00+08', '2025-01-10T12:00:00+08', '10000000-0000-0000-0000-000000000001', 'System Administrator'),
  ('40000000-0000-0000-0000-000000000102', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000001', 'Inclusive academic engagement and student welfare platform.', null, 'approved', '2025-01-08T10:30:00+08', '2025-01-10T12:10:00+08', '10000000-0000-0000-0000-000000000001', 'System Administrator'),
  ('40000000-0000-0000-0000-000000000103', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000002', 'Student services digitization and campus helpdesk enhancement.', null, 'approved', '2025-01-08T11:00:00+08', '2025-01-10T12:20:00+08', '10000000-0000-0000-0000-000000000001', 'System Administrator'),
  ('40000000-0000-0000-0000-000000000104', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000002', 'Co-curricular events and leadership mentoring improvement roadmap.', null, 'approved', '2025-01-08T11:20:00+08', '2025-01-10T12:30:00+08', '10000000-0000-0000-0000-000000000001', 'System Administrator'),
  ('40000000-0000-0000-0000-000000000201', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000001', 'Reliable election execution and transparent reporting platform.', null, 'approved', '2026-04-02T10:00:00+08', '2026-04-03T09:00:00+08', '10000000-0000-0000-0000-000000000002', 'MIS Office'),
  ('40000000-0000-0000-0000-000000000202', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000001', 'Data-informed budget transparency and student welfare programs.', null, 'approved', '2026-04-02T10:15:00+08', '2026-04-03T09:05:00+08', '10000000-0000-0000-0000-000000000002', 'MIS Office'),
  ('40000000-0000-0000-0000-000000000203', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000002', 'Student communication channels and support response acceleration.', null, 'approved', '2026-04-02T10:30:00+08', '2026-04-03T09:10:00+08', '10000000-0000-0000-0000-000000000003', 'OSA Office'),
  ('40000000-0000-0000-0000-000000000204', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000002', 'Campus peer mentoring and leadership workshop expansion.', null, 'approved', '2026-04-02T10:45:00+08', '2026-04-03T09:20:00+08', '10000000-0000-0000-0000-000000000003', 'OSA Office')
on conflict (id) do update
set
  election_id = excluded.election_id,
  candidate_user_id = excluded.candidate_user_id,
  position_id = excluded.position_id,
  platform = excluded.platform,
  ballot_photo_data_url = excluded.ballot_photo_data_url,
  status = excluded.status,
  created_at = excluded.created_at,
  reviewed_at = excluded.reviewed_at,
  reviewed_by_user_id = excluded.reviewed_by_user_id,
  reviewed_by_name = excluded.reviewed_by_name;

insert into public.ballot_votes (
  election_id,
  voter_user_id,
  position_id,
  application_id,
  cast_at
)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000101', '2025-01-18T14:00:00+08'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000103', '2025-01-18T14:00:00+08'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000101', '2025-01-18T14:02:00+08'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000103', '2025-01-18T14:02:00+08'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000102', '2025-01-18T14:04:00+08'),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000103', '2025-01-18T14:04:00+08'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000201', '2026-04-16T08:45:00+08'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000203', '2026-04-16T08:45:00+08'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000202', '2026-04-16T08:52:00+08'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000203', '2026-04-16T08:52:00+08')
on conflict (election_id, voter_user_id, position_id) do update
set
  application_id = excluded.application_id,
  cast_at = excluded.cast_at;

insert into public.official_results_releases (
  id,
  election_id,
  created_at,
  created_by_user_id,
  created_by_email,
  created_by_role
)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2025-01-20T18:30:00+08', '10000000-0000-0000-0000-000000000001', 'admin@gmail.com', 'admin')
on conflict (id) do nothing;

insert into public.election_activity_logs (
  id,
  action,
  election_id,
  election_display_id,
  election_title,
  actor_user_id,
  actor_email,
  actor_role,
  created_at
)
values
  ('60000000-0000-0000-0000-000000000001', 'election_create', '30000000-0000-0000-0000-000000000001', 1842, 'Demo: Student Council Election', '10000000-0000-0000-0000-000000000001', 'admin@gmail.com', 'admin', '2025-01-10T10:05:00+08'),
  ('60000000-0000-0000-0000-000000000002', 'election_update', '30000000-0000-0000-0000-000000000002', 1843, 'Demo: Campus Leadership Election (Active)', '10000000-0000-0000-0000-000000000002', 'misoffice@gmail.com', 'mis_office', '2026-04-03T09:20:00+08'),
  ('60000000-0000-0000-0000-000000000003', 'results_publish', '30000000-0000-0000-0000-000000000001', 1842, 'Demo: Student Council Election', '10000000-0000-0000-0000-000000000003', 'osaoffice@gmail.com', 'osa_office', '2025-01-20T18:31:00+08'),
  ('60000000-0000-0000-0000-000000000004', 'vote_cast', '30000000-0000-0000-0000-000000000002', 1843, 'Demo: Campus Leadership Election (Active)', '10000000-0000-0000-0000-000000000010', 'voter@gmail.com', 'voter', '2026-04-16T08:45:00+08'),
  ('60000000-0000-0000-0000-000000000005', 'vote_cast', '30000000-0000-0000-0000-000000000002', 1843, 'Demo: Campus Leadership Election (Active)', '10000000-0000-0000-0000-000000000011', 'votertwo@gmail.com', 'voter', '2026-04-16T08:52:00+08'),
  ('60000000-0000-0000-0000-000000000006', 'vote_cast', '30000000-0000-0000-0000-000000000001', 1842, 'Demo: Student Council Election', '10000000-0000-0000-0000-000000000012', 'voterthree@gmail.com', 'voter', '2025-01-18T14:04:00+08')
on conflict (id) do update
set
  action = excluded.action,
  election_id = excluded.election_id,
  election_display_id = excluded.election_display_id,
  election_title = excluded.election_title,
  actor_user_id = excluded.actor_user_id,
  actor_email = excluded.actor_email,
  actor_role = excluded.actor_role,
  created_at = excluded.created_at;
