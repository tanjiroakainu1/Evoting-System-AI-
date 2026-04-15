-- 91_seed_demo_elections.sql
-- Optional demo elections/positions seed for immediate testing.

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
