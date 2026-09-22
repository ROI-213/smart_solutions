-- Allows the website Contact Us form to insert into the existing public.enquiries table.
-- Run this if you are using the older `enquiries` table instead of `contact_enquiries`.

GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enquiries public insert" ON public.enquiries;
CREATE POLICY "enquiries public insert"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);