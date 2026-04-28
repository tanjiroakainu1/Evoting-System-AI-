-- 90_seed_demo_accounts.sql
-- Demo users separated by request. DEV ONLY.
-- Replace demo_password with Supabase Auth users for production.

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
