import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "ssg_admin_enquiries_v1";
const EVENT = "ssg-enquiries-change";
let memoryFallback: Enquiry[] = [];

export const ENQUIRY_STATUSES = ["New", "Contacted", "In Progress", "Completed", "Rejected"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type EnquiryNote = { id: string; text: string; createdAt: string };

export type EnquiryAgreement = {
  acceptedVia: "Mobile OTP Verification";
  otpStatus: "Verified";
  termsAccepted: true;
  acceptedAt: string;
  otpVerifiedAt: string;
};

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  service: string;
  location: string;
  preferredDate: string;
  message: string;
  source: string;
  status: EnquiryStatus;
  notes: EnquiryNote[];
  createdAt: string;
  agreement?: EnquiryAgreement;
  customerId?: string;
  agentId?: string;
  assignedAt?: string;
  _dbId?: string;
};

export function dbStatusToEnquiry(dbStatus: string | null | undefined): EnquiryStatus {
  const s = String(dbStatus || "").toLowerCase();
  if (s === "in_progress" || s === "in progress") return "In Progress";
  if (s === "contacted") return "Contacted";
  if (s === "resolved" || s === "completed") return "Completed";
  if (s === "closed" || s === "rejected") return "Rejected";
  return "New";
}

export function enquiryStatusToDb(s: EnquiryStatus): string {
  if (s === "In Progress") return "in_progress";
  if (s === "Contacted") return "contacted";
  if (s === "Completed") return "resolved";
  if (s === "Rejected") return "closed";
  return "new";
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
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

function read(): Enquiry[] {
  if (typeof window === "undefined") return memoryFallback;
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? (JSON.parse(raw) as Enquiry[]) : [];
    memoryFallback = rows;
    return rows;
  } catch {
    return memoryFallback;
  }
}

function write(list: Enquiry[]) {
  memoryFallback = list;
  if (typeof window === "undefined") return;
  const compact = (rows: Enquiry[]) =>
    rows.map((e) => ({
      ...e,
      message: (e.message ?? "").slice(0, 500),
      notes: (e.notes ?? []).slice(-5),
    }));
  const attempts = [list, list.slice(0, 100), compact(list.slice(0, 50)), compact(list.slice(0, 20))];
  let saved = false;
  for (const rows of attempts) {
    try {
      localStorage.setItem(KEY, JSON.stringify(rows));
      memoryFallback = rows;
      saved = true;
      break;
    } catch {
      saved = false;
    }
  }
  if (!saved) console.warn("[enquiries] Browser storage is full; enquiry kept in memory and backend sync was attempted.");
  window.dispatchEvent(new Event(EVENT));
}

function seed(): Enquiry[] {
  const now = Date.now();
  const mk = (i: number, p: Partial<Enquiry>): Enquiry => ({
    id: `ENQ-${1040 + i}`,
    name: "",
    phone: "",
    email: "",
    category: "",
    service: "",
    location: "",
    preferredDate: "",
    message: "",
    source: "Seed",
    status: "New",
    notes: [],
    createdAt: new Date(now - i * 86400000).toISOString(),
    ...p,
  });
  return [
    mk(0, { name: "Ramesh K", phone: "9845012345", email: "ramesh@gmail.com", category: "Electrical Services", service: "AC Servicing", location: "Whitefield", status: "New" }),
    mk(1, { name: "Priya S", phone: "9742098765", email: "priya@gmail.com", category: "Cleaning Services", service: "Deep Home Cleaning", location: "HSR Layout", status: "New" }),
    mk(2, { name: "Anil M", phone: "9900123456", email: "anil@gmail.com", category: "Plumbing Services", service: "Plumbing Repairs", location: "Jayanagar", status: "Contacted" }),
    mk(3, { name: "Deepa R", phone: "9886011223", email: "deepa@gmail.com", category: "Interior Services", service: "POP False Ceiling", location: "Indiranagar", status: "In Progress" }),
    mk(4, { name: "Mahesh G", phone: "9740099887", email: "mahesh@gmail.com", category: "Security Services", service: "CCTV Installation", location: "Koramangala", status: "Completed" }),
  ];
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  try {
    if (!localStorage.getItem(KEY) && memoryFallback.length === 0) write(seed());
  } catch {
    if (memoryFallback.length === 0) memoryFallback = seed();
  }
}

