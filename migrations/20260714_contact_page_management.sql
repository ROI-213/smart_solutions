-- Contact Us Management: settings tables + seed. Idempotent.

-- 1. Singleton page settings (form labels, whatsapp block, terms text)
CREATE TABLE IF NOT EXISTS public.contact_page_settings (
  id int PRIMARY KEY DEFAULT 1,
  form_heading text NOT NULL DEFAULT 'Send an Enquiry',
  form_subheading text NOT NULL DEFAULT 'Fill in the request details below.',
  form_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_heading text NOT NULL DEFAULT 'Chat on WhatsApp',
  whatsapp_description text NOT NULL DEFAULT 'Get an instant response. Click below and we''ll help you book your service in minutes.',
  whatsapp_button_label text NOT NULL DEFAULT 'Chat on WhatsApp',
  whatsapp_number text NOT NULL DEFAULT '919844345088',
  whatsapp_default_message text NOT NULL DEFAULT 'Hi Smart Solutions Groups, I need help with home/building service. Please contact me.',
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  agreement_title text NOT NULL DEFAULT 'Customer Service Agreement',
  agreement_content text NOT NULL DEFAULT '',
  agreement_version text NOT NULL DEFAULT 'v1.0',
  terms_title text NOT NULL DEFAULT 'Terms and Conditions',
  terms_content text NOT NULL DEFAULT '',
  terms_version text NOT NULL DEFAULT 'v1.0',
  success_message text NOT NULL DEFAULT 'Thank you for contacting us. Our team will get back to you shortly.',
  failure_message text NOT NULL DEFAULT 'We couldn''t send your enquiry. Please check your connection and try again.',
  submit_button_label text NOT NULL DEFAULT 'Submit Enquiry',
  form_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_page_settings_singleton CHECK (id = 1)
);

-- 2. Contact information cards (phone / email / support / address)
CREATE TABLE IF NOT EXISTS public.contact_information_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type text NOT NULL CHECK (card_type IN ('phone','email','support','address')),
  title text NOT NULL,
  label text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon text,
  action_url text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_info_cards_order_idx ON public.contact_information_cards (display_order);

-- 3. Social media links for contact page (parallel to legacy settings-store)
CREATE TABLE IF NOT EXISTS public.contact_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL,
  platform_key text NOT NULL,
  icon text NOT NULL,
  url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_social_links_order_idx ON public.contact_social_links (display_order);

-- 4. Extend contact_enquiries with new fields
ALTER TABLE public.contact_enquiries
  ADD COLUMN IF NOT EXISTS enquiry_number text,
  ADD COLUMN IF NOT EXISTS service_category_id uuid,
  ADD COLUMN IF NOT EXISTS service_id uuid,
  ADD COLUMN IF NOT EXISTS service_category_name text,
  ADD COLUMN IF NOT EXISTS service_name text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS customer_agreement_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreement_version text,
  ADD COLUMN IF NOT EXISTS terms_version text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'Contact Us';

CREATE UNIQUE INDEX IF NOT EXISTS contact_enquiries_number_idx ON public.contact_enquiries (enquiry_number);
CREATE INDEX IF NOT EXISTS contact_enquiries_priority_idx ON public.contact_enquiries (priority);
CREATE INDEX IF NOT EXISTS contact_enquiries_service_cat_idx ON public.contact_enquiries (service_category_id);
CREATE INDEX IF NOT EXISTS contact_enquiries_service_idx ON public.contact_enquiries (service_id);
CREATE INDEX IF NOT EXISTS contact_enquiries_assigned_idx ON public.contact_enquiries (assigned_to);

-- Auto-generate enquiry_number like ENQ-2026-000001
CREATE OR REPLACE FUNCTION public.set_contact_enquiry_number()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  seq_num bigint;
  yr text := to_char(now(), 'YYYY');
BEGIN
  IF NEW.enquiry_number IS NULL THEN
    SELECT COUNT(*) + 1 INTO seq_num
      FROM public.contact_enquiries
     WHERE enquiry_number LIKE 'ENQ-' || yr || '-%';
    NEW.enquiry_number := 'ENQ-' || yr || '-' || lpad(seq_num::text, 6, '0');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_contact_enquiry_number ON public.contact_enquiries;
CREATE TRIGGER trg_contact_enquiry_number
  BEFORE INSERT ON public.contact_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_contact_enquiry_number();

-- Grants
GRANT SELECT ON public.contact_page_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_page_settings TO authenticated, anon;
GRANT ALL ON public.contact_page_settings TO service_role;

GRANT SELECT ON public.contact_information_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_information_cards TO authenticated, anon;
GRANT ALL ON public.contact_information_cards TO service_role;

