import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

// ==================== Types ====================

export type PhoneEntry = { value: string; active: boolean };

export type InfoCard = {
  id: string;
  cardType: "phone" | "email" | "support" | "address";
  title: string;
  label: string | null;
  content: Record<string, unknown>;
  icon: string | null;
  actionUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type ContactSocialLink = {
  id: string;
  platformName: string;
  platformKey: string;
  icon: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
};

export type FormSettings = {
  nameLabel: string; namePlaceholder: string;
  phoneLabel: string; phonePlaceholder: string;
  emailLabel: string; emailPlaceholder: string;
  categoryLabel: string; serviceLabel: string;
  locationLabel: string; locationPlaceholder: string;
  dateLabel: string; messageLabel: string; messagePlaceholder: string;
  agreementCheckboxText: string; termsCheckboxText: string;
};

export type ContactPageSettings = {
  id: number;
  formHeading: string;
  formSubheading: string;
  formSettings: FormSettings;
  whatsappHeading: string;
  whatsappDescription: string;
  whatsappButtonLabel: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappEnabled: boolean;
  agreementTitle: string;
  agreementContent: string;
  agreementVersion: string;
  termsTitle: string;
  termsContent: string;
  termsVersion: string;
  successMessage: string;
  failureMessage: string;
  submitButtonLabel: string;
  formActive: boolean;
};

// ==================== Defaults ====================

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  nameLabel: "Name", namePlaceholder: "Full name",
  phoneLabel: "Phone Number", phonePlaceholder: "10-digit mobile",
  emailLabel: "Email", emailPlaceholder: "you@example.com",
  categoryLabel: "Service Category", serviceLabel: "Service Required",
  locationLabel: "Location", locationPlaceholder: "Area / City",
  dateLabel: "Preferred Date",
  messageLabel: "Message", messagePlaceholder: "Tell us about the work...",
  agreementCheckboxText: "I accept the Customer Service Agreement.",
  termsCheckboxText: "I accept the Terms and Conditions.",
};

export const DEFAULT_PAGE_SETTINGS: ContactPageSettings = {
  id: 1,
  formHeading: "Send an Enquiry",
  formSubheading: "Fill in the request details below.",
  formSettings: DEFAULT_FORM_SETTINGS,
  whatsappHeading: "Chat on WhatsApp",
  whatsappDescription: "Get an instant response. Click below and we'll help you book your service in minutes.",
  whatsappButtonLabel: "Chat on WhatsApp",
  whatsappNumber: "919844345088",
  whatsappDefaultMessage: "Hi Smart Solutions Groups, I need help with home/building service. Please contact me.",
  whatsappEnabled: true,
  agreementTitle: "Customer Service Agreement",
  agreementContent: "By submitting this enquiry, you agree to allow Smart Solutions Groups to contact you regarding your service request.",
  agreementVersion: "v1.0",
  termsTitle: "Terms and Conditions",
  termsContent: "All services are provided in accordance with company policies.",
  termsVersion: "v1.0",
  successMessage: "Thank you for contacting us. Our team will get back to you shortly.",
  failureMessage: "We couldn't send your enquiry. Please check your connection and try again.",
  submitButtonLabel: "Submit Enquiry",
  formActive: true,
};

export const DEFAULT_INFO_CARDS: InfoCard[] = [
  {
    id: "phone",
    cardType: "phone",
    title: "Phone",
    label: "Call us anytime",
    content: { numbers: [
      { value: SITE.contact.primary.phone, active: true },
      { value: SITE.contact.phoneAlt, active: true },
      { value: SITE.contact.phoneAlt2, active: true },
    ] },
    icon: "Phone",
    actionUrl: `tel:${SITE.contact.primary.phone}`,
    displayOrder: 1, isActive: true,
  },
  {
    id: "email",
    cardType: "email",
    title: "Email",
    label: "Write to us",
    content: { primary: SITE.contact.email, secondary: "" },
    icon: "Mail",
    actionUrl: `mailto:${SITE.contact.email}`,
    displayOrder: 2, isActive: true,
  },
  {
    id: "support",
    cardType: "support",
    title: "Service Support",
    label: "We serve",
    content: { text: SITE.contact.serviceArea },
    icon: "Building2", actionUrl: null,
    displayOrder: 3, isActive: true,
  },
  {
    id: "address",
    cardType: "address",
    title: "ADDRESS",
    label: "Visit us",
    content: {
      lines: [
        "Bengaluru",
      ],
      maps_url: "https://maps.google.com/?q=Bengaluru",
    },
    icon: "MapPin",
    actionUrl: "https://maps.google.com/?q=Bengaluru",
    displayOrder: 4, isActive: true,
  },
];

