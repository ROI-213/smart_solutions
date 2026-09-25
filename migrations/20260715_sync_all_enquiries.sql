-- Migration: Ensure public access and Realtime for enquiries and contact_enquiries
-- Run this in the Supabase SQL Editor if you want both tables to have full anon permissions

-- 1. Ensure contact_enquiries permissions & Realtime
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_enquiries TO anon, authenticated;
GRANT ALL ON public.contact_enquiries TO service_role;

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_enquiries public insert" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries public insert"
  ON public.contact_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "contact_enquiries admin read" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries admin read"
  ON public.contact_enquiries FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "contact_enquiries admin update" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries admin update"
  ON public.contact_enquiries FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contact_enquiries admin delete" ON public.contact_enquiries;
CREATE POLICY "contact_enquiries admin delete"
  ON public.contact_enquiries FOR DELETE
  TO anon, authenticated
  USING (true);

-- 2. Ensure legacy enquiries table permissions & Realtime (if used)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO anon, authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enquiries public select" ON public.enquiries;
CREATE POLICY "enquiries public select"
  ON public.enquiries FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "enquiries public insert" ON public.enquiries;
CREATE POLICY "enquiries public insert"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "enquiries public update" ON public.enquiries;
CREATE POLICY "enquiries public update"
  ON public.enquiries FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "enquiries public delete" ON public.enquiries;
CREATE POLICY "enquiries public delete"
  ON public.enquiries FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. Add to Realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_enquiries;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
