-- 98_reset_schema_for_text_ids.sql
-- Run this once if you already created the old UUID-based schema.
-- After this, run 99_all_in_one.sql.

drop table if exists public.official_results_releases cascade;
drop table if exists public.election_activity_logs cascade;
drop table if exists public.ballot_votes cascade;
drop table if exists public.campaign_applications cascade;
drop table if exists public.election_voter_enrollments cascade;
drop table if exists public.election_positions cascade;
drop table if exists public.elections cascade;
drop table if exists public.ballot_positions cascade;
drop table if exists public.app_users cascade;

drop type if exists campaign_application_status cascade;
drop type if exists registration_status cascade;
drop type if exists app_role cascade;
