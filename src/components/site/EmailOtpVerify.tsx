import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, Send, ShieldCheck } from "lucide-react";

export function EmailOtpVerify({
  email,
  verified,
  onVerified,
  compact,
}: {
  email: string;
  verified: boolean;
  onVerified: () => void;
  compact?: boolean;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<"send" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSend() {
    setError(null);
    setStatusMsg(null);
    if (!isValidEmail) {
      setError("Please enter a valid email address first.");
      return;
    }
    setLoading("send");
    try {
      const res = await fetch("/api/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      setSent(true);
      setCooldown(45);
      setStatusMsg(`Verification code sent to ${email.trim()}. Please check your email inbox.`);
    } catch (e: any) {
      setError(e?.message ?? "Could not send OTP email. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleVerify() {
    setError(null);
    if (code.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setLoading("verify");
    try {
      const res = await fetch("/api/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Incorrect OTP. Please check your code and try again.");
      }
      onVerified();
    } catch (e: any) {
      setError(e?.message ?? "Verification failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (verified) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 ${compact ? "" : "mt-1"}`}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Email Verified via OTP
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? "" : "rounded-xl border border-dashed border-[#D4AF37]/60 bg-[#FFF8E1]/40 p-3"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={loading !== null || cooldown > 0 || !isValidEmail}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2E59] px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#0B2E59]/90 disabled:opacity-50"
        >
          {loading === "send" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}
          {sent ? (cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP") : "Send Email OTP"}
        </button>

        {sent && (
          <>
            <input
              value={code}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-center text-sm font-bold tracking-widest outline-none focus:border-[#D4AF37]"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading !== null || code.trim().length !== 6}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading === "verify" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Verify OTP
            </button>
          </>
        )}
      </div>

      {statusMsg && !error && (
        <p className="text-[11px] font-semibold text-emerald-700">{statusMsg}</p>
      )}

      {error && (
        <p className="text-[11px] font-semibold text-rose-600">{error}</p>
      )}

      {!sent && (
        <p className="text-[10px] text-muted-foreground">
          Click "Send Email OTP" to receive a 6-digit verification code to your email inbox via our secure mail server.
        </p>
      )}
    </div>
  );
}
