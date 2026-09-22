-- Contact Us enquiries. Idempotent.

CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_enquiries_created_at_idx
  ON public.contact_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_enquiries_status_idx
  ON public.contact_enquiries (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_contact_enquiries_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_contact_enquiries_updated_at ON public.contact_enquiries;
CREATE TRIGGER trg_contact_enquiries_updated_at
  BEFORE UPDATE ON public.contact_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_contact_enquiries_updated_at();

-- Data API grants
GRANT INSERT ON public.contact_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_enquiries TO authenticated;
GRANT ALL ON public.contact_enquiries TO service_role;

-- NOTE: This project's admin currently uses the anon key from the browser
-- (no Supabase Auth session yet). To keep Contact Management functional we
-- also grant SELECT/UPDATE/DELETE to anon. Tighten these once real admin
-- auth (Supabase Auth) is enabled by revoking from anon.
GRANT SELECT, UPDATE, DELETE ON public.contact_enquiries TO anon;

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

-- Enable Realtime for this table (Supabase dashboard: Database → Replication).
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_enquiries;