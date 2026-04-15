# Supabase Integration Guide

This project now includes Supabase scaffolding and SQL schema files under `supabase/sql`.

## 1) Environment Variables

Copy `.env.example` to `.env.local` and set values:

```bash
cp .env.example .env.local
```

Required client variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Server-only secrets (never expose in browser code):

- `SUPABASE_SECRET_KEY`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_DATABASE_URL`

## 2) Supabase CLI Commands

Run in project root:

```bash
supabase login
supabase init
supabase link --project-ref vlssswysvirpkiybaaoj
```

## 3) SQL Files (Categorized)

Folder: `supabase/sql`

- `00_extensions.sql` - required Postgres extensions
- `01_users_and_roles.sql` - user profile and role schema
- `02_positions_and_elections.sql` - elections and position snapshots
- `03_campaigns_and_votes.sql` - enrollments, campaign filings, and votes
- `04_audit_and_releases.sql` - activity logs and official result releases
- `05_rls_policies.sql` - demo RLS policies
- `90_seed_demo_accounts.sql` - demo accounts only (separate as requested)
- `91_seed_demo_elections.sql` - optional demo election/position seed
- `92_seed_demo_flow.sql` - approved candidates, ballots, votes, and logs across all roles
- `98_reset_schema_for_text_ids.sql` - one-time reset if old UUID schema was already applied
- `99_all_in_one.sql` - single merged script for one-paste setup

## 4) How to Execute SQL

Option A (recommended for quick setup): paste `99_all_in_one.sql` in Supabase SQL Editor.

If you already applied an older UUID-based schema, run:

1. `98_reset_schema_for_text_ids.sql`
2. `99_all_in_one.sql`

Option B (step-by-step):

1. `00_extensions.sql`
2. `01_users_and_roles.sql`
3. `02_positions_and_elections.sql`
4. `03_campaigns_and_votes.sql`
5. `04_audit_and_releases.sql`
6. `05_rls_policies.sql`
7. `90_seed_demo_accounts.sql`
8. `91_seed_demo_elections.sql` (optional)

## 5) App-side Supabase Integration

Supabase client and mirror sync are scaffolded at:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/mirror.ts`

Current app keeps local-first behavior for instant UI state and mirrors writes to Supabase tables (`app_users`, elections, enrollments, campaign applications, votes, logs, releases). New registrations also call `supabase.auth.signUp`, so they should appear in Authentication -> Users.

Note: seeded local demo users are not automatically created in Supabase Auth unless they sign up through the app flow.

## 6) Security Reminder

If API keys, JWT secrets, or DB passwords were shared in chat/screenshots, rotate them in Supabase immediately:

1. Project Settings -> API Keys: rotate secret key
2. Project Settings -> JWT Keys: rotate signing key if exposed
3. Database password: reset in project settings

## 7) Testing Guide for All Roles

See `docs/ROLE_WORKFLOW_GUIDE.md` for a role-by-role walkthrough (Admin, MIS Office, OSA Office, Candidate, Voter) using seeded Supabase data.
