import { useState } from "react";
import { X, Mail, ShieldCheck } from "lucide-react";
import { loginByEmailOtp } from "@/lib/customer-auth";

export function CustomerAuthDialog({
  open,
  onClose,
  initialMode,
  initialPhone,
  initialEmail = "",
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: string;
  initialPhone?: string;
  initialEmail?: string;
  onAuthenticated?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-lift">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Customer Access</div>
              <h2 className="text-lg font-black text-primary">Login to your account</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <LoginPanel initialEmail={initialEmail} onDone={() => { onAuthenticated?.(); onClose(); }} />
      </div>
    </div>
  );
}

/* ─────────────── Login (Email + OTP only via SMTP) ─────────────── */
function LoginPanel({ initialEmail = "", onDone }: { initialEmail?: string; onDone: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function send() {
    setErr("");
    setStatusMsg("");
    if (!valid) return setErr("Enter a valid email address.");
    setLoading(true);
    try {
      const response = await fetch("/api/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      setSent(true);
      setStatusMsg(`Verification code sent to ${email.trim()}. Please check your inbox.`);
    } catch (e: any) {
      setErr(e?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setErr("");
    if (input.trim().length !== 6) return setErr("Please enter the 6-digit code.");
    setLoading(true);
    try {
      const response = await fetch("/api/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: input.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Incorrect OTP. Please try again.");
      }
      loginByEmailOtp(email.trim());
      onDone();
    } catch (e: any) {
      setErr(e?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <LabeledInput
        icon={Mail}
        label="Email Address"
        value={email}
        onChange={setEmail}
        type="email"
        placeholder="you@example.com"
      />
      {statusMsg && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {statusMsg}
        </p>
      )}
      {!sent ? (
        <button
          type="button"
          onClick={send}
          disabled={loading || !valid}
          className="w-full rounded-full bg-gradient-accent py-2.5 text-sm font-bold text-accent-foreground shadow-card disabled:opacity-50"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <>
          <LabeledInput
            label="Enter OTP"
            value={input}
            onChange={(v) => setInput(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={verify}
              disabled={loading || input.trim().length !== 6}
              className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              Resend
            </button>
          </div>
        </>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

function LabeledInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </label>
  );
}