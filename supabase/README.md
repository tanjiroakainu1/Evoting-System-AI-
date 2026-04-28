# Supabase SQL Folder

All SQL for this system is categorized inside `supabase/sql`.

Use:

- `00_session_signout_note.sql` — documents how sign-out works for every role (client-side; not a DB operation)
- `99_all_in_one.sql` for one-shot setup
- or run individual files in numeric order
- if you previously created UUID tables, run `98_reset_schema_for_text_ids.sql` first
- include `92_seed_demo_flow.sql` for full cross-role demo walkthrough data
