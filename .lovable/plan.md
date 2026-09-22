# Contact Us Management — Implementation Plan

This is a large feature. To ship it safely without breaking the current Contact Us page or admin, I'll deliver it in 4 phases. Each phase is independently testable and leaves the site fully working.

## Scope confirmation

- Keep the existing Contact Us visual design (cards, colors, spacing, animations) — only swap hardcoded content for Supabase-driven content.
- Reuse existing Supabase project (no Lovable Cloud migration).
- Reuse the existing admin auth (session-based demo login) — no new role system.
- Existing `contact_enquiries` table and enquiry admin already work; extend, not replace.

## Phase 1 — Database schema + seed (migrations only)

New tables (all with `authenticated` full grants, `anon` SELECT on active rows, RLS enabled):

- `contact_page_settings` (singleton row): form headings, labels, placeholders, whatsapp block, agreement/terms text + versions, success/failure messages.
- `contact_information_cards`: type (phone|email|support|address), title, label, content (jsonb for multi-values like 3 phone numbers), icon, action_url, display_order, is_active.
- `contact_social_links`: platform_name, platform_key, icon, url, display_order, is_active, open_in_new_tab.
- `contact_service_categories` + `contact_services` (FK) — parallel to existing services tables, scoped to the contact form dropdowns.
- Extend `contact_enquiries` with: `enquiry_number`, `service_category_id`, `service_id`, `service_category_name`, `service_name`, `location`, `preferred_date`, `customer_agreement_accepted`, `terms_accepted`, `agreement_version`, `terms_version`, `priority`, `assigned_to`, `source`.
- Trigger to auto-generate `ENQ-YYYY-000001` enquiry numbers.
- Indexes on enquiry_number, status, priority, created_at, category/service ids.

Seed inserts pull current hardcoded values from `src/lib/site.ts`, `src/data/services.ts`, and the existing Contact Us page so the public page renders identically before any admin edit.

## Phase 2 — Public page reads from Supabase (no visual change)

- New hooks in `src/lib/contact-page-settings.ts`:
  `useContactPageSettings`, `useContactInformationCards`, `useContactSocialLinks`, `useContactServiceCategories(withServices)`.
- Each hook returns hardcoded fallback data instantly (no skeleton), then swaps to Supabase data on load — matches current no-layout-shift behavior.
- Update `src/routes/contact-us.tsx` to read from these hooks. Existing JSX/classes unchanged; only content sources swap.
- Update `submitContactEnquiry` in `src/lib/contact-enquiries.ts` to include the new fields (category_id, service_id, agreement/terms acceptance + versions, priority default `Normal`). Fallback path preserved.

## Phase 3 — Admin "Contact Us Management" module

- Add sidebar entry in `src/components/site/AdminShell.tsx` (Phone icon) → `/admin/contact-us`.
- New route `src/routes/admin.contact-us.tsx` with tabs (shadcn Tabs):
  1. Contact Information — 4 card editors (phone card supports 3 numbers with per-number enable toggles).
  2. WhatsApp Section — heading, description, number, default message, button label, visibility.
  3. Social Media Links — repeatable list (add/edit/delete/reorder/toggle active).
  4. Enquiry Form Settings — every label/placeholder/message + required/optional/hidden per non-essential field.
  5. Service Categories — CRUD categories + nested services, with archive-instead-of-delete when referenced by an enquiry.
  6. Terms & Agreement — rich text for both docs, version bump on save.
  7. Customer Enquiries — link to existing `/admin/contact` (keep that page; avoid duplication).
- Each tab: Edit / Save / Cancel, unsaved-changes guard, toast on success/error, upsert for singleton settings.

## Phase 4 — Enquiry management enhancements

Extend existing `/admin/contact`:
- Add filters: priority, category, service, date range; sort newest/oldest; pagination (25/page).
- Row actions: call (`tel:`), email (`mailto:`), WhatsApp, copy contact, priority change, assign-to, archive, CSV export.
- Detail drawer already supports notes/status — add priority + assignment + acceptance metadata display.

## Out of scope for this pass

- New role system (super-admin vs admin) — current admin session gates everything; noted for a later change.
- Email/SMS admin notifications — noted; would need SMTP or edge function later.
- Full audit log table — audit is limited to `updated_at`/`updated_by` on settings rows; enquiry activity log deferred.

## Technical notes

- All new tables get: `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated`, `GRANT ALL ... TO service_role`, `GRANT SELECT ... TO anon` (only on the read-only public tables). `contact_enquiries` keeps `INSERT TO anon` for public submissions.
- RLS: public SELECT limited to `is_active = true`; writes limited to `authenticated`.
- No service-role key in frontend.
- No changes to routing structure, existing components remain intact.

## Deliverable order

1. Migration file(s) + seed.
2. Public hooks + wire-up (verify page identical).
3. Admin module with 6 editor tabs.
4. Enquiry list filters/actions/export.

Confirm and I'll proceed with Phase 1 (migrations + seed) first, then continue phase by phase.
