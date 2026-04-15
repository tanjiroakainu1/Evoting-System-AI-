# Role Workflow Guide (Demo)

This guide explains how to test the full election flow across all roles with the seeded SQL data.

## Required SQL

Run in Supabase SQL Editor:

1. `supabase/sql/98_reset_schema_for_text_ids.sql` (only if your old schema used UUID IDs)
2. `supabase/sql/99_all_in_one.sql`

The all-in-one script includes:
- demo users for all roles
- seeded elections + positions
- approved candidate applications
- voter enrollments and sample votes
- admin/MIS/OSA/voter activity logs

## Role-by-Role Flow

## Administrator
- Sign in as `admin@gmail.com`
- Go to `Elections`, create/update elections
- Go to `Campaign applications`, approve/reject candidate filings
- Go to `Election results`, publish official release

## MIS Office
- Sign in as `misoffice@gmail.com`
- Go to `Elections`, create or update shared elections
- Check `Election results` and confirm logs include MIS actions

## OSA Office
- Sign in as `osaoffice@gmail.com`
- Go to `Elections` and `Election results`
- Confirm logs include OSA actions and official result entries

## Candidate
- Sign in as `candidate@gmail.com` (or other seeded candidate)
- Open `Campaign application`
- Submit filing for an election office
- Admin reviews in `Campaign applications`

## Voter
- Sign in as `voter@gmail.com`
- Open `Elections` (new voter page) to see all enrolled elections
- Open ballot and vote from approved candidates
- Vote submissions are recorded and visible in results/logs

## What should be recorded

- `app_users`: registration/profile rows
- `campaign_applications`: candidate filings and review status
- `ballot_votes`: voter ballot submissions
- `election_activity_logs`: election create/update/delete/manual complete, results publish, vote cast
- `official_results_releases`: official release records
