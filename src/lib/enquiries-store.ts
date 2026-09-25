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
};

export function assignEnquiryToAgent(id: string, agentId: string | undefined) {
  const list = read();
  const i = list.findIndex((e) => e.id === id);
  if (i < 0) return;
  list[i] = {
    ...list[i],
    agentId,
    assignedAt: agentId ? new Date().toISOString() : undefined,
    status: agentId && list[i].status === "New" ? "In Progress" : list[i].status,
  };
  write(list);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
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
  const compact = (rows: Enquiry[]) => rows.map((e) => ({
    ...e,
    message: (e.message ?? "").slice(0, 500),
    notes: (e.notes ?? []).slice(-3),
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

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Unknown error";
}

export function getEnquiries(): Enquiry[] {
  ensureSeeded();
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
  const created: Enquiry = {
    id: `ENQ-${Date.now().toString().slice(-6)}-${uid().slice(0, 3).toUpperCase()}`,
    status: enquiryInput.status ?? "New",
    notes: [],
    createdAt: new Date().toISOString(),
    ...enquiryInput,
  };
  list.unshift(created);
  write(list);
  // Fire-and-forget insert into Supabase. Non-blocking; local UI still works if it fails.
  if (syncBackend) try {
    const insertPromise = supabase.from("enquiries").insert({
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
      });
    void Promise.resolve(insertPromise)
      .then(({ error }) => {
        if (error) console.error("[supabase] enquiry insert failed:", getErrorMessage(error));
      })
      .catch((error: unknown) => console.error("[supabase] enquiry insert threw:", getErrorMessage(error)));
  } catch (error) {
    console.error("[supabase] enquiry insert could not start:", getErrorMessage(error));
  }
  return created;
}

export function updateEnquiry(id: string, patch: Partial<Enquiry>) {
  const list = read();
  const i = list.findIndex((e) => e.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  write(list);
}

export function addNote(id: string, text: string) {
  const list = read();
  const i = list.findIndex((e) => e.id === id);
  if (i < 0) return;
  list[i].notes = [...(list[i].notes ?? []), { id: uid(), text, createdAt: new Date().toISOString() }];
  write(list);
}

export function deleteEnquiry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function enquiriesToCSV(rows: Enquiry[]): string {
  const headers = ["ID", "Name", "Phone", "Email", "Category", "Service", "Location", "Preferred Date", "Status", "Source", "Submitted", "Message", "Notes"];
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.id, r.name, r.phone, r.email, r.category, r.service, r.location, r.preferredDate, r.status, r.source, r.createdAt, r.message, r.notes.map((n) => n.text).join(" | ")]
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
  const [snap, setSnap] = useState<{ enquiries: ReturnType<typeof getEnquiries> }>({ enquiries: [] });
  useEffect(() => {
    const update = () => setSnap({ enquiries: getEnquiries() });
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return snap;
}