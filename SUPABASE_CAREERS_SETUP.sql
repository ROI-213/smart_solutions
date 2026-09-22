-- ================================================================
-- SMART SOLUTIONS — CAREERS MODULE
-- Run this in your Supabase SQL editor.
-- ================================================================

-- 1. TABLE
create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text unique not null,
  candidate_type text not null check (candidate_type in ('fresher','experienced')),
  position_applied_for text not null,
  custom_position text,
  preferred_job_location text not null,
  employment_type text not null,
  full_name text not null,
  date_of_birth date not null,
  gender text not null,
  nationality text,
  mobile_number text not null,
  email text not null,
  current_address text not null,
  city text,
  state text,
  pin_code text,
  highest_qualification text not null,
  custom_qualification text,
  course_degree text,
  institution text,
  year_of_passing int,
  percentage_cgpa text,
  technical_skills text[],
  languages_known text[],
  total_experience_years int,
  total_experience_months int,
  current_last_company text,
  current_last_job_title text,
  current_last_salary text,
  salary_period text,
  expected_salary text,
  expected_salary_period text,
  notice_period text,
  custom_notice_period text,
  key_skills text[],
  reason_for_leaving text,
  documents jsonb default '{}'::jsonb,
  portfolio_url text,
  declaration_confirmed boolean not null default false,
  privacy_terms_accepted boolean not null default false,
  application_status text not null default 'New',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_applications_status_idx on public.career_applications (application_status);
create index if not exists career_applications_submitted_idx on public.career_applications (submitted_at desc);

-- 2. GRANTS (public inserts, authenticated admin reads)
grant insert on public.career_applications to anon;
grant select, insert, update, delete on public.career_applications to authenticated;
grant all on public.career_applications to service_role;

-- 3. RLS
alter table public.career_applications enable row level security;

drop policy if exists "public can submit applications" on public.career_applications;
create policy "public can submit applications"
  on public.career_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated can read applications" on public.career_applications;
create policy "authenticated can read applications"
  on public.career_applications for select
  to authenticated using (true);

drop policy if exists "authenticated can update applications" on public.career_applications;
create policy "authenticated can update applications"
  on public.career_applications for update
  to authenticated using (true) with check (true);

drop policy if exists "authenticated can delete applications" on public.career_applications;
create policy "authenticated can delete applications"
  on public.career_applications for delete
  to authenticated using (true);

-- 4. STORAGE BUCKET
--  Create the "career-documents" bucket as PRIVATE from Supabase dashboard
--  Storage > New bucket > name: career-documents, Public: OFF
--  Then run these policies:

drop policy if exists "public can upload career docs" on storage.objects;
create policy "public can upload career docs"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'career-documents');

drop policy if exists "authenticated can read career docs" on storage.objects;
create policy "authenticated can read career docs"
  on storage.objects for select
  to authenticated using (bucket_id = 'career-documents');

drop policy if exists "authenticated can delete career docs" on storage.objects;
create policy "authenticated can delete career docs"
  on storage.objects for delete
  to authenticated using (bucket_id = 'career-documents');