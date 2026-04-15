-- 02_positions_and_elections.sql
-- Election definitions, offices, and election-office snapshots.

create table if not exists public.ballot_positions (
  id text primary key,
  title text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_ballot_positions_updated_at on public.ballot_positions;
create trigger trg_ballot_positions_updated_at
before update on public.ballot_positions
for each row
execute function public.set_updated_at();

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

drop trigger if exists trg_elections_updated_at on public.elections;
create trigger trg_elections_updated_at
before update on public.elections
for each row
execute function public.set_updated_at();

create table if not exists public.election_positions (
  election_id text not null references public.elections(id) on delete cascade,
  position_id text not null references public.ballot_positions(id) on delete restrict,
  -- Snapshot title keeps historical reports stable if a position title is renamed later.
  position_title_snapshot text not null,
  created_at timestamptz not null default now(),
  primary key (election_id, position_id)
);