export function getEnquiries(): Enquiry[] {
  ensureSeeded();
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function parseAdminNotes(adminNotesRaw: string | null | undefined): {
  notes: EnquiryNote[];
  metadata: {
    clientEnquiryId?: string;
    category?: string;
    service?: string;
    location?: string;
    preferredDate?: string;
    source?: string;
    agreement?: EnquiryAgreement;
    customerId?: string;
    agentId?: string;
    assignedAt?: string;
    notes?: EnquiryNote[];
  };
} {
  if (!adminNotesRaw) return { notes: [], metadata: {} };
  try {
    const parsed = JSON.parse(adminNotesRaw);
    if (parsed && typeof parsed === "object") {
      const notes: EnquiryNote[] = Array.isArray(parsed.notes)
        ? parsed.notes
        : typeof parsed.customNote === "string" && parsed.customNote
          ? [{ id: "n-1", text: parsed.customNote, createdAt: new Date().toISOString() }]
          : [];
      return { notes, metadata: parsed };
    }
  } catch {
    return {
      notes: [{ id: "n-raw", text: adminNotesRaw, createdAt: new Date().toISOString() }],
      metadata: {},
    };
  }
  return { notes: [], metadata: {} };
}

function contactRowToEnquiry(row: {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at?: string;
}): Enquiry {
  const { notes, metadata } = parseAdminNotes(row.admin_notes);
  let category = metadata.category || "";
  let service = metadata.service || "";
  let location = metadata.location || "";
  let preferredDate = metadata.preferredDate || "";

  if ((!category || !service) && row.subject) {
    const parts = row.subject.split("—").map((s) => s.trim());
    if (parts.length >= 2) {
      if (!category) category = parts[0];
      if (!service) service = parts[1];
    } else if (!service) {
      service = row.subject;
    }
  }

  if (!location && row.subject && row.subject.includes("(") && row.subject.includes(")")) {
    const match = row.subject.match(/\(([^)]+)\)/);
    if (match) location = match[1].trim();
  }

  return {
    id: metadata.clientEnquiryId || `ENQ-${row.id.slice(0, 8).toUpperCase()}`,
    name: row.full_name || "Website Customer",
    phone: row.phone || "",
    email: row.email || "",
    category: category || "General Services",
    service: service || "General Enquiry",
    location: location || "",
    preferredDate: preferredDate || "",
    message: row.message || "",
    source: metadata.source || "Website",
    status: dbStatusToEnquiry(row.status),
    notes: notes.length > 0 ? notes : metadata.notes || [],
    createdAt: row.created_at || new Date().toISOString(),
    agreement: metadata.agreement,
    customerId: metadata.customerId,
    agentId: metadata.agentId,
    assignedAt: metadata.assignedAt,
    _dbId: row.id,
  };
}

let syncPromise: Promise<Enquiry[]> | null = null;

