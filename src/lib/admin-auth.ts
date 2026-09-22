const KEY = "ssg_admin_authed";
export const DEMO_EMAIL = "admin@smartsolutions.co.in";
export const DEMO_PASSWORD = "admin123";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function signInAdmin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function signOutAdmin(): void {
  sessionStorage.removeItem(KEY);
}