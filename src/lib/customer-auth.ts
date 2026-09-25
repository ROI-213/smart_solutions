import { useEffect, useState } from "react";

const USERS_KEY = "ssg_customers_v1";
const SESSION_KEY = "ssg_customer_session_v1";
const EVENT = "ssg-customer-auth-change";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string; // 10-digit
  passwordHash?: string; // demo only — not real hashing
  createdAt: string;
  otpVerifiedAt: string;
  termsAcceptedAt?: string;
};

function uid() {
  return "CUS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Demo-only obfuscation. NOT secure. Replace with real hashing when Cloud is enabled.
function demoHash(s: string) {
  if (typeof window === "undefined") return s;
  return btoa(unescape(encodeURIComponent(`ssg:${s}`)));
}

function readUsers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(list: Customer[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function readSession(): Customer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Customer) : null;
  } catch {
    return null;
  }
}

function writeSession(c: Customer | null) {
  if (typeof window === "undefined") return;
  if (c) localStorage.setItem(SESSION_KEY, JSON.stringify(c));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function normalizePhone(p: string) {
  return p.replace(/\D/g, "").slice(-10);
}

export function getCustomerByPhone(phone: string): Customer | null {
  const n = normalizePhone(phone);
  return readUsers().find((u) => u.phone === n) ?? null;
}
export function getCustomerByEmail(email: string): Customer | null {
  const e = email.trim().toLowerCase();
  return readUsers().find((u) => u.email.toLowerCase() === e) ?? null;
}

export type SignupInput = {
  name: string;
  email: string;
  phone: string;
  password?: string; // optional email/password fallback
};

export function signupCustomer(input: SignupInput): Customer {
  const phone = normalizePhone(input.phone);
  if (phone.length !== 10) throw new Error("Enter a valid 10-digit mobile number.");
  if (!input.name.trim()) throw new Error("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new Error("Enter a valid email.");
  if (getCustomerByPhone(phone)) throw new Error("An account with this mobile number already exists. Please login.");
  if (getCustomerByEmail(input.email)) throw new Error("An account with this email already exists.");
  const now = new Date().toISOString();
  const c: Customer = {
    id: uid(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone,
    passwordHash: input.password ? demoHash(input.password) : undefined,
    createdAt: now,
    otpVerifiedAt: now,
  };
  const list = readUsers();
  list.unshift(c);
  writeUsers(list);
  writeSession(c);
  return c;
}

export function loginByEmailOtp(email: string): Customer {
  const norm = email.trim().toLowerCase();
  let c = getCustomerByEmail(norm);
  const now = new Date().toISOString();
  if (!c) {
    const namePart = norm.split("@")[0].replace(/[._+-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    c = {
      id: uid(),
      name: namePart || "Customer",
      email: norm,
      phone: "",
      createdAt: now,
      otpVerifiedAt: now,
    };
    const list = readUsers();
    list.unshift(c);
    writeUsers(list);
  } else {
    const updated = { ...c, otpVerifiedAt: now };
    const list = readUsers().map((u) => (u.id === c.id ? updated : u));
    writeUsers(list);
    c = updated;
  }
  writeSession(c);
  return c;
}

export function loginByPhoneOtp(phone: string): Customer {
  const c = getCustomerByPhone(phone);
  if (!c) throw new Error("No account found for this mobile number. Please sign up first.");
  const updated = { ...c, otpVerifiedAt: new Date().toISOString() };
  const list = readUsers().map((u) => (u.id === c.id ? updated : u));
  writeUsers(list);
  writeSession(updated);
  return updated;
}

export function loginByEmailPassword(email: string, password: string): Customer {
  const c = getCustomerByEmail(email);
  if (!c || !c.passwordHash) throw new Error("No account found. Please sign up first.");
  if (c.passwordHash !== demoHash(password)) throw new Error("Incorrect password.");
  writeSession(c);
  return c;
}

export function signOutCustomer() {
  writeSession(null);
}

export function updateCurrentCustomerPhone(phone: string) {
  const norm = normalizePhone(phone);
  if (norm.length !== 10) return;
  const current = readSession();
  if (!current) return;
  if (current.phone === norm) return;
  const updated = { ...current, phone: norm };
  const list = readUsers().map((u) => (u.id === current.id ? updated : u));
  writeUsers(list);
  writeSession(updated);
}

export function getCurrentCustomer(): Customer | null {
  return readSession();
}

export function getAllCustomers(): Customer[] {
  return readUsers().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setCustomer(getCurrentCustomer());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { customer, ready };
}

export function useAllCustomers() {
  const [list, setList] = useState<Customer[]>([]);
  useEffect(() => {
    const sync = () => setList(getAllCustomers());
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