export async function syncBackendEnquiries(): Promise<Enquiry[]> {
  if (syncPromise) return syncPromise;
  syncPromise = (async () => {
    try {
      const remoteList: Enquiry[] = [];

      // 1. Primary: read from contact_enquiries (RLS allowed for anon/authenticated)
      try {
        const { data: contactData, error: contactError } = await supabase
          .from("contact_enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!contactError && Array.isArray(contactData)) {
          for (const r of contactData) {
            remoteList.push(contactRowToEnquiry(r));
          }
        }
      } catch (err) {
        console.warn("[enquiries] contact_enquiries read warning:", err);
      }

      // 2. Secondary: read from legacy enquiries table if accessible
      try {
        const { data: legacyData, error: legacyError } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!legacyError && Array.isArray(legacyData)) {
          for (const r of legacyData) {
            if (!remoteList.some((existing) => existing.id === r.id || existing._dbId === r.id)) {
              remoteList.push({
                id: String(r.id || `ENQ-${Date.now().toString().slice(-6)}`),
                name: r.name || "Website Customer",
                phone: r.phone || "",
                email: r.email || "",
                category: r.category || "",
                service: r.service || "General Enquiry",
                location: r.location || "",
                preferredDate: r.preferred_date || "",
                message: r.message || "",
                source: r.source || "Website",
                status: dbStatusToEnquiry(r.status),
                notes: [],
                createdAt: r.created_at || new Date().toISOString(),
                _dbId: String(r.id),
              });
            }
          }
        }
      } catch {
        // Ignored
      }

      const local = read();
      const mergedMap = new Map<string, Enquiry>();

      // Remote enquiries from database are source of truth
      for (const item of remoteList) {
        mergedMap.set(item.id, item);
      }

      // If remote database has actual enquiries, drop fake seed records
      const hasRealRemote = remoteList.length > 0;

      for (const loc of local) {
        if (hasRealRemote && loc.source === "Seed") {
          continue;
        }
        if (!mergedMap.has(loc.id)) {
          const duplicate = remoteList.some(
            (r) =>
              (loc._dbId && r._dbId === loc._dbId) ||
              (r.phone &&
                loc.phone &&
                r.phone.replace(/\D/g, "").slice(-10) === loc.phone.replace(/\D/g, "").slice(-10) &&
                Math.abs(new Date(r.createdAt).getTime() - new Date(loc.createdAt).getTime()) < 60000),
          );
          if (!duplicate) {
            mergedMap.set(loc.id, loc);
          }
        }
      }

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      write(merged);
      return merged;
    } catch (err) {
      console.warn("[enquiries] syncBackendEnquiries error:", err);
      return read();
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

export type EnquiryInput = Omit<Enquiry, "id" | "status" | "notes" | "createdAt"> & {
  status?: EnquiryStatus;
  syncBackend?: boolean;
};

export function addEnquiry(input: EnquiryInput): Enquiry {
  if (!input.phone || !input.phone.trim()) {
    throw new Error("Phone number is mandatory for submitting an enquiry.");
  }
  ensureSeeded();
  const list = read();
  const { syncBackend = true, ...enquiryInput } = input;
  const createdId = `ENQ-${Date.now().toString().slice(-6)}-${uid().slice(0, 3).toUpperCase()}`;
  const created: Enquiry = {
    id: createdId,
    status: enquiryInput.status ?? "New",
    notes: [],
    createdAt: new Date().toISOString(),
    ...enquiryInput,
  };

  // Remove fake seed entries when real user submits
  const cleanList = list.filter((e) => e.source !== "Seed");
  cleanList.unshift(created);
  write(cleanList);

  if (syncBackend) {
    const metadata = {
      clientEnquiryId: created.id,
      category: created.category,
      service: created.service,
      location: created.location,
      preferredDate: created.preferredDate,
      source: created.source || "Website",
      agreement: created.agreement,
      customerId: created.customerId,
      agentId: created.agentId,
      assignedAt: created.assignedAt,
      notes: created.notes,
    };

    const subject = [created.category, created.service].filter(Boolean).join(" — ") || created.source || "Service Enquiry";
    const dbStatus = enquiryStatusToDb(created.status);

    // 1. Insert into contact_enquiries (open RLS, Realtime enabled)
    void supabase
      .from("contact_enquiries")
      .insert({
        full_name: created.name || "Customer",
        phone: created.phone,
        email: created.email || null,
        subject: subject,
        message: created.message || `Service enquiry for ${subject}`,
        status: dbStatus,
        admin_notes: JSON.stringify(metadata),
      })
      .select("id")
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("[supabase] contact_enquiries insert failed:", getErrorMessage(error));
        } else if (data?.id) {
          const cur = read();
          const item = cur.find((e) => e.id === created.id);
          if (item) {
            item._dbId = data.id;
            write(cur);
          }
        }
      })
      .catch((err) => console.error("[supabase] contact_enquiries insert threw:", getErrorMessage(err)));

    // 2. Also try inserting into legacy enquiries table
    void supabase
      .from("enquiries")
      .insert({
        name: created.name,
        phone: created.phone,
        email: created.email || null,
        category: created.category || null,
        service: created.service || null,
        location: created.location || null,
        preferred_date: created.preferredDate || null,
        message: created.message || null,
        source: created.source || "Website",
        status: created.status,
      })
      .then(() => {})
      .catch(() => {});
  }

  return created;
}