// ==================== Row mappers ====================

type SettingsRow = {
  id: number;
  form_heading: string; form_subheading: string;
  form_settings: Partial<FormSettings> | null;
  whatsapp_heading: string; whatsapp_description: string;
  whatsapp_button_label: string; whatsapp_number: string;
  whatsapp_default_message: string; whatsapp_enabled: boolean;
  agreement_title: string; agreement_content: string; agreement_version: string;
  terms_title: string; terms_content: string; terms_version: string;
  success_message: string; failure_message: string;
  submit_button_label: string; form_active: boolean;
};

function fromSettingsRow(r: SettingsRow): ContactPageSettings {
  return {
    id: r.id,
    formHeading: r.form_heading, formSubheading: r.form_subheading,
    formSettings: { ...DEFAULT_FORM_SETTINGS, ...(r.form_settings ?? {}) },
    whatsappHeading: r.whatsapp_heading,
    whatsappDescription: r.whatsapp_description,
    whatsappButtonLabel: r.whatsapp_button_label,
    whatsappNumber: r.whatsapp_number,
    whatsappDefaultMessage: r.whatsapp_default_message,
    whatsappEnabled: r.whatsapp_enabled,
    agreementTitle: r.agreement_title,
    agreementContent: r.agreement_content,
    agreementVersion: r.agreement_version,
    termsTitle: r.terms_title,
    termsContent: r.terms_content,
    termsVersion: r.terms_version,
    successMessage: r.success_message,
    failureMessage: r.failure_message,
    submitButtonLabel: r.submit_button_label,
    formActive: r.form_active,
  };
}

type CardRow = {
  id: string; card_type: InfoCard["cardType"]; title: string; label: string | null;
  content: Record<string, unknown> | null; icon: string | null; action_url: string | null;
  display_order: number; is_active: boolean;
};
function fromCardRow(r: CardRow): InfoCard {
  let content = r.content ?? {};
  let actionUrl = r.action_url;
  if (r.card_type === "address") {
    content = {
      lines: ["Bengaluru"],
      maps_url: "https://maps.google.com/?q=Bengaluru",
    };
    actionUrl = "https://maps.google.com/?q=Bengaluru";
  }
  return {
    id: r.id, cardType: r.card_type, title: r.title, label: r.label,
    content, icon: r.icon, actionUrl,
    displayOrder: r.display_order, isActive: r.is_active,
  };
}

type SocialRow = {
  id: string; platform_name: string; platform_key: string; icon: string; url: string;
  display_order: number; is_active: boolean; open_in_new_tab: boolean;
};
function fromSocialRow(r: SocialRow): ContactSocialLink {
  return {
    id: r.id, platformName: r.platform_name, platformKey: r.platform_key,
    icon: r.icon, url: r.url, displayOrder: r.display_order,
    isActive: r.is_active, openInNewTab: r.open_in_new_tab,
  };
}

// ==================== Read hooks (with instant fallbacks) ====================

// Local mirror so admin edits persist and show on the site even when the
// Supabase tables aren't provisioned yet.
const LS_SETTINGS = "ssg.contact.pageSettings";
const LS_CARDS = "ssg.contact.infoCards";
const LS_SOCIAL = "ssg.contact.socialLinks";

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}
function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

function notifyLocalChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ssg-contact-settings"));
}