GRANT SELECT ON public.contact_social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_social_links TO authenticated, anon;
GRANT ALL ON public.contact_social_links TO service_role;

-- RLS: permissive (mirrors current admin-auth model that uses anon key)
ALTER TABLE public.contact_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_information_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_social_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "cps all" ON public.contact_page_settings;
  CREATE POLICY "cps all" ON public.contact_page_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "cic all" ON public.contact_information_cards;
  CREATE POLICY "cic all" ON public.contact_information_cards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "csl all" ON public.contact_social_links;
  CREATE POLICY "csl all" ON public.contact_social_links FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- Seed singleton settings
INSERT INTO public.contact_page_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

UPDATE public.contact_page_settings SET
  form_settings = COALESCE(form_settings, '{}'::jsonb) || jsonb_build_object(
    'nameLabel','Name','namePlaceholder','Full name',
    'phoneLabel','Phone Number','phonePlaceholder','10-digit mobile',
    'emailLabel','Email','emailPlaceholder','you@example.com',
    'categoryLabel','Service Category','serviceLabel','Service Required',
    'locationLabel','Location','locationPlaceholder','Area / City',
    'dateLabel','Preferred Date','messageLabel','Message',
    'messagePlaceholder','Tell us about the work...',
    'agreementCheckboxText','I accept the Customer Service Agreement.',
    'termsCheckboxText','I accept the Terms and Conditions.'
  ),
  agreement_content = COALESCE(NULLIF(agreement_content, ''),
    'By submitting this enquiry, you agree to allow Smart Solutions Groups to contact you regarding your service request. Service pricing, scheduling, and completion are subject to on-site assessment. All work is guaranteed and performed by trained technicians.'),
  terms_content = COALESCE(NULLIF(terms_content, ''),
    'All services are provided in accordance with company policies. Payment is due upon completion. Warranty terms depend on service category. Cancellations must be made 2 hours in advance. Smart Solutions Groups reserves the right to reschedule for reasons beyond our control.')
WHERE id = 1;

-- Seed 4 information cards
INSERT INTO public.contact_information_cards (card_type, title, label, content, icon, action_url, display_order, is_active)
SELECT 'phone','Phone','Call us anytime',
       '{"numbers":[{"value":"9844345088","active":true},{"value":"9844345312","active":true},{"value":"9844345688","active":true}]}'::jsonb,
       'Phone','tel:9844345088',1,true
WHERE NOT EXISTS (SELECT 1 FROM public.contact_information_cards WHERE card_type='phone');

INSERT INTO public.contact_information_cards (card_type, title, label, content, icon, action_url, display_order, is_active)
SELECT 'email','Email','Write to us',
       '{"primary":"customercare@homecare-smartsolutions.co.in","secondary":"hr.accounts@smartsolutions.co.in"}'::jsonb,
       'Mail','mailto:customercare@homecare-smartsolutions.co.in',2,true
WHERE NOT EXISTS (SELECT 1 FROM public.contact_information_cards WHERE card_type='email');

INSERT INTO public.contact_information_cards (card_type, title, label, content, icon, display_order, is_active)
SELECT 'support','Service Support','We serve',
       '{"text":"Homes, Apartments, Villas, Offices & All Types of Buildings"}'::jsonb,
       'Building2',3,true
WHERE NOT EXISTS (SELECT 1 FROM public.contact_information_cards WHERE card_type='support');

INSERT INTO public.contact_information_cards (card_type, title, label, content, icon, action_url, display_order, is_active)
SELECT 'address','ADDRESS','Visit us',
       '{"lines":["Bengaluru"],"maps_url":"https://maps.google.com/?q=Bengaluru"}'::jsonb,
       'MapPin','https://maps.google.com/?q=Bengaluru',4,true
WHERE NOT EXISTS (SELECT 1 FROM public.contact_information_cards WHERE card_type='address');

-- Seed social links
INSERT INTO public.contact_social_links (platform_name, platform_key, icon, url, display_order, is_active)
SELECT * FROM (VALUES
  ('Facebook','facebook','facebook','https://facebook.com',1,true),
  ('Instagram','instagram','instagram','https://instagram.com',2,true),
  ('YouTube','youtube','youtube','https://youtube.com',3,true),
  ('LinkedIn','linkedin','linkedin','https://linkedin.com',4,true),
  ('WhatsApp','whatsapp','whatsapp','https://wa.me/919844345088',5,true),
  ('Google Business','google','google','https://google.com',6,true)
) AS v(platform_name, platform_key, icon, url, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.contact_social_links);

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_page_settings;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_information_cards;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_social_links;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;