export function updateEnquiry(id: string, patch: Partial<Enquiry>) {
  const list = read();
  const i = list.findIndex((e) => e.id === id || e._dbId === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  write(list);

  const item = list[i];
  const targetDbId = item._dbId || (item.id.length >= 32 ? item.id : undefined);
  const dbStatus = item.status ? enquiryStatusToDb(item.status) : undefined;
  const metadata = {
    clientEnquiryId: item.id,
    category: item.category,
    service: item.service,
    location: item.location,
    preferredDate: item.preferredDate,
    source: item.source,
    agreement: item.agreement,
    customerId: item.customerId,
    agentId: item.agentId,
    assignedAt: item.assignedAt,
    notes: item.notes,
  };

  if (targetDbId) {
    void supabase
      .from("contact_enquiries")
      .update({
        ...(dbStatus ? { status: dbStatus } : {}),
        full_name: item.name,
        phone: item.phone,
        email: item.email || null,
        admin_notes: JSON.stringify(metadata),
      })
      .eq("id", targetDbId)
      .then(({ error }) => {
        if (error) console.warn("[supabase] contact_enquiries update failed:", error.message);
      })
      .catch(() => {});

    void supabase
      .from("enquiries")
      .update({
        ...(item.status ? { status: item.status } : {}),
        name: item.name,
        phone: item.phone,
        email: item.email || null,
      })
      .eq("id", targetDbId)
      .then(() => {})
      .catch(() => {});
  } else {
    // If dbId not yet resolved, update by phone match
    void supabase
      .from("contact_enquiries")
      .update({
        ...(dbStatus ? { status: dbStatus } : {}),
        admin_notes: JSON.stringify(metadata),
      })
      .eq("phone", item.phone)
      .then(() => {})
      .catch(() => {});
  }
}

export function assignEnquiryToAgent(id: string, agentId: string | undefined) {
  const list = read();
  const i = list.findIndex((e) => e.id === id || e._dbId === id);
  if (i < 0) return;
  const patch: Partial<Enquiry> = {
    agentId,
    assignedAt: agentId ? new Date().toISOString() : undefined,
    status: agentId && list[i].status === "New" ? "In Progress" : list[i].status,
  };
  list[i] = { ...list[i], ...patch };
  write(list);
  updateEnquiry(id, patch);
}

export function addNote(id: string, text: string) {
  const list = read();
  const i = list.findIndex((e) => e.id === id || e._dbId === id);
  if (i < 0) return;
  const newNotes = [...(list[i].notes ?? []), { id: uid(), text, createdAt: new Date().toISOString() }];
  list[i].notes = newNotes;
  write(list);
  updateEnquiry(id, { notes: newNotes });
}

export function deleteEnquiry(id: string) {
  const list = read();
  const item = list.find((e) => e.id === id || e._dbId === id);
  const targetDbId = item?._dbId || (id.length >= 32 ? id : undefined);

  write(list.filter((e) => e.id !== id && e._dbId !== id));

  if (targetDbId) {
    void supabase
      .from("contact_enquiries")
      .delete()
      .eq("id", targetDbId)
      .then(({ error }) => {
        if (error) console.warn("[supabase] delete contact_enquiries failed:", error.message);
      })
      .catch(() => {});

    void supabase
      .from("enquiries")
      .delete()
      .eq("id", targetDbId)
      .then(() => {})
      .catch(() => {});
  }
}

export function enquiriesToCSV(rows: Enquiry[]): string {
  const headers = [
    "ID",
    "Name",
    "Phone",
    "Email",
    "Category",
    "Service",
    "Location",
    "Preferred Date",
    "Status",
    "Source",
    "Submitted",
    "Message",
    "Notes",
  ];
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.phone,
      r.email,
      r.category,
      r.service,
      r.location,
      r.preferredDate,
      r.status,
      r.source,
      r.createdAt,
      r.message,
      r.notes.map((n) => n.text).join(" | "),
    ]
      .map(esc)
      .join(","),
  );
  return [headers.map(esc).join(","), ...lines].join("\n");
}

export function downloadEnquiriesCSV(rows: Enquiry[]) {
  const blob = new Blob([enquiriesToCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function useEnquiriesStore() {
  const [snap, setSnap] = useState<{
    enquiries: Enquiry[];
    loading: boolean;
    refresh: () => Promise<Enquiry[]>;
  }>({
    enquiries: getEnquiries(),
    loading: false,
    refresh: syncBackendEnquiries,
  });

  useEffect(() => {
    let mounted = true;
    const update = () => {
      if (!mounted) return;
      setSnap((prev) => ({ ...prev, enquiries: getEnquiries() }));
    };

    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);

    // Initial background sync from Supabase
    setSnap((prev) => ({ ...prev, loading: true }));
    void syncBackendEnquiries().finally(() => {
      if (mounted) {
        setSnap((prev) => ({ ...prev, enquiries: getEnquiries(), loading: false }));
      }
    });

    // Realtime channel for live updates across ALL browsers & devices!
    const channel = supabase
      .channel("ssg_realtime_all_enquiries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_enquiries" },
        () => {
          void syncBackendEnquiries();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => {
          void syncBackendEnquiries();
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
      void supabase.removeChannel(channel);
    };
  }, []);

  return snap;
}