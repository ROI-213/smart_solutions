import { useEffect, useState } from "react";

const AGENTS_KEY = "ssg_agents_v1";
const SESSION_KEY = "ssg_agent_session_v1";
const EVENT = "ssg-agents-change";

export const AGENT_STATUSES = ["Pending", "Approved", "Rejected", "Suspended"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const AGENT_SKILLS = [
  "Electrical",
  "Plumbing",
  "AC / Appliance",
  "Carpentry",
  "Painting",
  "Cleaning",
  "CCTV / Security",
  "Interior / Civil",
  "Pest Control",
  "Gardening",
] as const;

export const SERVICE_CATEGORIES = [
  "Cleaning", "Electrical", "Plumbing", "Interior", "Ceiling", "CCTV / Security",
  "Outdoor Services", "Gardening", "Maintenance", "Consultancy", "Appliance Repair",
  "Bathroom Plumbing", "Kitchen Plumbing", "Bedroom Wardrobe", "Other",
] as const;

export const DOCUMENT_TYPES = [
  "agent_photo", "aadhaar_card", "pan_card", "driving_licence", "voter_id",
  "current_address_proof", "permanent_address_proof", "cancelled_cheque",
  "passbook_front_page", "signed_agreement", "emergency_contact_id", "vehicle_rc",
  "vehicle_insurance", "experience_certificate", "previous_work_proof",
  "portfolio_photo", "reference_document", "other_supporting_document",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  agent_photo: "Agent Photo",
  aadhaar_card: "Aadhaar Card",
  pan_card: "PAN Card",
  driving_licence: "Driving Licence",
  voter_id: "Voter ID",
  current_address_proof: "Current Address Proof",
  permanent_address_proof: "Permanent Address Proof",
  cancelled_cheque: "Cancelled Cheque",
  passbook_front_page: "Passbook Front Page",
  signed_agreement: "Signed Agreement",
  emergency_contact_id: "Emergency Contact ID",
  vehicle_rc: "Vehicle RC",
  vehicle_insurance: "Vehicle Insurance",
  experience_certificate: "Experience Certificate",
  previous_work_proof: "Previous Work Proof",
  portfolio_photo: "Portfolio Photo",
  reference_document: "Reference Document",
  other_supporting_document: "Other Supporting Document",
};

export const DOCUMENT_STATUSES = [
  "Not Submitted", "Submitted", "Under Review", "Verified", "Rejected", "Reupload Required",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const APPROVAL_STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Blocked"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type AgentDocument = {
  id: string;
  type: DocumentType;
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
  status: DocumentStatus;
  adminNotes?: string;
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export type Agent = {
  id: string;
  // Basic
  name: string;
  phone: string;
  email: string;
  passwordHash?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string;
  address?: string;
  city?: string;
  pincode?: string;
  alternateMobile?: string;
  permanentAddress?: string;
  // ID / KYC (URLs or descriptive text; demo only)
  aadhaar?: string;
  pan?: string;
  drivingLicence?: string;
  voterId?: string;
  idProofNote?: string;
  // Bank
  bankName?: string;
  bankAccount?: string;
  ifsc?: string;
  upi?: string;
  bankHolderName?: string;
  paymentNotes?: string;
  // Work
  skills: string[];
  experienceYears?: number;
  languages?: string[];
  workingAreas?: string;
  serviceCategory?: string;
  experienceDetails?: string;
  previousWorkReference?: string;
  previousCompany?: string;
  preferredLocation?: string;
  availableHours?: string;
  toolsAvailable?: string;
  workersCount?: number;
  // Safety
  policeVerified?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  usesVehicle?: boolean;
  vehicleType?: string;
  vehicleNumber?: string;
  // Verification / lifecycle
  emailVerified?: boolean;
  mobileVerified?: boolean;
  idVerified?: boolean;
  aadhaarVerified?: boolean;
  documentStatus?: DocumentStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  adminNotes?: string;
  agentCode?: string;
  dateOfJoining?: string;
  dateOfRegistration?: string;
  approvalStatus?: ApprovalStatus;
  // Terms
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  acceptedTerms?: Record<string, boolean>;
  consentAccepted?: boolean;
  agreementAcceptanceMethod?: string;
  // Documents
  documents?: AgentDocument[];
  // Status
  status: AgentStatus;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
};

function uid() {
  return "AGT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function docUid() {
  return "DOC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function generateAgentCode() {
  return "SSG-AGT-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function demoHash(s: string) {
  if (typeof window === "undefined") return s;
  return btoa(unescape(encodeURIComponent(`ssg-agent:${s}`)));
}

function readAll(): Agent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AGENTS_KEY);
    return raw ? (JSON.parse(raw) as Agent[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Agent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(list));
  } catch (e) {
    // Quota exceeded — document dataURLs (base64) are too large for localStorage.
    // Persist metadata only so registration/updates still succeed. Previews of
    // previously-uploaded docs won't render, but files remain listed by name.
    const slim = list.map((a) => ({
      ...a,
      documents: (a.documents ?? []).map((d) => ({ ...d, dataUrl: "" })),
    }));
    try {
      localStorage.setItem(AGENTS_KEY, JSON.stringify(slim));
      // eslint-disable-next-line no-console
      console.warn("[agents-store] Storage quota hit; stored document metadata without file data.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[agents-store] Failed to save agents:", err);
      throw err;
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

function readSession(): Agent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { id: string };
    return readAll().find((a) => a.id === s.id) ?? null;
  } catch {
    return null;
  }
}

function writeSession(a: Agent | null) {
  if (typeof window === "undefined") return;
  if (a) localStorage.setItem(SESSION_KEY, JSON.stringify({ id: a.id }));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function normalizePhone(p: string) {
  return p.replace(/\D/g, "").slice(-10);
}

export function getAgentByPhone(phone: string) {
  const n = normalizePhone(phone);
  return readAll().find((a) => a.phone === n) ?? null;
}
export function getAgentByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return readAll().find((a) => a.email.toLowerCase() === e) ?? null;
}

export type AgentRegistrationInput = Omit<
  Agent,
  "id" | "status" | "createdAt" | "approvedAt" | "passwordHash"
> & { password: string };

export function registerAgent(input: AgentRegistrationInput): Agent {
  const phone = normalizePhone(input.phone);
  if (phone.length !== 10) throw new Error("Enter a valid 10-digit mobile number.");
  if (!input.name.trim()) throw new Error("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    throw new Error("Enter a valid email.");
  if (!input.password || input.password.length < 6)
    throw new Error("Password must be at least 6 characters.");
  if (getAgentByPhone(phone))
    throw new Error("An agent account already exists for this mobile number.");
  if (getAgentByEmail(input.email))
    throw new Error("An agent account already exists for this email.");
  if (!input.skills || input.skills.length === 0)
    throw new Error("Select at least one skill.");

  const agent: Agent = {
    ...input,
    id: uid(),
    phone,
    email: input.email.trim(),
    name: input.name.trim(),
    passwordHash: demoHash(input.password),
    status: "Pending",
    approvalStatus: "Pending",
    dateOfRegistration: new Date().toISOString(),
    agentCode: input.agentCode ?? generateAgentCode(),
    documentStatus: (input.documents ?? []).length > 0 ? "Submitted" : "Not Submitted",
    createdAt: new Date().toISOString(),
  };
  const list = readAll();
  list.unshift(agent);
  writeAll(list);
  writeSession(agent);
  return agent;
}

export function loginAgent(emailOrPhone: string, password: string): Agent {
  const digits = emailOrPhone.replace(/\D/g, "");
  const found =
    digits.length >= 10
      ? getAgentByPhone(emailOrPhone)
      : getAgentByEmail(emailOrPhone);
  if (!found || !found.passwordHash) throw new Error("No account found. Please register first.");
  if (found.passwordHash !== demoHash(password)) throw new Error("Incorrect password.");
  writeSession(found);
  return found;
}

export function loginAgentByPhone(phone: string): Agent {
  const found = getAgentByPhone(phone);
  if (!found) throw new Error("No Agent account found with this mobile number. Please register first.");
  updateAgent(found.id, { mobileVerified: true });
  writeSession(found);
  return { ...found, mobileVerified: true };
}

export function loginAgentByEmail(email: string): Agent {
  const norm = email.trim().toLowerCase();
  let found = getAgentByEmail(norm);
  if (!found) {
    const namePart = norm.split("@")[0].replace(/[._+-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    found = {
      id: uid(),
      name: namePart || "Partner",
      email: norm,
      phone: "",
      skills: ["Maintenance"],
      status: "Pending",
      approvalStatus: "Pending",
      documentStatus: "Not Submitted",
      dateOfRegistration: new Date().toISOString(),
      agentCode: generateAgentCode(),
      emailVerified: true,
      mobileVerified: true,
      createdAt: new Date().toISOString(),
    };
    const list = readAll();
    list.unshift(found);
    writeAll(list);
  } else {
    updateAgent(found.id, { emailVerified: true });
    found = { ...found, emailVerified: true };
  }
  writeSession(found);
  return found;
}

export function addOrReplaceDocument(
  agentId: string,
  doc: Omit<AgentDocument, "id" | "uploadedAt" | "status">,
  opts?: { multi?: boolean },
) {
  const list = readAll();
  const i = list.findIndex((a) => a.id === agentId);
  if (i < 0) return;
  const docs = list[i].documents ?? [];
  const filtered = opts?.multi ? docs : docs.filter((d) => d.type !== doc.type);
  filtered.push({ ...doc, id: docUid(), uploadedAt: new Date().toISOString(), status: "Submitted" });
  list[i] = { ...list[i], documents: filtered, documentStatus: "Submitted" };
  writeAll(list);
}

export function removeDocument(agentId: string, docId: string) {
  const list = readAll();
  const i = list.findIndex((a) => a.id === agentId);
  if (i < 0) return;
  list[i] = { ...list[i], documents: (list[i].documents ?? []).filter((d) => d.id !== docId) };
  writeAll(list);
}

export function updateDocumentStatus(agentId: string, docId: string, status: DocumentStatus, notes?: string) {
  const list = readAll();
  const i = list.findIndex((a) => a.id === agentId);
  if (i < 0) return;
  list[i] = {
    ...list[i],
    documents: (list[i].documents ?? []).map((d) =>
      d.id === docId ? { ...d, status, adminNotes: notes ?? d.adminNotes } : d,
    ),
  };
  writeAll(list);
}

export function signOutAgent() {
  writeSession(null);
}

export function getCurrentAgent(): Agent | null {
  return readSession();
}

export function getAllAgents(): Agent[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function updateAgent(id: string, patch: Partial<Agent>) {
  const list = readAll();
  const i = list.findIndex((a) => a.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  writeAll(list);
}

export function approveAgent(id: string) {
  updateAgent(id, { status: "Approved", approvedAt: new Date().toISOString(), rejectionReason: undefined });
}
export function rejectAgent(id: string, reason?: string) {
  updateAgent(id, { status: "Rejected", rejectionReason: reason });
}
export function suspendAgent(id: string) {
  updateAgent(id, { status: "Suspended" });
}
export function deleteAgent(id: string) {
  writeAll(readAll().filter((a) => a.id !== id));
}

export function useAgentAuth() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setAgent(getCurrentAgent());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { agent, ready };
}

export function useAllAgents() {
  const [list, setList] = useState<Agent[]>([]);
  useEffect(() => {
    const sync = () => setList(getAllAgents());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}