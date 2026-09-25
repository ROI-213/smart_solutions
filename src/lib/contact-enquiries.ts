import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addEnquiry, deleteEnquiry as deleteLocalEnquiry, getEnquiries, updateEnquiry, type Enquiry, type EnquiryStatus } from "@/lib/enquiries-store";

export const CONTACT_STATUSES = ["New", "In Progress", "Contacted", "Resolved", "Closed"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

const STATUS_TO_DB: Record<ContactStatus, string> = {
  New: "new",
  "In Progress": "in_progress",
  Contacted: "contacted",
  Resolved: "resolved",
  Closed: "closed",
};
const DB_TO_STATUS: Record<string, ContactStatus> = {
  new: "New",
  in_progress: "In Progress",
  contacted: "Contacted",
  resolved: "Resolved",
  closed: "Closed",
};

export type ContactEnquiry = {
  id: string;
  sourceTable: "contact_enquiries" | "enquiries";
  fullName: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

type LegacyRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  category: string | null;
  service: string | null;
  location: string | null;
  preferred_date: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function fromRow(r: Row): ContactEnquiry {
  return {
    id: r.id,
    sourceTable: "contact_enquiries",
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    subject: r.subject,
    message: r.message,
    status: DB_TO_STATUS[r.status] ?? "New",
    adminNotes: r.admin_notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fromLegacyRow(r: LegacyRow): ContactEnquiry {
  const subject = [r.category, r.service].filter(Boolean).join(" — ") || r.source || "General Enquiry";
  return {
    id: r.id,
    sourceTable: "enquiries",
    fullName: r.name || "Website Customer",
    phone: r.phone || "",
    email: r.email,
    subject,
    message: r.message || "—",
    status: DB_TO_STATUS[String(r.status || "").toLowerCase()] ?? legacyStatusToContact(r.status),
    adminNotes: null,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
  };
}

function legacyStatusToContact(status: string | null): ContactStatus {
  if (status === "In Progress") return "In Progress";
  if (status === "Contacted") return "Contacted";
  if (status === "Completed") return "Resolved";
  if (status === "Rejected") return "Closed";
  return "New";
}

function contactStatusToLegacy(status: ContactStatus): EnquiryStatus {
  if (status === "Resolved") return "Completed";
  if (status === "Closed") return "Rejected";
  return status;
}

function fromLocalEnquiry(e: Enquiry): ContactEnquiry {
  return {
    id: e.id,
    sourceTable: "enquiries",
    fullName: e.name || "Website Customer",
    phone: e.phone,
    email: e.email || null,
    subject: [e.category, e.service].filter(Boolean).join(" — ") || e.source || "General Enquiry",
    message: e.message || "—",
    status: legacyStatusToContact(e.status),
    adminNotes: e.notes?.map((n) => n.text).join("\n") || null,
    createdAt: e.createdAt,
    updatedAt: e.createdAt,
  };
}

function saveLocalEnquiry(input: ContactInput): ContactEnquiry {
  return fromLocalEnquiry(addEnquiry({
    name: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || "",
    category: input.category?.trim() || "",
    service: input.service?.trim() || "",
    location: input.location?.trim() || "",
    preferredDate: input.preferredDate || "",
    message: input.message.trim(),
    source: "Contact Us",
    syncBackend: false,
  }));
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Unknown error";
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return e.code === "PGRST205" || e.code === "42P01" || /Could not find the table|schema cache|does not exist/i.test(e.message ?? "");
}

function isBlockedWriteError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return e.code === "42501" || /row-level security|permission denied/i.test(e.message ?? "");
}

function isRecoverableBackendError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    isMissingTableError(error) ||
    isBlockedWriteError(error) ||
    /Supabase env vars missing|Failed to fetch|NetworkError|Load failed|JWT|column .* does not exist|Could not find .* column/i.test(message)
  );
}

function warnBackendFallback(context: string, error: unknown) {
  // eslint-disable-next-line no-console
  console.warn(`[contact-enquiries] ${context}; using fallback.`, getErrorMessage(error));
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function contactFingerprint(enquiry: Pick<ContactEnquiry, "phone" | "subject" | "message">): string {
  return [
    enquiry.phone.replace(/\D/g, "").slice(-10),
    normalizeText(enquiry.subject),
    normalizeText(enquiry.message).slice(0, 160),
  ].join("|");
}

function isNearDuplicate(a: ContactEnquiry, b: ContactEnquiry): boolean {
  if (contactFingerprint(a) !== contactFingerprint(b)) return false;
  const aTime = Date.parse(a.createdAt);
  const bTime = Date.parse(b.createdAt);
  if (Number.isNaN(aTime) || Number.isNaN(bTime)) return true;
  return Math.abs(aTime - bTime) <= 10 * 60 * 1000;
}

export type ContactInput = {
  fullName: string;
  phone: string;
  email?: string;
  subject?: string;
  category?: string;
  service?: string;
  location?: string;
  preferredDate?: string;
  message: string;
};

export async function submitContactEnquiry(input: ContactInput): Promise<ContactEnquiry> {
  const phone = input.phone?.trim();
  if (!phone) {
    throw new Error("Phone number is mandatory for submitting an enquiry.");
  }
  const payload = {
    full_name: input.fullName.trim(),
    phone,
    email: input.email?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
    status: "new",
  };
  try {
    const { data, error } = await supabase
      .from("contact_enquiries")
      .insert(payload)
      .select()
      .single();
    if (error) {
      if (isRecoverableBackendError(error)) {
        warnBackendFallback("primary table insert failed", error);
        return submitLegacyEnquiry(input);
      }
      throw error;
    }
    return fromRow(data as Row);
  } catch (error) {
    if (isRecoverableBackendError(error)) {
      warnBackendFallback("primary table insert threw", error);
      return submitLegacyEnquiry(input);
    }
    throw error;
  }
}

async function submitLegacyEnquiry(input: ContactInput): Promise<ContactEnquiry> {
  const insertPayload = {
    name: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    category: input.category?.trim() || null,
    service: input.service?.trim() || null,
    location: input.location?.trim() || null,
    preferred_date: input.preferredDate || null,
    message: input.message.trim(),
    source: "Contact Us",
    status: "New",
  };

  const { error } = await supabase.from("enquiries").insert(insertPayload);
  if (error) {
    if (isRecoverableBackendError(error)) {
      warnBackendFallback("legacy table insert failed", error);
      return saveLocalEnquiry(input);
    }
    throw error;
  }
  return saveLocalEnquiry(input);
}

export async function listContactEnquiries(): Promise<ContactEnquiry[]> {
  const all: ContactEnquiry[] = [];
  const { data, error } = await supabase
    .from("contact_enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) warnBackendFallback("primary table read failed", error);
  if (!error) all.push(...((data as Row[] | null)?.map(fromRow) ?? []));

  const { data: legacyData, error: legacyError } = await supabase
    .from("enquiries")
    .select("id,name,phone,email,category,service,location,preferred_date,message,source,status,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (!legacyError) all.push(...((legacyData as LegacyRow[] | null)?.map(fromLegacyRow) ?? []));
  else warnBackendFallback("legacy table read failed", legacyError);

  const seen = new Set(all.map((e) => e.id));
  for (const local of getEnquiries().map(fromLocalEnquiry)) {
    if (!seen.has(local.id) && !all.some((remote) => isNearDuplicate(remote, local))) all.push(local);
  }

  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateContactEnquiry(
  id: string,
  patch: {
    status?: ContactStatus;
    adminNotes?: string | null;
    fullName?: string;
    phone?: string;
    email?: string | null;
    subject?: string | null;
    message?: string;
  },
  sourceTable: ContactEnquiry["sourceTable"] = "contact_enquiries",
): Promise<void> {
  if (sourceTable === "enquiries") {
    const local = getEnquiries().find((e) => e.id === id);
    if (local) {
      const localPatch: Partial<Enquiry> = {};
      if (patch.status !== undefined) localPatch.status = contactStatusToLegacy(patch.status);
      if (patch.fullName !== undefined) localPatch.name = patch.fullName;
      if (patch.phone !== undefined) localPatch.phone = patch.phone;
      if (patch.email !== undefined) localPatch.email = patch.email ?? "";
      if (patch.message !== undefined) localPatch.message = patch.message;
      if (patch.adminNotes !== undefined) {
        localPatch.notes = patch.adminNotes
          ? [{ id: `NOTE-${Date.now()}`, text: patch.adminNotes, createdAt: new Date().toISOString() }]
          : [];
      }
      updateEnquiry(id, localPatch);
      return;
    }
    const update: Record<string, unknown> = {};
    if (patch.status !== undefined) update.status = contactStatusToLegacy(patch.status);
    if (patch.fullName !== undefined) update.name = patch.fullName;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (patch.email !== undefined) update.email = patch.email;
    if (patch.message !== undefined) update.message = patch.message;
    if (Object.keys(update).length === 0) return;
    const { error } = await supabase.from("enquiries").update(update).eq("id", id);
    if (error) throw error;
    return;
  }
  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) update.status = STATUS_TO_DB[patch.status];
  if (patch.adminNotes !== undefined) update.admin_notes = patch.adminNotes;
  if (patch.fullName !== undefined) update.full_name = patch.fullName;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.subject !== undefined) update.subject = patch.subject;
  if (patch.message !== undefined) update.message = patch.message;
  const { error } = await supabase.from("contact_enquiries").update(update).eq("id", id);
  if (!error) return;
  if (!isMissingTableError(error)) throw error;
  await updateContactEnquiry(id, patch, "enquiries");
}

export async function deleteContactEnquiry(id: string, sourceTable: ContactEnquiry["sourceTable"] = "contact_enquiries"): Promise<void> {
  if (sourceTable === "enquiries" && getEnquiries().some((e) => e.id === id)) {
    deleteLocalEnquiry(id);
    return;
  }
  const { error } = await supabase.from(sourceTable).delete().eq("id", id);
  if (!error) return;
  if (sourceTable === "contact_enquiries" && isMissingTableError(error)) {
    await deleteContactEnquiry(id, "enquiries");
    return;
  }
  throw error;
}

export function useContactEnquiries() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const rows = await listContactEnquiries();
      setEnquiries(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await refresh(); })();
    const channel = supabase
      .channel("contact_enquiries_changes")
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "contact_enquiries" },
        () => { void refresh(); },
      )
      .subscribe();
    return () => {
      cancelled = true;
      try { supabase.removeChannel(channel); } catch { /* noop */ }
    };
  }, []);

  return { enquiries, loading, error, refresh };
}

