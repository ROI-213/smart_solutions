-- Services & Categories schema patch. Safe to re-run.
-- No data is deleted. Adds only missing columns, indexes, grants and policies.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS starting_price numeric,
  ADD COLUMN IF NOT EXISTS price_label text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS keywords text[],
  ADD COLUMN IF NOT EXISTS property_types text[],
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON public.services (slug);
CREATE INDEX IF NOT EXISTS services_category_id_idx ON public.services (category_id);

GRANT SELECT ON public.categories, public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.services TO authenticated;
GRANT ALL ON public.categories, public.services TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories public read active" ON public.categories;
CREATE POLICY "categories public read active"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "services public read active" ON public.services;
CREATE POLICY "services public read active"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "categories admin all" ON public.categories;
CREATE POLICY "categories admin all"
  ON public.categories FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services admin all" ON public.services;
CREATE POLICY "services admin all"
  ON public.services FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);