export function useContactPageSettings() {
  const [data, setData] = useState<ContactPageSettings>(DEFAULT_PAGE_SETTINGS);
  const [loading, setLoading] = useState(true);
  async function load() {
    const local = readLocal<ContactPageSettings>(LS_SETTINGS);
    if (local) setData({ ...DEFAULT_PAGE_SETTINGS, ...local, formSettings: { ...DEFAULT_FORM_SETTINGS, ...local.formSettings } });
    try {
      const { data: row, error } = await supabase
        .from("contact_page_settings").select("*").eq("id", 1).maybeSingle();
      if (!error && row) setData(fromSettingsRow(row as SettingsRow));
    } catch {/* keep fallback */}
    finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
    const onLocal = () => void load();
    window.addEventListener("ssg-contact-settings", onLocal);
    const ch = supabase.channel("cps").on(
      "postgres_changes" as never,
      { event: "*", schema: "public", table: "contact_page_settings" },
      () => void load(),
    ).subscribe();
    return () => {
      window.removeEventListener("ssg-contact-settings", onLocal);
      try { supabase.removeChannel(ch); } catch { /* noop */ }
    };
  }, []);
  return { settings: data, loading, refresh: load };
}

export function useContactInformationCards() {
  const [cards, setCards] = useState<InfoCard[]>(DEFAULT_INFO_CARDS);
  const [loading, setLoading] = useState(true);
  async function load() {
    const local = readLocal<InfoCard[]>(LS_CARDS);
    if (local?.length) {
      setCards(
        local.map((c) =>
          c.cardType === "address"
            ? {
                ...c,
                content: { lines: ["Bengaluru"], maps_url: "https://maps.google.com/?q=Bengaluru" },
                actionUrl: "https://maps.google.com/?q=Bengaluru",
              }
            : c,
        ),
      );
    }
    try {
      const { data, error } = await supabase
        .from("contact_information_cards").select("*").order("display_order");
      if (!error && Array.isArray(data) && data.length)
        setCards((data as CardRow[]).map(fromCardRow));
    } catch {/* keep fallback */}
    finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
    const onLocal = () => void load();
    window.addEventListener("ssg-contact-settings", onLocal);
    const ch = supabase.channel("cic").on(
      "postgres_changes" as never,
      { event: "*", schema: "public", table: "contact_information_cards" },
      () => void load(),
    ).subscribe();
    return () => {
      window.removeEventListener("ssg-contact-settings", onLocal);
      try { supabase.removeChannel(ch); } catch { /* noop */ }
    };
  }, []);
  return { cards, loading, refresh: load };
}

export function useContactSocialLinks() {
  const [links, setLinks] = useState<ContactSocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    const local = readLocal<ContactSocialLink[]>(LS_SOCIAL);
    if (local?.length) setLinks(local);
    try {
      const { data, error } = await supabase
        .from("contact_social_links").select("*").order("display_order");
      if (!error && Array.isArray(data) && data.length)
        setLinks((data as SocialRow[]).map(fromSocialRow));
    } catch {/* noop */}
    finally { setLoading(false); }
  }
  useEffect(() => {
    void load();
    const onLocal = () => void load();
    window.addEventListener("ssg-contact-settings", onLocal);
    const ch = supabase.channel("csl").on(
      "postgres_changes" as never,
      { event: "*", schema: "public", table: "contact_social_links" },
      () => void load(),
    ).subscribe();
    return () => {
      window.removeEventListener("ssg-contact-settings", onLocal);
      try { supabase.removeChannel(ch); } catch { /* noop */ }
    };
  }, []);
  return { links, loading, refresh: load };
}

// ==================== Writes ====================

