import { createServerFn } from "@tanstack/react-start";

// Server-only helpers ----------------------------------------------------

function normalizePhone(p: string) {
  return p.replace(/\D/g, "").slice(-10);
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function hmacSha256(secret: string, data: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(sig);
}

async function signPayload(payload: { phone: string; codeHash: string; expiresAt: number }) {
  const secret = process.env.OTP_SIGNING_SECRET ?? "dev-only-otp-secret";
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSha256(secret, body);
  return `${body}.${sig}`;
}

async function verifySignature(token: string) {
  const secret = process.env.OTP_SIGNING_SECRET ?? "dev-only-otp-secret";
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256(secret, body);
  if (expected !== sig) return null;
  try {
    const raw = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(raw) as { phone: string; codeHash: string; expiresAt: number };
  } catch {
    return null;
  }
}

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendTwilioSms(to: string, body: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!lovableKey || !twilioKey || !from) return { sent: false, reason: "twilio_not_configured" as const };
  const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: `+91${to}`, From: from, Body: body }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { sent: false, reason: `twilio_error_${res.status}: ${text.slice(0, 200)}` as const };
  }
  return { sent: true, reason: null };
}

// Server functions -------------------------------------------------------

export const sendAgentOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string }) => {
    const phone = normalizePhone(String(data?.phone ?? ""));
    if (phone.length !== 10) throw new Error("Enter a valid 10-digit mobile number.");
    return { phone };
  })
  .handler(async ({ data }) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256Hex(`${data.phone}:${code}`);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const token = await signPayload({ phone: data.phone, codeHash, expiresAt });
    const sms = await sendTwilioSms(
      data.phone,
      `Your Smart Solutions Groups verification code is ${code}. Valid for 5 minutes.`,
    );
    // If Twilio isn't configured, return the code so the demo flow still works.
    return {
      token,
      expiresAt,
      delivery: sms.sent ? "sms" : ("dev" as const),
      devCode: sms.sent ? null : code,
      note: sms.sent ? null : "SMS provider not configured. Using demo OTP shown on screen.",
    };
  });

export const verifyAgentOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string; code: string; token: string }) => {
    const phone = normalizePhone(String(data?.phone ?? ""));
    const code = String(data?.code ?? "").replace(/\D/g, "");
    const token = String(data?.token ?? "");
    if (phone.length !== 10) throw new Error("Enter a valid 10-digit mobile number.");
    if (code.length !== 6) throw new Error("Enter the 6-digit code.");
    if (!token) throw new Error("Please request a new OTP.");
    return { phone, code, token };
  })
  .handler(async ({ data }) => {
    const payload = await verifySignature(data.token);
    if (!payload) throw new Error("Invalid verification token. Please request a new OTP.");
    if (payload.phone !== data.phone) throw new Error("This code was sent to a different number.");
    if (Date.now() > payload.expiresAt) throw new Error("OTP expired. Please request a new one.");
    const expected = await sha256Hex(`${data.phone}:${data.code}`);
    if (expected !== payload.codeHash) throw new Error("Incorrect OTP. Please try again.");
    return { ok: true as const };
  });

// Customer Email OTP via SMTP --------------------------------------------

async function signEmailPayload(payload: { email: string; codeHash: string; expiresAt: number }) {
  const secret = process.env.OTP_SIGNING_SECRET ?? "dev-only-otp-secret";
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSha256(secret, body);
  return `${body}.${sig}`;
}

async function verifyEmailSignature(token: string) {
  const secret = process.env.OTP_SIGNING_SECRET ?? "dev-only-otp-secret";
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmacSha256(secret, body);
  if (expected !== sig) return null;
  try {
    const raw = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(raw) as { email: string; codeHash: string; expiresAt: number };
  } catch {
    return null;
  }
}

async function sendEmailOtpViaSmtp(toEmail: string, code: string) {
  try {
    const { sendOtpEmail } = await import("./smtp-service");
    const info = await sendOtpEmail(toEmail, code);
    return { sent: true, messageId: info.messageId, error: null };
  } catch (err: any) {
    console.error("Failed to send OTP email via SMTP:", err);
    return { sent: false, messageId: null, error: err?.message || String(err) };
  }
}

export const sendCustomerEmailOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = String(data?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256Hex(`${data.email}:${code}`);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const token = await signEmailPayload({ email: data.email, codeHash, expiresAt });
    const result = await sendEmailOtpViaSmtp(data.email, code);

    return {
      token,
      expiresAt,
      delivery: result.sent ? ("email" as const) : ("dev" as const),
      devCode: result.sent ? null : code,
      error: result.error,
    };
  });

export const verifyCustomerEmailOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; code: string; token: string }) => {
    const email = String(data?.email ?? "").trim().toLowerCase();
    const code = String(data?.code ?? "").replace(/\D/g, "");
    const token = String(data?.token ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (code.length !== 6) throw new Error("Enter the 6-digit code.");
    if (!token) throw new Error("Please request a new OTP.");
    return { email, code, token };
  })
  .handler(async ({ data }) => {
    const payload = await verifyEmailSignature(data.token);
    if (!payload) throw new Error("Invalid verification token. Please request a new OTP.");
    if (payload.email !== data.email) throw new Error("This code was sent to a different email address.");
    if (Date.now() > payload.expiresAt) throw new Error("OTP expired. Please request a new one.");
    const expected = await sha256Hex(`${data.email}:${data.code}`);
    if (expected !== payload.codeHash) throw new Error("Incorrect OTP. Please try again.");
    return { ok: true as const };
  });