-- 05_rls_policies.sql
-- Demo-friendly RLS. Tighten these before production.

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
