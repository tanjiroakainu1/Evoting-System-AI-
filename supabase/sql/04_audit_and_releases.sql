-- 04_audit_and_releases.sql
-- Audit trail for election actions and official result publication metadata.

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

create index if not exists election_activity_logs_election_idx
  on public.election_activity_logs (election_id, created_at desc);

create table if not exists public.official_results_releases (
  id text primary key,
  election_id text not null references public.elections(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by_user_id text references public.app_users(id) on delete set null,
  created_by_email citext not null,
  created_by_role app_role not null
);

create unique index if not exists official_results_releases_unique_election_idx
  on public.official_results_releases (election_id);

-- Admin / MIS / OSA reference view for election and voter PIN lookups.
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

-- Lightweight app metadata for assistant/branding references in demo builds.
create or replace view public.v_system_assistant_profile as
select
  'E-Vote Assistant'::text as assistant_name,
  'OpenRouter'::text as ai_provider,
  'Raminder Jangao'::text as developer_name,
  true::boolean as floating_gem_enabled;