export async function saveContactPageSettings(
  patch: Partial<ContactPageSettings>,
): Promise<void> {
  // 1) Always persist locally so the change is instantly reflected everywhere.
  const current = readLocal<ContactPageSettings>(LS_SETTINGS) ?? DEFAULT_PAGE_SETTINGS;
  writeLocal(LS_SETTINGS, { ...current, ...patch });
  notifyLocalChange();

  const row: Record<string, unknown> = { id: 1 };
  if (patch.formHeading !== undefined) row.form_heading = patch.formHeading;
  if (patch.formSubheading !== undefined) row.form_subheading = patch.formSubheading;
  if (patch.formSettings !== undefined) row.form_settings = patch.formSettings;
  if (patch.whatsappHeading !== undefined) row.whatsapp_heading = patch.whatsappHeading;
  if (patch.whatsappDescription !== undefined) row.whatsapp_description = patch.whatsappDescription;
  if (patch.whatsappButtonLabel !== undefined) row.whatsapp_button_label = patch.whatsappButtonLabel;
  if (patch.whatsappNumber !== undefined) row.whatsapp_number = patch.whatsappNumber;
  if (patch.whatsappDefaultMessage !== undefined) row.whatsapp_default_message = patch.whatsappDefaultMessage;
  if (patch.whatsappEnabled !== undefined) row.whatsapp_enabled = patch.whatsappEnabled;
  if (patch.agreementTitle !== undefined) row.agreement_title = patch.agreementTitle;
  if (patch.agreementContent !== undefined) row.agreement_content = patch.agreementContent;
  if (patch.agreementVersion !== undefined) row.agreement_version = patch.agreementVersion;
  if (patch.termsTitle !== undefined) row.terms_title = patch.termsTitle;
  if (patch.termsContent !== undefined) row.terms_content = patch.termsContent;
  if (patch.termsVersion !== undefined) row.terms_version = patch.termsVersion;
  if (patch.successMessage !== undefined) row.success_message = patch.successMessage;
  if (patch.failureMessage !== undefined) row.failure_message = patch.failureMessage;
  if (patch.submitButtonLabel !== undefined) row.submit_button_label = patch.submitButtonLabel;
  if (patch.formActive !== undefined) row.form_active = patch.formActive;
  row.updated_at = new Date().toISOString();
  try {
    await supabase.from("contact_page_settings").upsert(row, { onConflict: "id" });
  } catch { /* saved locally */ }
}

export async function upsertInfoCard(card: Partial<InfoCard> & { cardType: InfoCard["cardType"] }): Promise<void> {
  // Local mirror first — guarantees the save sticks in the UI.
  const localCards = readLocal<InfoCard[]>(LS_CARDS) ?? DEFAULT_INFO_CARDS;
  const merged = localCards.some((c) => c.cardType === card.cardType)
    ? localCards.map((c) => (c.cardType === card.cardType ? ({ ...c, ...card } as InfoCard) : c))
    : [...localCards, { ...(card as InfoCard) }];
  writeLocal(LS_CARDS, merged);
  notifyLocalChange();

  const row: Record<string, unknown> = {
    card_type: card.cardType,
    title: card.title,
    label: card.label,
    content: card.content,
    icon: card.icon,
    action_url: card.actionUrl,
    display_order: card.displayOrder,
    is_active: card.isActive,
    updated_at: new Date().toISOString(),
  };
  try {
    const isUuid = !!card.id && !/^(phone|email|support|address)$/.test(card.id);
    if (isUuid) {
      await supabase.from("contact_information_cards").update(row).eq("id", card.id!);
    } else {
      // No local uuid: update the existing row for this card type, else insert.
      const { data: existing } = await supabase
        .from("contact_information_cards").select("id").eq("card_type", card.cardType).maybeSingle();
      if (existing?.id) await supabase.from("contact_information_cards").update(row).eq("id", existing.id);
      else await supabase.from("contact_information_cards").insert(row);
    }
  } catch { /* saved locally */ }
}

export async function upsertContactSocialLink(link: Partial<ContactSocialLink>): Promise<void> {
  const localLinks = readLocal<ContactSocialLink[]>(LS_SOCIAL) ?? [];
  const id = link.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nextLocal = localLinks.some((l) => l.id === id)
    ? localLinks.map((l) => (l.id === id ? ({ ...l, ...link, id } as ContactSocialLink) : l))
    : [...localLinks, { ...(link as ContactSocialLink), id }];
  writeLocal(LS_SOCIAL, nextLocal);
  notifyLocalChange();

  const row: Record<string, unknown> = {
    platform_name: link.platformName,
    platform_key: link.platformKey,
    icon: link.icon,
    url: link.url,
    display_order: link.displayOrder,
    is_active: link.isActive,
    open_in_new_tab: link.openInNewTab,
    updated_at: new Date().toISOString(),
  };
  if (link.id && !link.id.startsWith("local-")) row.id = link.id;
  try {
    await supabase.from("contact_social_links").upsert(row);
  } catch { /* saved locally */ }
}

export async function deleteContactSocialLink(id: string): Promise<void> {
  const localLinks = readLocal<ContactSocialLink[]>(LS_SOCIAL) ?? [];
  writeLocal(LS_SOCIAL, localLinks.filter((l) => l.id !== id));
  notifyLocalChange();
  try { await supabase.from("contact_social_links").delete().eq("id", id); } catch { /* noop */ }
}