-- 03_campaigns_and_votes.sql
-- Voter enrollments, candidate filings, and cast ballots.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_application_status') then
    create type campaign_application_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

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

create unique index if not exists election_voter_enrollments_pin_unique_idx
  on public.election_voter_enrollments (election_id, pin);

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

create index if not exists ballot_votes_election_position_idx
  on public.ballot_votes (election_id, position_id);