// Lightweight new-count hook for sidebar badge.
export function useNewContactCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { count: c, error } = await supabase
        .from("contact_enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      const { count: legacyCount } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "New");
      if (!cancelled) setCount((error && !isMissingTableError(error) ? 0 : c ?? 0) + (legacyCount ?? 0));
    }
    void load();
    const channel = supabase
      .channel("contact_enquiries_count")
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "contact_enquiries" },
        () => { void load(); },
      )
      .subscribe();
    return () => {
      cancelled = true;
      try { supabase.removeChannel(channel); } catch { /* noop */ }
    };
  }, []);
  return count;
}

// ---- Validation helpers ----

const INDIAN_PHONE = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactValidationErrors = Partial<Record<"fullName" | "phone" | "email" | "message", string>>;

export function validateContactInput(input: ContactInput): ContactValidationErrors {
  const errors: ContactValidationErrors = {};
  if (!input.fullName.trim()) errors.fullName = "Full name is required.";
  const phone = input.phone.replace(/[\s-]/g, "");
  if (!phone) errors.phone = "Phone number is required.";
  else if (!INDIAN_PHONE.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (input.email && input.email.trim() && !EMAIL_RE.test(input.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!input.message.trim()) errors.message = "Please describe your requirement.";
  return errors;
}