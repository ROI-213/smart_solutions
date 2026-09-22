import { supabase } from "@/integrations/supabase/client";

export type CandidateType = "fresher" | "experienced";

export const DEFAULT_POSITIONS = [
  "Customer Support Executive",
  "Field Executive",
  "Service Coordinator",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Interior Site Supervisor",
  "Cleaning Professional",
  "Pest Control Technician",
  "CCTV Technician",
  "Sales Executive",
  "Digital Marketing Executive",
  "Office Administrator",
  "Other",
];

export const DEFAULT_LOCATIONS = [
  "Bengaluru — Central",
  "Bengaluru — North",
  "Bengaluru — South",
  "Bengaluru — East",
  "Bengaluru — West",
  "Whitefield",
  "Electronic City",
  "Other",
];

export const EMPLOYMENT_TYPES = ["Full-Time", "Part-Time", "Field Executive"];

export const QUALIFICATIONS = [
  "10th Standard",
  "12th Standard / PUC",
  "ITI",
  "Diploma",
  "Undergraduate Degree",
  "Postgraduate Degree",
  "Professional Certification",
  "Other",
];

export const LANGUAGES = ["English", "Kannada", "Hindi", "Tamil", "Telugu", "Malayalam"];

export const NOTICE_PERIODS = [
  "Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days", "Other",
];

export const APPLICATION_STATUSES = [
  "New", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "On Hold",
] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export const CAREER_BUCKET = "career-documents";
const LOCAL_APPLICATIONS_KEY = "ssg_career_applications_v1";
const LOCAL_APPLICATIONS_EVENT = "ssg-career-applications-change";

export function getCareerErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const key of ["message", "error_description", "details", "hint", "name"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    try {
      const json = JSON.stringify(record, (_key, value) => {
        if (typeof File !== "undefined" && value instanceof File) {
          return { name: value.name, size: value.size, type: value.type };
        }
        if (typeof Blob !== "undefined" && value instanceof Blob) {
          return { size: value.size, type: value.type };
        }
        return value;
      });
      if (json && json !== "{}") return json;
    } catch {
      // Some SDK/proxy errors cannot be stringified safely.
    }
  }
  return fallback;
}

export function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `SS-CAR-${year}-${rand}`;
}

export type UploadedFile = { field: string; path: string; name: string; size: number };

export async function uploadCareerFile(
  applicationRef: string,
  field: string,
  file: File,
): Promise<{ path: string; error?: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${applicationRef}/${field}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(CAREER_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { path: "", error: error.message };
  return { path };
}

export async function signedUrlFor(path: string, seconds = 300): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(CAREER_BUCKET).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

export type CareerApplication = {
  id?: string;
  application_reference: string;
  candidate_type: CandidateType;
  position_applied_for: string;
  custom_position?: string | null;
  preferred_job_location: string;
  employment_type: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  nationality?: string | null;
  mobile_number: string;
  email: string;
  current_address: string;
  city?: string | null;
  state?: string | null;
  pin_code?: string | null;
  highest_qualification: string;
  custom_qualification?: string | null;
  course_degree?: string | null;
  institution?: string | null;
  year_of_passing?: number | null;
  percentage_cgpa?: string | null;
  technical_skills?: string[] | null;
  languages_known?: string[] | null;
  total_experience_years?: number | null;
  total_experience_months?: number | null;
  current_last_company?: string | null;
  current_last_job_title?: string | null;
  current_last_salary?: string | null;
  salary_period?: string | null;
  expected_salary?: string | null;
  expected_salary_period?: string | null;
  notice_period?: string | null;
  custom_notice_period?: string | null;
  key_skills?: string[] | null;
  reason_for_leaving?: string | null;
  documents: Record<string, unknown>;
  portfolio_url?: string | null;
  declaration_confirmed: boolean;
  privacy_terms_accepted: boolean;
  application_status?: ApplicationStatus;
};

function readLocalCareerApplications(): CareerApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    return raw ? (JSON.parse(raw) as CareerApplication[]) : [];
  } catch {
    return [];
  }
}

export function saveCareerApplicationLocally(app: CareerApplication): { ok: boolean; reference?: string; error?: string } {
  if (typeof window === "undefined") {
    return { ok: false, error: "Browser storage is unavailable." };
  }
  const localApp = {
    ...app,
    id: app.id ?? `LOCAL-${app.application_reference}`,
    application_status: app.application_status ?? "New",
    submitted_at: (app as { submitted_at?: string }).submitted_at ?? new Date().toISOString(),
  } as CareerApplication;
  const existing = readLocalCareerApplications().filter(
    (row) => row.application_reference !== app.application_reference,
  );
  const next = [localApp, ...existing].slice(0, 100);
  try {
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(LOCAL_APPLICATIONS_EVENT));
    return { ok: true, reference: app.application_reference };
  } catch (error) {
    return { ok: false, error: getCareerErrorMessage(error, "Could not save application locally.") };
  }
}

export async function submitCareerApplication(
  app: CareerApplication,
): Promise<{ ok: boolean; reference?: string; error?: string }> {
  try {
    const { error } = await supabase.from("career_applications").insert({
      ...app,
      application_status: "New",
    });
    if (error) return { ok: false, error: getCareerErrorMessage(error) };
    return { ok: true, reference: app.application_reference };
  } catch (error) {
    return { ok: false, error: getCareerErrorMessage(error) };
  }
}

export async function listCareerApplications(): Promise<CareerApplication[]> {
  const localRows = readLocalCareerApplications();
  try {
    const { data, error } = await supabase
      .from("career_applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) {
      console.error("[careers] list failed:", getCareerErrorMessage(error));
      return localRows;
    }
    const remoteRows = (data ?? []) as CareerApplication[];
    const remoteRefs = new Set(remoteRows.map((row) => row.application_reference));
    return [...remoteRows, ...localRows.filter((row) => !remoteRefs.has(row.application_reference))];
  } catch (err) {
    console.error("[careers] list threw:", getCareerErrorMessage(err));
    return localRows;
  }
}

export async function updateCareerStatus(
  id: string,
  status: ApplicationStatus,
  note?: string,
) {
  if (id.startsWith("LOCAL-")) {
    const rows = readLocalCareerApplications().map((row) =>
      row.id === id ? ({ ...row, application_status: status, admin_notes: note ?? (row as { admin_notes?: string }).admin_notes } as CareerApplication) : row,
    );
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event(LOCAL_APPLICATIONS_EVENT));
    return { data: null, error: null };
  }
  const patch: Record<string, unknown> = { application_status: status };
  if (note != null) patch.admin_notes = note;
  return supabase.from("career_applications").update(patch).eq("id", id);
}

export async function deleteCareerApplication(id: string) {
  if (id.startsWith("LOCAL-")) {
    localStorage.setItem(
      LOCAL_APPLICATIONS_KEY,
      JSON.stringify(readLocalCareerApplications().filter((row) => row.id !== id)),
    );
    window.dispatchEvent(new Event(LOCAL_APPLICATIONS_EVENT));
    return { data: null, error: null };
  }
  return supabase.from("career_applications").delete().eq("id", id);
}